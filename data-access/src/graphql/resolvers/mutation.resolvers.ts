import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;
const MAX_RESET_ATTEMPTS = 5;
const RESET_WINDOW_MS = 15 * 60 * 1000;

const resetAttempts = new Map<string, { count: number; firstAttempt: number }>();

function checkResetRateLimit(username: string): boolean {
  const now = Date.now();
  const entry = resetAttempts.get(username);
  if (entry && now - entry.firstAttempt < RESET_WINDOW_MS) {
    if (entry.count >= MAX_RESET_ATTEMPTS) return false;
    entry.count++;
    return true;
  }
  resetAttempts.set(username, { count: 1, firstAttempt: now });
  return true;
}

type Context = { mongoDb: Db; userId?: string };

function toSnakeCaseDoc(input: any, idFields: string[] = []) {
  const fieldMap: Record<string, string> = {
    firstName: 'first_name',
    passwordHash: 'password_hash',
    userId: 'user_id',
    eventOccured: 'event_occured',
    helpNeeded: 'help_needed',
    resourceType: 'resource_type',
    securityQuestion: 'security_question',
    securityAnswer: 'security_answer',
    disasterId: 'disaster',
    stateCode: 'state_code',
    countryCode: 'country_code',
  };

  const doc: any = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;

    const dbKey = fieldMap[key] ?? key;

    if (idFields.includes(key) && typeof value === 'string') {
      doc[dbKey] = new ObjectId(value);
    } else if (dbKey === 'location' && typeof value === 'object' && value !== null) {
      doc[dbKey] = toSnakeCaseDoc(value);
    } else if (dbKey === 'resources' && Array.isArray(value)) {
      doc[dbKey] = value.map((r: any) => ({
        resource_id: new ObjectId(r.resourceId),
        progress: r.progress ?? null,
        saved: r.saved ?? false,
      }));
    } else {
      doc[dbKey] = value;
    }
  }
  return doc;
}

async function insertAndReturn(db: Db, collectionName: string, doc: any) {
  const now = new Date();
  const fullDoc = { ...doc, created_at: now, updated_at: now };
  const result = await db.collection(collectionName).insertOne(fullDoc);
  return db.collection(collectionName).findOne({ _id: result.insertedId });
}

async function updateAndReturn(db: Db, collectionName: string, id: string, fields: any) {
  const setFields = { ...fields, updated_at: new Date() };
  await db.collection(collectionName).updateOne({ _id: new ObjectId(id) }, { $set: setFields });
  return db.collection(collectionName).findOne({ _id: new ObjectId(id) });
}

function mapUser(doc: any) {
  return {
    id: String(doc._id),
    username: doc.username,
    firstName: doc.first_name ?? null,
    securityQuestion: doc.security_question ?? null,
    createdAt: doc.created_at ?? null,
    updatedAt: doc.updated_at ?? null,
  };
}

function mapDisaster(doc: any) {
  return {
    id: String(doc._id),
    userId: String(doc.user_id),
    location: doc.location
      ? {
          zip: doc.location.zip ?? null,
          city: doc.location.city ?? null,
          state: doc.location.state ?? null,
          stateCode: doc.location.state_code ?? null,
          countryCode: doc.location.country_code ?? null,
        }
      : null,
    eventOccured: doc.event_occured ?? null,
    disaster: doc.disaster ?? null,
    helpNeeded: doc.help_needed ?? null,
    homeownership: doc.homeownership ?? null,
    createdAt: doc.created_at ?? null,
    updatedAt: doc.updated_at ?? null,
  };
}

function mapResource(doc: any) {
  return {
    id: String(doc._id),
    resourceType: doc.resource_type ?? null,
    title: doc.title ?? null,
    content: doc.content ?? null,
    createdAt: doc.created_at ?? null,
    updatedAt: doc.updated_at ?? null,
  };
}

function mapGuide(doc: any) {
  return {
    id: String(doc._id),
    userId: String(doc.user_id),
    disasterId: String(doc.disaster),
    resources: (doc.resources ?? []).map((r: any) => ({
      resourceId: String(r.resource_id),
      progress: r.progress ?? null,
      saved: r.saved ?? false,
    })),
    filters: doc.filters ?? null,
    createdAt: doc.created_at ?? null,
    updatedAt: doc.updated_at ?? null,
  };
}

function requireAuth(ctx: Context): string {
  if (!ctx.userId) throw new Error('Authentication required');
  return ctx.userId;
}

async function requireOwnership(db: Db, collection: string, recordId: string, userId: string) {
  const doc = await db.collection(collection).findOne({ _id: new ObjectId(recordId) });
  if (!doc) throw new Error('Record not found');
  const ownerId = String(doc.user_id ?? doc._id);
  if (ownerId !== userId) throw new Error('Not authorized');
  return doc;
}

export const mutationResolvers = {
  // ── Users ──
  createUser: async (_: unknown, args: any, ctx: Context) => {
    const input = args.input;
    const existing = await ctx.mongoDb.collection('users').findOne({ username: input.username });
    if (existing) {
      return { success: false, user: null, error: 'Username already taken' };
    }

    const hashedPassword = await bcrypt.hash(input.passwordHash, BCRYPT_ROUNDS);
    const hashedAnswer = await bcrypt.hash(
      (input.securityAnswer ?? '').toLowerCase().trim(),
      BCRYPT_ROUNDS
    );

    const doc = toSnakeCaseDoc({
      ...input,
      passwordHash: hashedPassword,
      securityAnswer: hashedAnswer,
    });

    try {
      const result = await insertAndReturn(ctx.mongoDb, 'users', doc);
      return { success: true, user: mapUser(result), error: null };
    } catch (err: any) {
      if (err.code === 11000) {
        return { success: false, user: null, error: 'Username already taken' };
      }
      throw err;
    }
  },

  login: async (_: unknown, args: { username: string; password: string }, ctx: Context) => {
    const doc = await ctx.mongoDb.collection('users').findOne({ username: args.username });
    if (!doc) {
      return { success: false, user: null, error: 'Invalid username or password' };
    }

    const storedHash = doc.password_hash ?? doc.password;
    if (!storedHash) {
      return { success: false, user: null, error: 'Invalid username or password' };
    }

    const valid = await bcrypt.compare(args.password, storedHash);
    if (!valid) {
      return { success: false, user: null, error: 'Invalid username or password' };
    }

    return { success: true, user: mapUser(doc), error: null };
  },

  updateUser: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    if (authedUserId !== args.id) throw new Error('Not authorized');

    const input = { ...args.input };
    if (input.passwordHash) {
      input.passwordHash = await bcrypt.hash(input.passwordHash, BCRYPT_ROUNDS);
    }
    if (input.securityAnswer) {
      input.securityAnswer = await bcrypt.hash(
        input.securityAnswer.toLowerCase().trim(),
        BCRYPT_ROUNDS
      );
    }

    const fields = toSnakeCaseDoc(input);
    const result = await updateAndReturn(ctx.mongoDb, 'users', args.id, fields);
    return mapUser(result);
  },

  deleteUser: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    if (authedUserId !== args.id) throw new Error('Not authorized');

    const result = await ctx.mongoDb.collection('users').deleteOne({ _id: new ObjectId(args.id) });
    return result.deletedCount > 0;
  },

  resetPassword: async (_: unknown, args: any, ctx: Context) => {
    if (!args.securityAnswer || !args.securityAnswer.trim()) return false;
    if (!args.newPassword || !args.newPassword.trim()) return false;
    if (!checkResetRateLimit(args.username)) {
      throw new Error('Too many reset attempts. Try again later.');
    }

    const doc = await ctx.mongoDb.collection('users').findOne({ username: args.username });
    if (!doc) return false;

    const storedAnswer = doc.security_answer;
    if (!storedAnswer) return false;

    const providedAnswer = args.securityAnswer.toLowerCase().trim();
    const valid = await bcrypt.compare(providedAnswer, storedAnswer);
    if (!valid) return false;

    const hashedPassword = await bcrypt.hash(args.newPassword, BCRYPT_ROUNDS);
    await ctx.mongoDb
      .collection('users')
      .updateOne(
        { _id: doc._id },
        { $set: { password_hash: hashedPassword, updated_at: new Date() } }
      );
    return true;
  },

  // ── Disasters ──
  createDisaster: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    const input = { ...args.input, userId: authedUserId };
    const doc = toSnakeCaseDoc(input, ['userId']);
    const result = await insertAndReturn(ctx.mongoDb, 'disaster', doc);
    return mapDisaster(result);
  },

  updateDisaster: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    await requireOwnership(ctx.mongoDb, 'disaster', args.id, authedUserId);
    const fields = toSnakeCaseDoc(args.input);
    const result = await updateAndReturn(ctx.mongoDb, 'disaster', args.id, fields);
    return mapDisaster(result);
  },

  deleteDisaster: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    await requireOwnership(ctx.mongoDb, 'disaster', args.id, authedUserId);
    const result = await ctx.mongoDb
      .collection('disaster')
      .deleteOne({ _id: new ObjectId(args.id) });
    return result.deletedCount > 0;
  },

  // ── Resources ──
  createResource: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx);
    const doc = toSnakeCaseDoc(args.input);
    const result = await insertAndReturn(ctx.mongoDb, 'resources', doc);
    return mapResource(result);
  },

  updateResource: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx);
    const fields = toSnakeCaseDoc(args.input);
    const result = await updateAndReturn(ctx.mongoDb, 'resources', args.id, fields);
    return mapResource(result);
  },

  deleteResource: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx);
    const result = await ctx.mongoDb
      .collection('resources')
      .deleteOne({ _id: new ObjectId(args.id) });
    return result.deletedCount > 0;
  },

  // ── Guides ──
  createGuide: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    const input = { ...args.input, userId: authedUserId };
    const doc = toSnakeCaseDoc(input, ['userId', 'disasterId']);
    const result = await insertAndReturn(ctx.mongoDb, 'guide', doc);
    return mapGuide(result);
  },

  updateGuide: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    await requireOwnership(ctx.mongoDb, 'guide', args.id, authedUserId);
    const fields = toSnakeCaseDoc(args.input);
    const result = await updateAndReturn(ctx.mongoDb, 'guide', args.id, fields);
    return mapGuide(result);
  },

  deleteGuide: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    await requireOwnership(ctx.mongoDb, 'guide', args.id, authedUserId);
    const result = await ctx.mongoDb.collection('guide').deleteOne({ _id: new ObjectId(args.id) });
    return result.deletedCount > 0;
  },
};
