import { getDisasterDeclarations } from './openfema.js';

console.log('script started');

const result = await getDisasterDeclarations({ state: 'PA', limit: 2 });
console.log(JSON.stringify(result, null, 2));