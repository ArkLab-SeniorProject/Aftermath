import { gql } from '@apollo/client';

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

// ── Recovery Situation ──

export const CREATE_SITUATION = gql`
  mutation CreateSituation($input: CreateSituationInput!) {
    createSituation(input: $input) {
      id
      userId
      location {
        zip
        city
        state
        stateCode
        countryCode
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
`;

export const GET_SITUATIONS_BY_USER = gql`
  query GetSituationsByUser($userId: ID!) {
    getSituationsByUser(userId: $userId) {
      id
      userId
      location {
        zip
        city
        state
        stateCode
        countryCode
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
