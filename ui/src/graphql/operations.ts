import { gql } from '@apollo/client';

// new edit: shared location fields, including the geocoded ones
const SITUATION_LOCATION_FIELDS = gql`
  fragment SituationLocationFields on Location {
    zip
    city
    state
    stateCode
    countryCode
    stateFips
    countyFips
    countyName
    latitude
    longitude
    precision
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      firstName
      role
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_BY_USERNAME = gql`
  query GetUserByUsername($username: String!) {
    getUserByUsername(username: $username) {
      id
      username
      email
      firstName
      role
      createdAt
      updatedAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($limit: Int = 25, $offset: Int = 0) {
    getUsers(limit: $limit, offset: $offset) {
      id
      username
      email
      firstName
      role
      createdAt
      updatedAt
    }
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
      token
      error
      user {
        id
        username
        email
        firstName
        role
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      success
      token
      error
      user {
        id
        username
        email
        firstName
        role
        createdAt
        updatedAt
      }
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const VALIDATE_RESET_TOKEN = gql`
  query ValidateResetToken($token: String!) {
    validateResetToken(token: $token)
  }
`;

export const RESET_PASSWORD_WITH_TOKEN = gql`
  mutation ResetPasswordWithToken($token: String!, $newPassword: String!) {
    resetPasswordWithToken(token: $token, newPassword: $newPassword)
  }
`;

// Recovery situation

export const CREATE_SITUATION = gql`
  mutation CreateSituation($input: CreateSituationInput!) {
    createSituation(input: $input) {
      id
      userId
      # CHANGED: uses the shared location fragment
      location {
        ...SituationLocationFields
      }
      timeline
      disasters
      displayName
      helpTypes {
        housing
        financial
        damage
      }
      homeStatus
      household
      createdAt
      updatedAt
    }
  }
  ${SITUATION_LOCATION_FIELDS}
`;

export const GET_SITUATIONS_BY_USER = gql`
  query GetSituationsByUser($userId: ID!) {
    getSituationsByUser(userId: $userId) {
      id
      userId
      # CHANGED: uses the shared location fragment
      location {
        ...SituationLocationFields
      }
      timeline
      disasters
      displayName
      helpTypes {
        housing
        financial
        damage
      }
      homeStatus
      household
      createdAt
      updatedAt
    }
  }
  ${SITUATION_LOCATION_FIELDS}
`;

export const UPDATE_SITUATION = gql`
  mutation UpdateSituation($id: ID!, $input: UpdateSituationInput!) {
    updateSituation(id: $id, input: $input) {
      id
      timeline
      disasters
      displayName
      helpTypes {
        housing
        financial
        damage
      }
      homeStatus
      household
      updatedAt
    }
  }
`;

// Recovery quiz: location, disasters, guest saves

const GEOCODE_FIELDS = gql`
  fragment GeocodeFields on GeocodeResult {
    matchedAddress
    zip
    city
    stateCode
    stateFips
    countyFips
    countyName
    latitude
    longitude
    precision
  }
`;

export const GEOCODE_ADDRESS = gql`
  query GeocodeAddress($address: String!) {
    geocodeAddress(address: $address) {
      ...GeocodeFields
    }
  }
  ${GEOCODE_FIELDS}
`;

export const GEOCODE_ZIP = gql`
  query GeocodeZip($zip: String!) {
    geocodeZip(zip: $zip) {
      ...GeocodeFields
    }
  }
  ${GEOCODE_FIELDS}
`;

export const GET_DISASTERS_FOR_LOCATION = gql`
  query GetDisastersForLocation($stateFips: String!, $countyFips: String!, $timeline: String) {
    getDisastersForLocation(stateFips: $stateFips, countyFips: $countyFips, timeline: $timeline) {
      id
      disasterNumber
      title
      incidentType
      declarationType
      incidentBeginDate
      declarationDate
      individualAssistance
    }
  }
`;

const GUEST_SITUATION_FIELDS = gql`
  fragment GuestSituationFields on Situation {
    id
    userId
    location {
      ...SituationLocationFields
    }
    timeline
    disasters
    displayName
    helpTypes {
      housing
      financial
      damage
    }
    homeStatus
    household
    createdAt
    updatedAt
  }
  ${SITUATION_LOCATION_FIELDS}
`;

export const SAVE_GUEST_SITUATION = gql`
  mutation SaveGuestSituation($input: CreateSituationInput!, $guestToken: String) {
    saveGuestSituation(input: $input, guestToken: $guestToken) {
      guestToken
      situation {
        ...GuestSituationFields
      }
    }
  }
  ${GUEST_SITUATION_FIELDS}
`;

export const GET_GUEST_SITUATION = gql`
  query GetGuestSituation($guestToken: String!) {
    getGuestSituation(guestToken: $guestToken) {
      ...GuestSituationFields
    }
  }
  ${GUEST_SITUATION_FIELDS}
`;

export const CLAIM_GUEST_SITUATION = gql`
  mutation ClaimGuestSituation($guestToken: String!) {
    claimGuestSituation(guestToken: $guestToken) {
      id
    }
  }
`;
