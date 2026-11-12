import { gql } from 'graphql-tag';

export const schema = gql`
  scalar DateTime
  scalar JSON

  enum UserRole {
    user
    admin
  }

  # ── User ──────────────────────────────────
  type User {
    id: ID!
    username: String!
    email: String
    firstName: String
    role: UserRole!
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
    # NEW: geocoded fields (Tiff, tiff-branch-2)
    # From the Census Geocoder. The street address itself is never stored.
    stateFips: String
    countyFips: String
    countyName: String
    latitude: Float # rounded to ~1 km before saving
    longitude: Float
    precision: LocationPrecision
  }

  input LocationInput {
    zip: String
    city: String
    state: String
    stateCode: String
    countryCode: String
    # NEW: geocoded fields (Tiff, tiff-branch-2)
    # From the Census Geocoder. The street address itself is never stored.
    stateFips: String
    countyFips: String
    countyName: String
    latitude: Float # rounded to ~1 km before saving
    longitude: Float
    precision: LocationPrecision
  }

  # NEW: LocationPrecision, GeocodeResult, DisasterOption (recovery quiz)
  enum LocationPrecision {
    address
    zip
  }

  # Result of a Census Geocoder lookup (not saved by itself)
  type GeocodeResult {
    matchedAddress: String
    zip: String
    city: String
    stateCode: String
    stateFips: String
    countyFips: String
    countyName: String
    latitude: Float!
    longitude: Float!
    precision: LocationPrecision!
  }

  # A FEMA disaster declaration that covers the user's county
  type DisasterOption {
    id: ID! # ex: "DR-4883-PA"
    disasterNumber: Int!
    title: String!
    incidentType: String
    declarationType: String
    incidentBeginDate: DateTime
    declarationDate: DateTime
    individualAssistance: Boolean!
  }

  enum GuideType {
    recovery
    preparedness
  }

  # ── Situation ───────────────────────────
  type Situation {
    id: ID!
    # CHANGED: was ID! (guest situations have no user)
    userId: ID # null for guest situations
    location: Location
    timeline: String
    disaster: String
    helpTypes: [String!]!
    helpDetails: [String!]!
    insurance: [String!]!
    homeStatus: String
    primaryResidence: Boolean
    household: [String!]
    femaApplied: Boolean
    createdAt: DateTime
    updatedAt: DateTime
    user: User
  }

  input CreateSituationInput {
    location: LocationInput
    timeline: String
    disaster: String
    helpTypes: [String!]
    helpDetails: [String!]
    insurance: [String!]
    homeStatus: String
    primaryResidence: Boolean
    household: [String!]
    femaApplied: Boolean
  }

  input UpdateSituationInput {
    location: LocationInput
    timeline: String
    disaster: String
    helpTypes: [String!]
    helpDetails: [String!]
    insurance: [String!]
    homeStatus: String
    primaryResidence: Boolean
    household: [String!]
    femaApplied: Boolean
  }

  # NEW
  type GuestSituationPayload {
    situation: Situation!
    # Secret that lets this browser reopen the guest situation. Store it; it is not shown again.
    guestToken: String!
  }

  # ── Resource ─────────────────────────────
  type Resource {
    id: ID!
    resourceType: String
    title: String
    content: JSON
    tags: JSON
    sourceUrl: String
    lastChecked: DateTime
    sectionGates: JSON
    guideType: GuideType
    createdAt: DateTime
    updatedAt: DateTime
  }

  input CreateResourceInput {
    resourceType: String!
    title: String!
    content: JSON
    tags: JSON
    sourceUrl: String
    lastChecked: DateTime
    sectionGates: JSON
    guideType: GuideType!
  }

  input UpdateResourceInput {
    resourceType: String
    title: String
    content: JSON
    tags: JSON
    sourceUrl: String
    lastChecked: DateTime
    sectionGates: JSON
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
    situation: ID!
    guideType: GuideType!
    resources: [GuideResource!]
    filters: JSON
    femaStatus: JSON
    createdAt: DateTime
    updatedAt: DateTime
    user: User
  }

  input CreateGuideInput {
    userId: ID!
    situation: ID!
    guideType: GuideType!
    resources: [GuideResourceInput!]
    filters: JSON
    femaStatus: JSON
  }

  input UpdateGuideInput {
    resources: [GuideResourceInput!]
    filters: JSON
    femaStatus: JSON
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
    # NEW: recovery quiz queries
    getGuestSituation(guestToken: String!): Situation

    # Location (Census Geocoder) and disasters (OpenFEMA)
    geocodeAddress(address: String!): GeocodeResult
    geocodeZip(zip: String!): GeocodeResult
    getDisastersForLocation(stateFips: String!, countyFips: String!, timeline: String): [DisasterOption!]!

    # Resources
    getResource(id: ID!): Resource
    getResources(resourceType: String, guideType: GuideType, limit: Int = 25, offset: Int = 0): [Resource!]!
    getMatchingResources(guideType: GuideType!, filters: JSON, limit: Int = 100): [Resource!]!

    # Guides
    getGuide(id: ID!): Guide
    getGuidesByUser(userId: ID!): [Guide!]!
    getGuideBySituation(situation: ID!): Guide
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
    # NEW: recovery quiz mutations
    # No login needed. Creates a guest situation, or updates it when guestToken is given.
    saveGuestSituation(input: CreateSituationInput!, guestToken: String): GuestSituationPayload!
    # Moves a guest situation onto the logged-in user's account
    claimGuestSituation(guestToken: String!): Situation

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
