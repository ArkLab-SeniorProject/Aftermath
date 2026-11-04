// test file - can delete after testing

import { geocodeAddress, geocodeCoordinates } from './census-geocoder.js';

console.log('--- address match ---');
const hit = await geocodeAddress('1400 John F Kennedy Blvd, Philadelphia, PA 19107');
console.log(hit);

console.log('--- no match ---');
console.log(await geocodeAddress('99999 Nowhere Lane, Atlantis, ZZ 00000'));

console.log('--- coordinates ---');
if (hit) {
  console.log(await geocodeCoordinates(hit.latitude, hit.longitude));
}

console.log('--- bad input ---');
try {
  await geocodeAddress('hi');
} catch (err) {
  console.log(`caught: ${err instanceof Error ? err.message : err}`);
}
