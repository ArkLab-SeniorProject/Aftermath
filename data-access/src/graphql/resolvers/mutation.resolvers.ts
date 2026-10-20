import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';

type Context = { mongoDb: Db };

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
    passwordHash: doc.password_hash ?? doc.password ?? null,
    securityQuestion: doc.security_question ?? null,
    securityAnswer: doc.security_answer ?? null,
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

export const mutationResolvers = {
  // ── Users ──
  createUser: async (_: unknown, args: any, ctx: Context) => {
    const doc = toSnakeCaseDoc(args.input);
    const result = await insertAndReturn(ctx.mongoDb, 'users', doc);
    return mapUser(result);
  },

  updateUser: async (_: unknown, args: any, ctx: Context) => {
    const fields = toSnakeCaseDoc(args.input);
    const result = await updateAndReturn(ctx.mongoDb, 'users', args.id, fields);
    return mapUser(result);
  },

  deleteUser: async (_: unknown, args: any, ctx: Context) => {
    const result = await ctx.mongoDb.collection('users').deleteOne({ _id: new ObjectId(args.id) });
    return result.deletedCount > 0;
  },

  resetPassword: async (_: unknown, args: any, ctx: Context) => {
    const doc = await ctx.mongoDb.collection('users').findOne({ username: args.username });
    if (!doc) return false;

    const storedAnswer = (doc.security_answer ?? '').toLowerCase().trim();
    const providedAnswer = (args.securityAnswer ?? '').toLowerCase().trim();
    if (storedAnswer !== providedAnswer) return false;

    await ctx.mongoDb
      .collection('users')
      .updateOne(
        { _id: doc._id },
        { $set: { password_hash: args.newPassword, updated_at: new Date() } }
      );
    return true;
  },

  // ── Disasters ──
  createDisaster: async (_: unknown, args: any, ctx: Context) => {
    const doc = toSnakeCaseDoc(args.input, ['userId']);
    const result = await insertAndReturn(ctx.mongoDb, 'disaster', doc);
    return mapDisaster(result);
  },

  updateDisaster: async (_: unknown, args: any, ctx: Context) => {
    const fields = toSnakeCaseDoc(args.input);
    const result = await updateAndReturn(ctx.mongoDb, 'disaster', args.id, fields);
    return mapDisaster(result);
  },

  deleteDisaster: async (_: unknown, args: any, ctx: Context) => {
    const result = await ctx.mongoDb
      .collection('disaster')
      .deleteOne({ _id: new ObjectId(args.id) });
    return result.deletedCount > 0;
  },

  // ── Resources ──
  createResource: async (_: unknown, args: any, ctx: Context) => {
    const doc = toSnakeCaseDoc(args.input);
    const result = await insertAndReturn(ctx.mongoDb, 'resources', doc);
    return mapResource(result);
  },

  updateResource: async (_: unknown, args: any, ctx: Context) => {
    const fields = toSnakeCaseDoc(args.input);
    const result = await updateAndReturn(ctx.mongoDb, 'resources', args.id, fields);
    return mapResource(result);
  },

  deleteResource: async (_: unknown, args: any, ctx: Context) => {
    const result = await ctx.mongoDb
      .collection('resources')
      .deleteOne({ _id: new ObjectId(args.id) });
    return result.deletedCount > 0;
  },

  // ── Guides ──
  createGuide: async (_: unknown, args: any, ctx: Context) => {
    const doc = toSnakeCaseDoc(args.input, ['userId', 'disasterId']);
    const result = await insertAndReturn(ctx.mongoDb, 'guide', doc);
    return mapGuide(result);
  },

  updateGuide: async (_: unknown, args: any, ctx: Context) => {
    const fields = toSnakeCaseDoc(args.input);
    const result = await updateAndReturn(ctx.mongoDb, 'guide', args.id, fields);
    return mapGuide(result);
  },

  deleteGuide: async (_: unknown, args: any, ctx: Context) => {
    const result = await ctx.mongoDb.collection('guide').deleteOne({ _id: new ObjectId(args.id) });
    return result.deletedCount > 0;
  },
};
