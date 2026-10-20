import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';
import { mapId } from '../../db/mongoHelpers.js';

const MAX_LIMIT = 100;

type Context = { mongoDb: Db; userId?: string };

function clampLimit(limit: number): number {
  if (!limit || limit <= 0) return 25;
  return Math.min(limit, MAX_LIMIT);
}

function mapUser(doc: any) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    username: doc.username,
    firstName: doc.first_name ?? null,
    securityQuestion: doc.security_question ?? null,
    createdAt: doc.created_at ?? null,
    updatedAt: doc.updated_at ?? null,
  };
}

function mapLocation(loc: any) {
  if (!loc) return null;
  return {
    zip: loc.zip ?? null,
    city: loc.city ?? null,
    state: loc.state ?? null,
    stateCode: loc.state_code ?? null,
    countryCode: loc.country_code ?? null,
  };
}

function mapDisaster(doc: any) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    userId: String(doc.user_id),
    location: mapLocation(doc.location),
    eventOccured: doc.event_occured ?? null,
    disaster: doc.disaster ?? null,
    helpNeeded: doc.help_needed ?? null,
    homeownership: doc.homeownership ?? null,
    createdAt: doc.created_at ?? null,
    updatedAt: doc.updated_at ?? null,
  };
}

function mapResource(doc: any) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    resourceType: doc.resource_type ?? null,
    title: doc.title ?? null,
    content: doc.content ?? null,
    createdAt: doc.created_at ?? null,
    updatedAt: doc.updated_at ?? null,
  };
}

function mapGuideResource(item: any) {
  return {
    resourceId: String(item.resource_id),
    progress: item.progress ?? null,
    saved: item.saved ?? false,
  };
}

function mapGuide(doc: any) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    userId: String(doc.user_id),
    disasterId: String(doc.disaster),
    resources: (doc.resources ?? []).map(mapGuideResource),
    filters: doc.filters ?? null,
    createdAt: doc.created_at ?? null,
    updatedAt: doc.updated_at ?? null,
  };
}

export const queryResolvers = {
  // ── Users ──
  getUser: async (_: unknown, args: { id: string }, ctx: Context) => {
    const doc = await ctx.mongoDb.collection('users').findOne({ _id: new ObjectId(args.id) });
    return mapUser(doc);
  },

  getUserByUsername: async (_: unknown, args: { username: string }, ctx: Context) => {
    const doc = await ctx.mongoDb.collection('users').findOne({ username: args.username });
    return mapUser(doc);
  },

  getSecurityQuestion: async (_: unknown, args: { username: string }, ctx: Context) => {
    const doc = await ctx.mongoDb.collection('users').findOne({ username: args.username });
    return doc?.security_question ?? null;
  },

  getUsers: async (_: unknown, args: { limit: number; offset: number }, ctx: Context) => {
    const docs = await ctx.mongoDb
      .collection('users')
      .find()
      .skip(args.offset)
      .limit(clampLimit(args.limit))
      .toArray();
    return docs.map(mapUser);
  },

  // ── Disasters ──
  getDisaster: async (_: unknown, args: { id: string }, ctx: Context) => {
    const doc = await ctx.mongoDb.collection('disaster').findOne({ _id: new ObjectId(args.id) });
    return mapDisaster(doc);
  },

  getDisastersByUser: async (_: unknown, args: { userId: string }, ctx: Context) => {
    if (!ctx.userId) throw new Error('Authentication required');
    if (ctx.userId !== args.userId) throw new Error('Not authorized');
    const docs = await ctx.mongoDb
      .collection('disaster')
      .find({ user_id: new ObjectId(args.userId) })
      .toArray();
    return docs.map(mapDisaster);
  },

  // ── Resources ──
  getResource: async (_: unknown, args: { id: string }, ctx: Context) => {
    const doc = await ctx.mongoDb.collection('resources').findOne({ _id: new ObjectId(args.id) });
    return mapResource(doc);
  },

  getResources: async (
    _: unknown,
    args: { resourceType?: string; limit: number; offset: number },
    ctx: Context
  ) => {
    const filter: any = {};
    if (args.resourceType) filter.resource_type = args.resourceType;

    const docs = await ctx.mongoDb
      .collection('resources')
      .find(filter)
      .skip(args.offset)
      .limit(clampLimit(args.limit))
      .toArray();
    return docs.map(mapResource);
  },

  // ── Guides ──
  getGuide: async (_: unknown, args: { id: string }, ctx: Context) => {
    const doc = await ctx.mongoDb.collection('guide').findOne({ _id: new ObjectId(args.id) });
    return mapGuide(doc);
  },

  getGuidesByUser: async (_: unknown, args: { userId: string }, ctx: Context) => {
    if (!ctx.userId) throw new Error('Authentication required');
    if (ctx.userId !== args.userId) throw new Error('Not authorized');
    const docs = await ctx.mongoDb
      .collection('guide')
      .find({ user_id: new ObjectId(args.userId) })
      .toArray();
    return docs.map(mapGuide);
  },

  getGuideByDisaster: async (_: unknown, args: { disasterId: string }, ctx: Context) => {
    const doc = await ctx.mongoDb
      .collection('guide')
      .findOne({ disaster: new ObjectId(args.disasterId) });
    return mapGuide(doc);
  },
};

// Field resolvers for nested relations
export const typeResolvers = {
  Disaster: {
    user: async (parent: any, _: unknown, ctx: Context) => {
      const doc = await ctx.mongoDb
        .collection('users')
        .findOne({ _id: new ObjectId(parent.userId) });
      return mapUser(doc);
    },
  },

  Guide: {
    user: async (parent: any, _: unknown, ctx: Context) => {
      const doc = await ctx.mongoDb
        .collection('users')
        .findOne({ _id: new ObjectId(parent.userId) });
      return mapUser(doc);
    },
    disaster: async (parent: any, _: unknown, ctx: Context) => {
      const doc = await ctx.mongoDb
        .collection('disaster')
        .findOne({ _id: new ObjectId(parent.disasterId) });
      return mapDisaster(doc);
    },
  },

  GuideResource: {
    resource: async (parent: any, _: unknown, ctx: Context) => {
      const doc = await ctx.mongoDb
        .collection('resources')
        .findOne({ _id: new ObjectId(parent.resourceId) });
      return mapResource(doc);
    },
  },
};
