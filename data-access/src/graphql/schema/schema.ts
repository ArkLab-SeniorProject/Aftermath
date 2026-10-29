import { gql } from 'graphql-tag';

export const schema = gql`
  scalar DateTime
  scalar JSON

  # ── User ──────────────────────────────────
  type User {
    id: ID!
    username: String!
    email: String
    firstName: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type AuthPayload {
    success: Boolean!
    user: User
    token: String
    error: String
  }

  input CreateUserInput {
    username: String!
    email: String!
    firstName: String
    passwordHash: String!
  }

  input UpdateUserInput {
    username: String
    email: String
    firstName: String
    passwordHash: String
  }

  # ── Location ────────────────────────────
  type Location {
    zip: String
    city: String
    state: String
    stateCode: String
    countryCode: String
  }

  input LocationInput {
    zip: String
    city: String
    state: String
    stateCode: String
    countryCode: String
  }

  enum GuideType {
    recovery
    preparedness
  }

  # ── Situation ───────────────────────────
  type HelpTypes {
    housing: Boolean
    financial: Boolean
    damage: Boolean
  }

  input HelpTypesInput {
    housing: Boolean
    financial: Boolean
    damage: Boolean
  }

  type Situation {
    id: ID!
    userId: ID!
    location: Location
    timeline: String
    disasters: String
    displayName: String
    helpTypes: HelpTypes
    homeStatus: String
    household: [String!]
    createdAt: DateTime
    updatedAt: DateTime
    user: User
  }

  input CreateSituationInput {
    location: LocationInput
    timeline: String
    disasters: String
    displayName: String
    helpTypes: HelpTypesInput
    homeStatus: String
    household: [String!]
  }

  input UpdateSituationInput {
    location: LocationInput
    timeline: String
    disasters: String
    displayName: String
    helpTypes: HelpTypesInput
    homeStatus: String
    household: [String!]
  }

  # ── Resource ─────────────────────────────
  type Resource {
    id: ID!
    resourceType: String
    title: String
    content: JSON
    guideType: GuideType
    createdAt: DateTime
    updatedAt: DateTime
  }

  input CreateResourceInput {
    resourceType: String!
    title: String!
    content: JSON
    guideType: GuideType!
  }

  input UpdateResourceInput {
    resourceType: String
    title: String
    content: JSON
    guideType: GuideType
  }

  # ── Guide ────────────────────────────────
  type GuideResource {
    resourceId: ID!
    progress: JSON
    saved: Boolean
    resource: Resource
  }

  input GuideResourceInput {
    resourceId: ID!
    progress: JSON
    saved: Boolean
  }

  type Guide {
    id: ID!
    userId: ID!
    disaster: ID!
    guideType: GuideType!
    resources: [GuideResource!]
    filters: JSON
    createdAt: DateTime
    updatedAt: DateTime
    user: User
  }

  input CreateGuideInput {
    userId: ID!
    disaster: ID!
    guideType: GuideType!
    resources: [GuideResourceInput!]
    filters: JSON
  }

  input UpdateGuideInput {
    resources: [GuideResourceInput!]
    filters: JSON
  }

  # ── Queries & Mutations ──────────────────
  type Query {
    # Users
    getUser(id: ID!): User
    getUserByUsername(username: String!): User
    getUsers(limit: Int = 25, offset: Int = 0): [User!]!
    validateResetToken(token: String!): Boolean!

    # Situations
    getSituation(id: ID!): Situation
    getSituationsByUser(userId: ID!): [Situation!]!

    # Resources
    getResource(id: ID!): Resource
    getResources(resourceType: String, guideType: GuideType, limit: Int = 25, offset: Int = 0): [Resource!]!

    # Guides
    getGuide(id: ID!): Guide
    getGuidesByUser(userId: ID!): [Guide!]!
    getGuideByDisaster(disaster: ID!): Guide
  }

  type Mutation {
    # Users
    createUser(input: CreateUserInput!): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    forgotPassword(email: String!): Boolean!
    resetPasswordWithToken(token: String!, newPassword: String!): Boolean!

    # Situations
    createSituation(input: CreateSituationInput!): Situation!
    updateSituation(id: ID!, input: UpdateSituationInput!): Situation!
    deleteSituation(id: ID!): Boolean!

    # Resources
    createResource(input: CreateResourceInput!): Resource!
    updateResource(id: ID!, input: UpdateResourceInput!): Resource!
    deleteResource(id: ID!): Boolean!

    # Guides
    createGuide(input: CreateGuideInput!): Guide!
    updateGuide(id: ID!, input: UpdateGuideInput!): Guide!
    deleteGuide(id: ID!): Boolean!
  }
`;
