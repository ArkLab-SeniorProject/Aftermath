import { gql } from 'graphql-tag';

export const schema = gql`
  scalar DateTime
  scalar JSON

  # ── User ──────────────────────────────────
  type User {
    id: ID!
    username: String!
    firstName: String
    securityQuestion: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type AuthPayload {
    success: Boolean!
    user: User
    error: String
  }

  input CreateUserInput {
    username: String!
    firstName: String
    passwordHash: String!
    securityQuestion: String!
    securityAnswer: String!
  }

  input UpdateUserInput {
    username: String
    firstName: String
    passwordHash: String
    securityQuestion: String
    securityAnswer: String
  }

  # ── Location (embedded in Disaster) ──────
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

  # ── Disaster ─────────────────────────────
  type HelpNeeded {
    housing: Boolean
    financial: Boolean
    damage: Boolean
  }

  input HelpNeededInput {
    housing: Boolean
    financial: Boolean
    damage: Boolean
  }

  type Disaster {
    id: ID!
    userId: ID!
    location: Location
    eventOccured: String
    disaster: JSON
    helpNeeded: HelpNeeded
    homeownership: String
    createdAt: DateTime
    updatedAt: DateTime
    user: User
  }

  input CreateDisasterInput {
    userId: ID!
    location: LocationInput
    eventOccured: String
    disaster: JSON
    helpNeeded: HelpNeededInput
    homeownership: String
  }

  input UpdateDisasterInput {
    location: LocationInput
    eventOccured: String
    disaster: JSON
    helpNeeded: HelpNeededInput
    homeownership: String
  }

  # ── Resource ─────────────────────────────
  type Resource {
    id: ID!
    resourceType: String
    title: String
    content: JSON
    createdAt: DateTime
    updatedAt: DateTime
  }

  input CreateResourceInput {
    resourceType: String!
    title: String!
    content: JSON
  }

  input UpdateResourceInput {
    resourceType: String
    title: String
    content: JSON
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
    disasterId: ID!
    resources: [GuideResource!]
    filters: JSON
    createdAt: DateTime
    updatedAt: DateTime
    user: User
    disaster: Disaster
  }

  input CreateGuideInput {
    userId: ID!
    disasterId: ID!
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
    getSecurityQuestion(username: String!): String

    # Disasters
    getDisaster(id: ID!): Disaster
    getDisastersByUser(userId: ID!): [Disaster!]!

    # Resources
    getResource(id: ID!): Resource
    getResources(resourceType: String, limit: Int = 25, offset: Int = 0): [Resource!]!

    # Guides
    getGuide(id: ID!): Guide
    getGuidesByUser(userId: ID!): [Guide!]!
    getGuideByDisaster(disasterId: ID!): Guide
  }

  type Mutation {
    # Users
    createUser(input: CreateUserInput!): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    resetPassword(username: String!, securityAnswer: String!, newPassword: String!): Boolean!

    # Disasters
    createDisaster(input: CreateDisasterInput!): Disaster!
    updateDisaster(id: ID!, input: UpdateDisasterInput!): Disaster!
    deleteDisaster(id: ID!): Boolean!

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
