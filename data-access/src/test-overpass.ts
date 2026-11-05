// test file for overpass api

import { geocodeAddress } from './census-geocoder.js';
import { findResources } from './overpass.js';

const address = process.argv[2] ?? '1400 John F Kennedy Blvd, Philadelphia, PA 19107';
const radiusKm = Number(process.argv[3] ?? 5);
if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
  throw new Error('radius must be a positive number of kilometers');
}

const place = await geocodeAddress(address);
if (!place) {
  console.log('Address not found. Include a street, city, and state or ZIP.');
  process.exit(1);
}
console.log(`${place.matchedAddress}  (searching within ${radiusKm} km)\n`);
const center = {
  latitude: place.latitude,
  longitude: place.longitude,
  radiusMeters: radiusKm * 1000,
};

console.log('--- all categories ---');
let started = Date.now();
const all = await findResources(center);
console.log(`${all.length} results in ${Date.now() - started} ms`);

const counts = new Map<string, number>();
for (const resource of all) {
  counts.set(resource.category, (counts.get(resource.category) ?? 0) + 1);
}
console.table([...counts.entries()].map(([category, count]) => ({ category, count })));

console.log('Nearest 10:');
console.table(
  all.slice(0, 10).map((r) => ({
    category: r.category,
    name: r.name,
    km: (r.distanceMeters / 1000).toFixed(2),
    phone: r.phone ?? '',
    hours: r.openingHours ?? '',
  }))
);

console.log('\n--- same request again (should come from the cache) ---');
started = Date.now();
const again = await findResources(center);
console.log(`${again.length} results in ${Date.now() - started} ms`);

console.log('\n--- hospitals only ---');
const hospitals = await findResources({ ...center, categories: ['hospital'] });
console.table(
  hospitals.slice(0, 5).map((h) => ({
    name: h.name,
    km: (h.distanceMeters / 1000).toFixed(2),
    address: h.address ?? '',
    emergencyCare: h.hasEmergencyCare ? 'yes' : 'not stated',
    phone: h.phone ?? '',
  }))
);
