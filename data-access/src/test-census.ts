// test file - can delete after testing

// added geocodeZip
import { geocodeAddress, geocodeCoordinates, geocodeZip } from './census-geocoder.js';

console.log('--- address match ---');
const hit = await geocodeAddress('1400 John F Kennedy Blvd, Philadelphia, PA 19107');
console.log(hit);

console.log('--- no match ---');
console.log(await geocodeAddress('99999 Nowhere Lane, Atlantis, ZZ 00000'));

console.log('--- coordinates ---');
if (hit) {
  console.log(await geocodeCoordinates(hit.latitude, hit.longitude));
}

// new edits
console.log('--- ZIP only (TIGERweb -> coordinates) ---');
console.log(await geocodeZip('19107'));
console.log(await geocodeZip('00000')); // not a ZIP area -> null

console.log('--- bad input ---');
try {
  await geocodeAddress('hi');
} catch (err) {
  console.log(`caught: ${err instanceof Error ? err.message : err}`);
}
