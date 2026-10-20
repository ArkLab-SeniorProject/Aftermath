import { queryResolvers, typeResolvers } from './query.resolvers.js';
import { mutationResolvers } from './mutation.resolvers.js';
import { DateTimeScalar, JsonScalar } from '../scalars.js';

export const resolvers = {
  DateTime: DateTimeScalar,
  JSON: JsonScalar,

  Query: {
    ...queryResolvers,
  },

  Mutation: {
    ...mutationResolvers,
  },

  ...typeResolvers,
};
