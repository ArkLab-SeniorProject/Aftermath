/* -------------------------------------------------------------------------- */
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT BY HAND.                            */
/* To update, run: `npx graphql-codegen --config codegen.yml`                   */
/* The header below disables TypeScript and ESLint checks for this generated file. */
/* -------------------------------------------------------------------------- */
/* eslint-disable */
// @ts-nocheck
import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: any; output: any };
  JSON: { input: any; output: any };
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type CreateDisasterInput = {
  disaster?: InputMaybe<Scalars['JSON']['input']>;
  eventOccured?: InputMaybe<Scalars['String']['input']>;
  helpNeeded?: InputMaybe<HelpNeededInput>;
  homeownership?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<LocationInput>;
  userId: Scalars['ID']['input'];
};

export type CreateGuideInput = {
  disasterId: Scalars['ID']['input'];
  filters?: InputMaybe<Scalars['JSON']['input']>;
  resources?: InputMaybe<Array<GuideResourceInput>>;
  userId: Scalars['ID']['input'];
};

export type CreateResourceInput = {
  content?: InputMaybe<Scalars['JSON']['input']>;
  resourceType: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateUserInput = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  passwordHash: Scalars['String']['input'];
  securityAnswer: Scalars['String']['input'];
  securityQuestion: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Disaster = {
  __typename?: 'Disaster';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  disaster?: Maybe<Scalars['JSON']['output']>;
  eventOccured?: Maybe<Scalars['String']['output']>;
  helpNeeded?: Maybe<HelpNeeded>;
  homeownership?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  location?: Maybe<Location>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type Guide = {
  __typename?: 'Guide';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  disaster?: Maybe<Disaster>;
  disasterId: Scalars['ID']['output'];
  filters?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  resources?: Maybe<Array<GuideResource>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type GuideResource = {
  __typename?: 'GuideResource';
  progress?: Maybe<Scalars['JSON']['output']>;
  resource?: Maybe<Resource>;
  resourceId: Scalars['ID']['output'];
  saved?: Maybe<Scalars['Boolean']['output']>;
};

export type GuideResourceInput = {
  progress?: InputMaybe<Scalars['JSON']['input']>;
  resourceId: Scalars['ID']['input'];
  saved?: InputMaybe<Scalars['Boolean']['input']>;
};

export type HelpNeeded = {
  __typename?: 'HelpNeeded';
  damage?: Maybe<Scalars['Boolean']['output']>;
  financial?: Maybe<Scalars['Boolean']['output']>;
  housing?: Maybe<Scalars['Boolean']['output']>;
};

export type HelpNeededInput = {
  damage?: InputMaybe<Scalars['Boolean']['input']>;
  financial?: InputMaybe<Scalars['Boolean']['input']>;
  housing?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Location = {
  __typename?: 'Location';
  city?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  stateCode?: Maybe<Scalars['String']['output']>;
  zip?: Maybe<Scalars['String']['output']>;
};

export type LocationInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  countryCode?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  stateCode?: InputMaybe<Scalars['String']['input']>;
  zip?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createDisaster: Disaster;
  createGuide: Guide;
  createResource: Resource;
  createUser: AuthPayload;
  deleteDisaster: Scalars['Boolean']['output'];
  deleteGuide: Scalars['Boolean']['output'];
  deleteResource: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  login: AuthPayload;
  resetPassword: Scalars['Boolean']['output'];
  updateDisaster: Disaster;
  updateGuide: Guide;
  updateResource: Resource;
  updateUser: User;
};

export type MutationCreateDisasterArgs = {
  input: CreateDisasterInput;
};

export type MutationCreateGuideArgs = {
  input: CreateGuideInput;
};

export type MutationCreateResourceArgs = {
  input: CreateResourceInput;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationDeleteDisasterArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteGuideArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteResourceArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};

export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type MutationResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  securityAnswer: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type MutationUpdateDisasterArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDisasterInput;
};

export type MutationUpdateGuideArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGuideInput;
};

export type MutationUpdateResourceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateResourceInput;
};

export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

export type Query = {
  __typename?: 'Query';
  getDisaster?: Maybe<Disaster>;
  getDisastersByUser: Array<Disaster>;
  getGuide?: Maybe<Guide>;
  getGuideByDisaster?: Maybe<Guide>;
  getGuidesByUser: Array<Guide>;
  getResource?: Maybe<Resource>;
  getResources: Array<Resource>;
  getSecurityQuestion?: Maybe<Scalars['String']['output']>;
  getUser?: Maybe<User>;
  getUserByUsername?: Maybe<User>;
  getUsers: Array<User>;
};

export type QueryGetDisasterArgs = {
  id: Scalars['ID']['input'];
};

export type QueryGetDisastersByUserArgs = {
  userId: Scalars['ID']['input'];
};

export type QueryGetGuideArgs = {
  id: Scalars['ID']['input'];
};

export type QueryGetGuideByDisasterArgs = {
  disasterId: Scalars['ID']['input'];
};

export type QueryGetGuidesByUserArgs = {
  userId: Scalars['ID']['input'];
};

export type QueryGetResourceArgs = {
  id: Scalars['ID']['input'];
};

export type QueryGetResourcesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetSecurityQuestionArgs = {
  username: Scalars['String']['input'];
};

export type QueryGetUserArgs = {
  id: Scalars['ID']['input'];
};

export type QueryGetUserByUsernameArgs = {
  username: Scalars['String']['input'];
};

export type QueryGetUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type Resource = {
  __typename?: 'Resource';
  content?: Maybe<Scalars['JSON']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  resourceType?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type UpdateDisasterInput = {
  disaster?: InputMaybe<Scalars['JSON']['input']>;
  eventOccured?: InputMaybe<Scalars['String']['input']>;
  helpNeeded?: InputMaybe<HelpNeededInput>;
  homeownership?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<LocationInput>;
};

export type UpdateGuideInput = {
  filters?: InputMaybe<Scalars['JSON']['input']>;
  resources?: InputMaybe<Array<GuideResourceInput>>;
};

export type UpdateResourceInput = {
  content?: InputMaybe<Scalars['JSON']['input']>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  passwordHash?: InputMaybe<Scalars['String']['input']>;
  securityAnswer?: InputMaybe<Scalars['String']['input']>;
  securityQuestion?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  securityQuestion?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
};

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetUserQuery = {
  __typename?: 'Query';
  getUser?: {
    __typename?: 'User';
    id: string;
    username: string;
    firstName?: string | null;
    createdAt?: any | null;
    updatedAt?: any | null;
  } | null;
};

export type GetUserByUsernameQueryVariables = Exact<{
  username: Scalars['String']['input'];
}>;

export type GetUserByUsernameQuery = {
  __typename?: 'Query';
  getUserByUsername?: {
    __typename?: 'User';
    id: string;
    username: string;
    firstName?: string | null;
    createdAt?: any | null;
    updatedAt?: any | null;
  } | null;
};

export type GetUsersQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetUsersQuery = {
  __typename?: 'Query';
  getUsers: Array<{
    __typename?: 'User';
    id: string;
    username: string;
    firstName?: string | null;
    createdAt?: any | null;
    updatedAt?: any | null;
  }>;
};

export type LoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type LoginMutation = {
  __typename?: 'Mutation';
  login: {
    __typename?: 'AuthPayload';
    success: boolean;
    error?: string | null;
    user?: {
      __typename?: 'User';
      id: string;
      username: string;
      firstName?: string | null;
      createdAt?: any | null;
      updatedAt?: any | null;
    } | null;
  };
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;

export type CreateUserMutation = {
  __typename?: 'Mutation';
  createUser: {
    __typename?: 'AuthPayload';
    success: boolean;
    error?: string | null;
    user?: {
      __typename?: 'User';
      id: string;
      username: string;
      firstName?: string | null;
      createdAt?: any | null;
      updatedAt?: any | null;
    } | null;
  };
};

export type GetSecurityQuestionQueryVariables = Exact<{
  username: Scalars['String']['input'];
}>;

export type GetSecurityQuestionQuery = {
  __typename?: 'Query';
  getSecurityQuestion?: string | null;
};

export type ResetPasswordMutationVariables = Exact<{
  username: Scalars['String']['input'];
  securityAnswer: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;

export type ResetPasswordMutation = { __typename?: 'Mutation'; resetPassword: boolean };

export const GetUserDocument = gql`
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

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<GetUserQuery, GetUserQueryVariables> &
    ({ variables: GetUserQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
}
export function useGetUserLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
// @ts-ignore
export function useGetUserSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>
): ApolloReactHooks.UseSuspenseQueryResult<GetUserQuery, GetUserQueryVariables>;
export function useGetUserSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>
): ApolloReactHooks.UseSuspenseQueryResult<GetUserQuery | undefined, GetUserQueryVariables>;
export function useGetUserSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserSuspenseQueryHookResult = ReturnType<typeof useGetUserSuspenseQuery>;
export type GetUserQueryResult = ApolloReactCommon.QueryResult<GetUserQuery, GetUserQueryVariables>;
export const GetUserByUsernameDocument = gql`
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

/**
 * __useGetUserByUsernameQuery__
 *
 * To run a query within a React component, call `useGetUserByUsernameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByUsernameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByUsernameQuery({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useGetUserByUsernameQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    GetUserByUsernameQuery,
    GetUserByUsernameQueryVariables
  > &
    ({ variables: GetUserByUsernameQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>(
    GetUserByUsernameDocument,
    options
  );
}
export function useGetUserByUsernameLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GetUserByUsernameQuery,
    GetUserByUsernameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>(
    GetUserByUsernameDocument,
    options
  );
}
// @ts-ignore
export function useGetUserByUsernameSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    GetUserByUsernameQuery,
    GetUserByUsernameQueryVariables
  >
): ApolloReactHooks.UseSuspenseQueryResult<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>;
export function useGetUserByUsernameSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GetUserByUsernameQuery,
        GetUserByUsernameQueryVariables
      >
): ApolloReactHooks.UseSuspenseQueryResult<
  GetUserByUsernameQuery | undefined,
  GetUserByUsernameQueryVariables
>;
export function useGetUserByUsernameSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GetUserByUsernameQuery,
        GetUserByUsernameQueryVariables
      >
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>(
    GetUserByUsernameDocument,
    options
  );
}
export type GetUserByUsernameQueryHookResult = ReturnType<typeof useGetUserByUsernameQuery>;
export type GetUserByUsernameLazyQueryHookResult = ReturnType<typeof useGetUserByUsernameLazyQuery>;
export type GetUserByUsernameSuspenseQueryHookResult = ReturnType<
  typeof useGetUserByUsernameSuspenseQuery
>;
export type GetUserByUsernameQueryResult = ApolloReactCommon.QueryResult<
  GetUserByUsernameQuery,
  GetUserByUsernameQueryVariables
>;
export const GetUsersDocument = gql`
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

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetUsersQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<GetUsersQuery, GetUsersQueryVariables>(
    GetUsersDocument,
    options
  );
}
export function useGetUsersLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(
    GetUsersDocument,
    options
  );
}
// @ts-ignore
export function useGetUsersSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>
): ApolloReactHooks.UseSuspenseQueryResult<GetUsersQuery, GetUsersQueryVariables>;
export function useGetUsersSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>
): ApolloReactHooks.UseSuspenseQueryResult<GetUsersQuery | undefined, GetUsersQueryVariables>;
export function useGetUsersSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<GetUsersQuery, GetUsersQueryVariables>(
    GetUsersDocument,
    options
  );
}
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersSuspenseQueryHookResult = ReturnType<typeof useGetUsersSuspenseQuery>;
export type GetUsersQueryResult = ApolloReactCommon.QueryResult<
  GetUsersQuery,
  GetUsersQueryVariables
>;
export const LoginDocument = gql`
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
export type LoginMutationFn = ApolloReactCommon.MutationFunction<
  LoginMutation,
  LoginMutationVariables
>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(
    LoginDocument,
    options
  );
}
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = ApolloReactCommon.MutationResult<LoginMutation>;
export type LoginMutationOptions = ApolloReactCommon.BaseMutationOptions<
  LoginMutation,
  LoginMutationVariables
>;
export const CreateUserDocument = gql`
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
export type CreateUserMutationFn = ApolloReactCommon.MutationFunction<
  CreateUserMutation,
  CreateUserMutationVariables
>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateUserMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateUserMutation,
    CreateUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<CreateUserMutation, CreateUserMutationVariables>(
    CreateUserDocument,
    options
  );
}
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = ApolloReactCommon.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = ApolloReactCommon.BaseMutationOptions<
  CreateUserMutation,
  CreateUserMutationVariables
>;
export const GetSecurityQuestionDocument = gql`
    query GetSecurityQuestion($username: String!) {
  getSecurityQuestion(username: $username)
}
    `;

/**
 * __useGetSecurityQuestionQuery__
 *
 * To run a query within a React component, call `useGetSecurityQuestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSecurityQuestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSecurityQuestionQuery({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useGetSecurityQuestionQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    GetSecurityQuestionQuery,
    GetSecurityQuestionQueryVariables
  > &
    ({ variables: GetSecurityQuestionQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<GetSecurityQuestionQuery, GetSecurityQuestionQueryVariables>(
    GetSecurityQuestionDocument,
    options
  );
}
export function useGetSecurityQuestionLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GetSecurityQuestionQuery,
    GetSecurityQuestionQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<GetSecurityQuestionQuery, GetSecurityQuestionQueryVariables>(
    GetSecurityQuestionDocument,
    options
  );
}
// @ts-ignore
export function useGetSecurityQuestionSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    GetSecurityQuestionQuery,
    GetSecurityQuestionQueryVariables
  >
): ApolloReactHooks.UseSuspenseQueryResult<
  GetSecurityQuestionQuery,
  GetSecurityQuestionQueryVariables
>;
export function useGetSecurityQuestionSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GetSecurityQuestionQuery,
        GetSecurityQuestionQueryVariables
      >
): ApolloReactHooks.UseSuspenseQueryResult<
  GetSecurityQuestionQuery | undefined,
  GetSecurityQuestionQueryVariables
>;
export function useGetSecurityQuestionSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GetSecurityQuestionQuery,
        GetSecurityQuestionQueryVariables
      >
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    GetSecurityQuestionQuery,
    GetSecurityQuestionQueryVariables
  >(GetSecurityQuestionDocument, options);
}
export type GetSecurityQuestionQueryHookResult = ReturnType<typeof useGetSecurityQuestionQuery>;
export type GetSecurityQuestionLazyQueryHookResult = ReturnType<
  typeof useGetSecurityQuestionLazyQuery
>;
export type GetSecurityQuestionSuspenseQueryHookResult = ReturnType<
  typeof useGetSecurityQuestionSuspenseQuery
>;
export type GetSecurityQuestionQueryResult = ApolloReactCommon.QueryResult<
  GetSecurityQuestionQuery,
  GetSecurityQuestionQueryVariables
>;
export const ResetPasswordDocument = gql`
    mutation ResetPassword($username: String!, $securityAnswer: String!, $newPassword: String!) {
  resetPassword(
    username: $username
    securityAnswer: $securityAnswer
    newPassword: $newPassword
  )
}
    `;
export type ResetPasswordMutationFn = ApolloReactCommon.MutationFunction<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;

/**
 * __useResetPasswordMutation__
 *
 * To run a mutation, you first call `useResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordMutation, { data, loading, error }] = useResetPasswordMutation({
 *   variables: {
 *      username: // value for 'username'
 *      securityAnswer: // value for 'securityAnswer'
 *      newPassword: // value for 'newPassword'
 *   },
 * });
 */
export function useResetPasswordMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    ResetPasswordMutation,
    ResetPasswordMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(
    ResetPasswordDocument,
    options
  );
}
export type ResetPasswordMutationHookResult = ReturnType<typeof useResetPasswordMutation>;
export type ResetPasswordMutationResult = ApolloReactCommon.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = ApolloReactCommon.BaseMutationOptions<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;
