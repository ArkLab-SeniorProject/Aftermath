import { queryResolvers, typeResolvers } from './query.resolvers.js';
import { mutationResolvers } from './mutation.resolvers.js';
import { DateTimeScalar, JsonScalar } from '../scalars.js';
// recovery quiz resolvers (Census Geocoder, OpenFEMA, guest saves)
import {
  recoveryQuizMutationResolvers,
  recoveryQuizQueryResolvers,
} from './recovery-quiz.resolvers.js';

export const resolvers = {
  DateTime: DateTimeScalar,
  JSON: JsonScalar,

  Query: {
    ...queryResolvers,
    ...recoveryQuizQueryResolvers,
  },

  Mutation: {
    ...mutationResolvers,
    ...recoveryQuizMutationResolvers,
  },

  ...typeResolvers,
};
