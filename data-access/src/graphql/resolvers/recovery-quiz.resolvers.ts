// Resolvers used by the recovery quiz:
// - Census Geocoder lookups (address or ZIP -> county)
// - OpenFEMA disasters for that county
// - Guest situations: quiz answers saved without an account, reopened with a guest token

import crypto from 'node:crypto';
import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';
import { geocodeAddress, geocodeZip } from '../../census-geocoder.js';
import { getDisastersForCounty } from '../../openfema.js';
import { insertAndReturn, toSnakeCaseDoc } from './mutation.resolvers.js';
import { mapSituation } from './query.resolvers.js';
import { sanitizeSituationInput } from './situation-input.js';

type Context = { mongoDb: Db; userId?: string; role?: string };

const SITUATIONS = 'situation';

// the raw token only lives in the user's browser
// the DB keeps a SHA-256 hash, so a database leak does not let anyone open guest situations
function newGuestToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function hashGuestToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function isPlausibleToken(token: unknown): token is string {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{40,64}$/.test(token);
}

async function findGuestSituation(db: Db, token: string) {
  if (!isPlausibleToken(token)) return null;
  return db.collection(SITUATIONS).findOne({
    guest_token_hash: hashGuestToken(token),
    user_id: { $exists: false },
  });
}

// census errors (timeouts, 5xx) should not leak upstream details to the client
async function safeLookup<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    // do not log the input as it may be a home address
    console.error(`[${label}] lookup failed:`, err instanceof Error ? err.message : err);
    throw new Error('Location service is unavailable right now. Please try again.');
  }
}

export const recoveryQuizQueryResolvers = {
  geocodeAddress: async (_: unknown, args: { address: string }) => {
    const result = await safeLookup('geocodeAddress', () => geocodeAddress(args.address));
    if (!result?.countyFips) return null;
    return { ...result, precision: 'address' };
  },

  geocodeZip: async (_: unknown, args: { zip: string }) => {
    if (!/^\d{5}$/.test(args.zip?.trim() ?? '')) throw new Error('ZIP code must be 5 digits');
    const result = await safeLookup('geocodeZip', () => geocodeZip(args.zip));
    if (!result) return null;
    return { ...result, matchedAddress: null, city: null, precision: 'zip' };
  },

  getDisastersForLocation: async (
    _: unknown,
    args: { stateFips: string; countyFips: string; timeline?: string | null }
  ) => {
    const disasters = await getDisastersForCounty(args);
    return disasters.map((d) => ({
      id: d.id,
      disasterNumber: d.disasterNumber,
      title: d.title,
      incidentType: d.incidentType ?? null,
      declarationType: d.declarationType ?? null,
      incidentBeginDate: d.incidentBeginDate ?? null,
      declarationDate: d.declarationDate ?? null,
      individualAssistance: d.iaProgramDeclared,
    }));
  },

  getGuestSituation: async (_: unknown, args: { guestToken: string }, ctx: Context) => {
    const doc = await findGuestSituation(ctx.mongoDb, args.guestToken);
    return mapSituation(doc);
  },
};

export const recoveryQuizMutationResolvers = {
  saveGuestSituation: async (
    _: unknown,
    args: { input: any; guestToken?: string | null },
    ctx: Context
  ) => {
    const fields = toSnakeCaseDoc(sanitizeSituationInput(args.input));

    // update the existing guest situation when the browser still has a valid token
    if (args.guestToken) {
      const existing = await findGuestSituation(ctx.mongoDb, args.guestToken);
      if (existing) {
        await ctx.mongoDb
          .collection(SITUATIONS)
          .updateOne({ _id: existing._id }, { $set: { ...fields, updated_at: new Date() } });
        const updated = await ctx.mongoDb.collection(SITUATIONS).findOne({ _id: existing._id });
        return { situation: mapSituation(updated), guestToken: args.guestToken };
      }
      // token unknown (expired or claimed): fall through and start a new guest situation
    }

    const guestToken = newGuestToken();
    const created = await insertAndReturn(ctx.mongoDb, SITUATIONS, {
      ...fields,
      guest_token_hash: hashGuestToken(guestToken),
    });
    if (!created) throw new Error('Failed to save situation');
    return { situation: mapSituation(created), guestToken };
  },

  // called after login/sign-up
  // the newer of the two situations wins, because a user can only have one situation
  claimGuestSituation: async (_: unknown, args: { guestToken: string }, ctx: Context) => {
    if (!ctx.userId) throw new Error('Authentication required');
    const userObjectId = new ObjectId(ctx.userId);
    const situations = ctx.mongoDb.collection(SITUATIONS);

    const guest = await findGuestSituation(ctx.mongoDb, args.guestToken);
    const own = await situations.findOne({ user_id: userObjectId });
    if (!guest) return mapSituation(own);

    if (!own) {
      await situations.updateOne(
        { _id: guest._id },
        {
          $set: { user_id: userObjectId, updated_at: new Date() },
          $unset: { guest_token_hash: '' },
        }
      );
      return mapSituation(await situations.findOne({ _id: guest._id }));
    }

    const guestIsNewer = (guest.updated_at?.getTime?.() ?? 0) > (own.updated_at?.getTime?.() ?? 0);
    if (guestIsNewer) {
      const { _id, guest_token_hash, created_at, ...answers } = guest;
      await situations.updateOne(
        { _id: own._id },
        { $set: { ...answers, user_id: userObjectId, updated_at: new Date() } }
      );
    }
    await situations.deleteOne({ _id: guest._id });
    return mapSituation(await situations.findOne({ _id: own._id }));
  },
};
