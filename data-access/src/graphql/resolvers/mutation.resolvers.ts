import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';
import { createAuthToken } from '../../auth.js';
import { sendPasswordResetEmail } from '../../lib/email.js';

const BCRYPT_ROUNDS = 10;

type Context = { mongoDb: Db; userId?: string; role?: string };

function toSnakeCaseDoc(input: any, idFields: string[] = []) {
  const fieldMap: Record<string, string> = {
    firstName: 'first_name',
    email: 'email',
    passwordHash: 'password_hash',
    userId: 'user_id',
    displayName: 'display_name',
    helpTypes: 'help_types',
    homeStatus: 'home_status',
    disaster: 'disaster',
    resourceType: 'resource_type',
    guideType: 'guide_type',
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
    email: doc.email ?? null,
    firstName: doc.first_name ?? null,
    role: doc.role === 'admin' ? 'admin' : 'user',
    createdAt: doc.created_at ?? null,
    updatedAt: doc.updated_at ?? null,
  };
}

function mapSituation(doc: any) {
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
    timeline: doc.timeline ?? null,
    disasters: doc.disasters ?? null,
    displayName: doc.display_name ?? null,
    helpTypes: doc.help_types ?? null,
    homeStatus: doc.home_status ?? null,
    household: doc.household ?? [],
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
    guideType: doc.guide_type ?? null,
    createdAt: doc.created_at ?? null,
    updatedAt: doc.updated_at ?? null,
  };
}

function mapGuide(doc: any) {
  return {
    id: String(doc._id),
    userId: String(doc.user_id),
    disaster: String(doc.disaster),
    guideType: doc.guide_type,
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

function requireAdmin(ctx: Context): string {
  const userId = requireAuth(ctx);
  if (ctx.role !== 'admin') throw new Error('Administrator access required');
  return userId;
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

    const doc = toSnakeCaseDoc({
      ...input,
      passwordHash: hashedPassword,
      role: 'user',
    });

    try {
      const result = await insertAndReturn(ctx.mongoDb, 'users', doc);
      if (!result) throw new Error('Failed to create user');
      return {
        success: true,
        user: mapUser(result),
        token: createAuthToken(String(result._id)),
        error: null,
      };
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
      return { success: false, user: null, token: null, error: 'Invalid username or password' };
    }

    const storedHash = doc.password_hash ?? doc.password;
    if (!storedHash) {
      return { success: false, user: null, token: null, error: 'Invalid username or password' };
    }

    const valid = await bcrypt.compare(args.password, storedHash);
    if (!valid) {
      return { success: false, user: null, token: null, error: 'Invalid username or password' };
    }

    return {
      success: true,
      user: mapUser(doc),
      token: createAuthToken(String(doc._id)),
      error: null,
    };
  },

  updateUser: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    if (authedUserId !== args.id) throw new Error('Not authorized');

    const input = { ...args.input };
    if (input.passwordHash) {
      input.passwordHash = await bcrypt.hash(input.passwordHash, BCRYPT_ROUNDS);
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

  forgotPassword: async (_: unknown, args: { email: string }, ctx: Context) => {
    const doc = await ctx.mongoDb
      .collection('users')
      .findOne({ email: args.email.toLowerCase().trim() });
    if (!doc) return true;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await ctx.mongoDb.collection('users').updateOne(
      { _id: doc._id },
      {
        $set: {
          reset_password_token: hashedToken,
          reset_password_expires: expires,
          updated_at: new Date(),
        },
      }
    );

    try {
      await sendPasswordResetEmail(doc.email, resetToken);
    } catch (err) {
      console.error('[forgotPassword] Failed to send email:', err);
      await ctx.mongoDb.collection('users').updateOne(
        { _id: doc._id },
        {
          $unset: {
            reset_password_token: '',
            reset_password_expires: '',
          },
          $set: { updated_at: new Date() },
        }
      );
      throw new Error('Unable to send password reset email');
    }

    return true;
  },

  resetPasswordWithToken: async (
    _: unknown,
    args: { token: string; newPassword: string },
    ctx: Context
  ) => {
    if (!args.newPassword || args.newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const hashedToken = crypto.createHash('sha256').update(args.token).digest('hex');
    const doc = await ctx.mongoDb.collection('users').findOne({
      reset_password_token: hashedToken,
      reset_password_expires: { $gt: new Date() },
    });

    if (!doc) throw new Error('Invalid or expired reset link');

    const hashedPassword = await bcrypt.hash(args.newPassword, BCRYPT_ROUNDS);
    await ctx.mongoDb.collection('users').updateOne(
      { _id: doc._id },
      {
        $set: { password_hash: hashedPassword, updated_at: new Date() },
        $unset: { reset_password_token: '', reset_password_expires: '' },
      }
    );

    return true;
  },

  // ── Situations ──
  createSituation: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    const existing = await ctx.mongoDb.collection('situation').findOne({
      user_id: new ObjectId(authedUserId),
    });
    if (existing) throw new Error('A user can only have one situation');
    const input = { ...args.input, userId: authedUserId };
    const doc = toSnakeCaseDoc(input, ['userId']);
    const result = await insertAndReturn(ctx.mongoDb, 'situation', doc);
    return mapSituation(result);
  },

  updateSituation: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    await requireOwnership(ctx.mongoDb, 'situation', args.id, authedUserId);
    const fields = toSnakeCaseDoc(args.input);
    const result = await updateAndReturn(ctx.mongoDb, 'situation', args.id, fields);
    return mapSituation(result);
  },

  deleteSituation: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    await requireOwnership(ctx.mongoDb, 'situation', args.id, authedUserId);
    const result = await ctx.mongoDb
      .collection('situation')
      .deleteOne({ _id: new ObjectId(args.id) });
    return result.deletedCount > 0;
  },

  // ── Resources ──
  createResource: async (_: unknown, args: any, ctx: Context) => {
    requireAdmin(ctx);
    const doc = toSnakeCaseDoc(args.input);
    const result = await insertAndReturn(ctx.mongoDb, 'resources', doc);
    return mapResource(result);
  },

  updateResource: async (_: unknown, args: any, ctx: Context) => {
    requireAdmin(ctx);
    const fields = toSnakeCaseDoc(args.input);
    const result = await updateAndReturn(ctx.mongoDb, 'resources', args.id, fields);
    return mapResource(result);
  },

  deleteResource: async (_: unknown, args: any, ctx: Context) => {
    requireAdmin(ctx);
    const result = await ctx.mongoDb
      .collection('resources')
      .deleteOne({ _id: new ObjectId(args.id) });
    return result.deletedCount > 0;
  },

  // ── Guides ──
  createGuide: async (_: unknown, args: any, ctx: Context) => {
    const authedUserId = requireAuth(ctx);
    await requireOwnership(ctx.mongoDb, 'situation', args.input.disaster, authedUserId);
    const input = { ...args.input, userId: authedUserId };
    const existing = await ctx.mongoDb.collection('guide').findOne({
      user_id: new ObjectId(authedUserId),
      guide_type: input.guideType,
    });
    if (existing) throw new Error(`A user can only have one ${input.guideType} guide`);
    const doc = toSnakeCaseDoc(input, ['userId', 'disaster']);
    if (!doc.resources?.length && input.filters && typeof input.filters === 'object') {
      const helpTypes = input.filters.helpTypes ?? input.filters.help_types;
      const resourceTypes = Object.entries(helpTypes ?? {})
        .filter(([, enabled]) => enabled === true)
        .map(([type]) => (type === 'damage' ? 'damage-recovery' : type));
      if (resourceTypes.length) {
        const resources = await ctx.mongoDb
          .collection('resources')
          .find({
            guide_type: input.guideType,
            resource_type: { $in: resourceTypes },
          })
          .toArray();
        doc.resources = resources.map((resource: any) => ({
          resource_id: resource._id,
          progress: null,
          saved: false,
        }));
      }
    }
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
