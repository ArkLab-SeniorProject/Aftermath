import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      firstName
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
      firstName
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
      firstName
      createdAt
      updatedAt
    }
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
      error
      user {
        id
        username
        firstName
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
      error
      user {
        id
        username
        firstName
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_SECURITY_QUESTION = gql`
  query GetSecurityQuestion($username: String!) {
    getSecurityQuestion(username: $username)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($username: String!, $securityAnswer: String!, $newPassword: String!) {
    resetPassword(username: $username, securityAnswer: $securityAnswer, newPassword: $newPassword)
  }
`;
