// cleans situation input before it is saved (shared by user and guest mutations)

const COORD_DECIMALS = 2; // ~1.1 km. Enough for "resources near you", not a home address

function roundCoord(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  const factor = 10 ** COORD_DECIMALS;
  return Math.round(value * factor) / factor;
}

export function sanitizeSituationInput<T extends { location?: any }>(input: T): T {
  if (!input?.location) return input;
  // never store a street address, even if a client sends one in another field
  const { matchedAddress, street, ...rest } = input.location;
  const location = {
    ...rest,
    latitude: roundCoord(rest.latitude),
    longitude: roundCoord(rest.longitude),
  };
  return { ...input, location };
}
