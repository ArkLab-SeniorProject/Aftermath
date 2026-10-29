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
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type CreateGuideInput = {
  disaster: Scalars['ID']['input'];
  filters?: InputMaybe<Scalars['JSON']['input']>;
  guideType: GuideType;
  resources?: InputMaybe<Array<GuideResourceInput>>;
  userId: Scalars['ID']['input'];
};

export type CreateResourceInput = {
  content?: InputMaybe<Scalars['JSON']['input']>;
  guideType: GuideType;
  resourceType: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateSituationInput = {
  disasters?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  helpTypes?: InputMaybe<HelpTypesInput>;
  homeStatus?: InputMaybe<Scalars['String']['input']>;
  household?: InputMaybe<Array<Scalars['String']['input']>>;
  location?: InputMaybe<LocationInput>;
  timeline?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  passwordHash: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Guide = {
  __typename?: 'Guide';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  disaster: Scalars['ID']['output'];
  filters?: Maybe<Scalars['JSON']['output']>;
  guideType: GuideType;
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

export type GuideType =
  | 'preparedness'
  | 'recovery';

export type HelpTypes = {
  __typename?: 'HelpTypes';
  damage?: Maybe<Scalars['Boolean']['output']>;
  financial?: Maybe<Scalars['Boolean']['output']>;
  housing?: Maybe<Scalars['Boolean']['output']>;
};

export type HelpTypesInput = {
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
  createGuide: Guide;
  createResource: Resource;
  createSituation: Situation;
  createUser: AuthPayload;
  deleteGuide: Scalars['Boolean']['output'];
  deleteResource: Scalars['Boolean']['output'];
  deleteSituation: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  forgotPassword: Scalars['Boolean']['output'];
  login: AuthPayload;
  resetPasswordWithToken: Scalars['Boolean']['output'];
  updateGuide: Guide;
  updateResource: Resource;
  updateSituation: Situation;
  updateUser: User;
};


export type MutationCreateGuideArgs = {
  input: CreateGuideInput;
};


export type MutationCreateResourceArgs = {
  input: CreateResourceInput;
};


export type MutationCreateSituationArgs = {
  input: CreateSituationInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteGuideArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteResourceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSituationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationResetPasswordWithTokenArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationUpdateGuideArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGuideInput;
};


export type MutationUpdateResourceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateResourceInput;
};


export type MutationUpdateSituationArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSituationInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

export type Query = {
  __typename?: 'Query';
  getGuide?: Maybe<Guide>;
  getGuideByDisaster?: Maybe<Guide>;
  getGuidesByUser: Array<Guide>;
  getResource?: Maybe<Resource>;
  getResources: Array<Resource>;
  getSituation?: Maybe<Situation>;
  getSituationsByUser: Array<Situation>;
  getUser?: Maybe<User>;
  getUserByUsername?: Maybe<User>;
  getUsers: Array<User>;
  validateResetToken: Scalars['Boolean']['output'];
};


export type QueryGetGuideArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetGuideByDisasterArgs = {
  disaster: Scalars['ID']['input'];
};


export type QueryGetGuidesByUserArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryGetResourceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetResourcesArgs = {
  guideType?: InputMaybe<GuideType>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetSituationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetSituationsByUserArgs = {
  userId: Scalars['ID']['input'];
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


export type QueryValidateResetTokenArgs = {
  token: Scalars['String']['input'];
};

export type Resource = {
  __typename?: 'Resource';
  content?: Maybe<Scalars['JSON']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  guideType?: Maybe<GuideType>;
  id: Scalars['ID']['output'];
  resourceType?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Situation = {
  __typename?: 'Situation';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  disasters?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  helpTypes?: Maybe<HelpTypes>;
  homeStatus?: Maybe<Scalars['String']['output']>;
  household?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  location?: Maybe<Location>;
  timeline?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type UpdateGuideInput = {
  filters?: InputMaybe<Scalars['JSON']['input']>;
  resources?: InputMaybe<Array<GuideResourceInput>>;
};

export type UpdateResourceInput = {
  content?: InputMaybe<Scalars['JSON']['input']>;
  guideType?: InputMaybe<GuideType>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSituationInput = {
  disasters?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  helpTypes?: InputMaybe<HelpTypesInput>;
  homeStatus?: InputMaybe<Scalars['String']['input']>;
  household?: InputMaybe<Array<Scalars['String']['input']>>;
  location?: InputMaybe<LocationInput>;
  timeline?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  passwordHash?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
};

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', id: string, username: string, email?: string | null, firstName?: string | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type GetUserByUsernameQueryVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type GetUserByUsernameQuery = { __typename?: 'Query', getUserByUsername?: { __typename?: 'User', id: string, username: string, email?: string | null, firstName?: string | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type GetUsersQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUsersQuery = { __typename?: 'Query', getUsers: Array<{ __typename?: 'User', id: string, username: string, email?: string | null, firstName?: string | null, createdAt?: any | null, updatedAt?: any | null }> };

export type LoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', success: boolean, error?: string | null, user?: { __typename?: 'User', id: string, username: string, email?: string | null, firstName?: string | null, createdAt?: any | null, updatedAt?: any | null } | null } };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'AuthPayload', success: boolean, error?: string | null, user?: { __typename?: 'User', id: string, username: string, email?: string | null, firstName?: string | null, createdAt?: any | null, updatedAt?: any | null } | null } };

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ForgotPasswordMutation = { __typename?: 'Mutation', forgotPassword: boolean };

export type ValidateResetTokenQueryVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type ValidateResetTokenQuery = { __typename?: 'Query', validateResetToken: boolean };

export type ResetPasswordWithTokenMutationVariables = Exact<{
  token: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type ResetPasswordWithTokenMutation = { __typename?: 'Mutation', resetPasswordWithToken: boolean };

export type CreateSituationMutationVariables = Exact<{
  input: CreateSituationInput;
}>;


export type CreateSituationMutation = { __typename?: 'Mutation', createSituation: { __typename?: 'Situation', id: string, userId: string, timeline?: string | null, disasters?: string | null, displayName?: string | null, homeStatus?: string | null, household?: Array<string> | null, createdAt?: any | null, updatedAt?: any | null, location?: { __typename?: 'Location', zip?: string | null, city?: string | null, state?: string | null, stateCode?: string | null, countryCode?: string | null } | null, helpTypes?: { __typename?: 'HelpTypes', housing?: boolean | null, financial?: boolean | null, damage?: boolean | null } | null } };

export type GetSituationsByUserQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetSituationsByUserQuery = { __typename?: 'Query', getSituationsByUser: Array<{ __typename?: 'Situation', id: string, userId: string, timeline?: string | null, disasters?: string | null, displayName?: string | null, homeStatus?: string | null, household?: Array<string> | null, createdAt?: any | null, updatedAt?: any | null, location?: { __typename?: 'Location', zip?: string | null, city?: string | null, state?: string | null, stateCode?: string | null, countryCode?: string | null } | null, helpTypes?: { __typename?: 'HelpTypes', housing?: boolean | null, financial?: boolean | null, damage?: boolean | null } | null }> };

export type UpdateSituationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateSituationInput;
}>;


export type UpdateSituationMutation = { __typename?: 'Mutation', updateSituation: { __typename?: 'Situation', id: string, timeline?: string | null, disasters?: string | null, displayName?: string | null, homeStatus?: string | null, household?: Array<string> | null, updatedAt?: any | null, helpTypes?: { __typename?: 'HelpTypes', housing?: boolean | null, financial?: boolean | null, damage?: boolean | null } | null } };


export const GetUserDocument = gql`
    query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    username
    email
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
export function useGetUserQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetUserQuery, GetUserQueryVariables> & ({ variables: GetUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
      }
export function useGetUserLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
        }
// @ts-ignore
export function useGetUserSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetUserQuery, GetUserQueryVariables>;
export function useGetUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetUserQuery | undefined, GetUserQueryVariables>;
export function useGetUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
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
    email
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
export function useGetUserByUsernameQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetUserByUsernameQuery, GetUserByUsernameQueryVariables> & ({ variables: GetUserByUsernameQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>(GetUserByUsernameDocument, options);
      }
export function useGetUserByUsernameLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>(GetUserByUsernameDocument, options);
        }
// @ts-ignore
export function useGetUserByUsernameSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>;
export function useGetUserByUsernameSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetUserByUsernameQuery | undefined, GetUserByUsernameQueryVariables>;
export function useGetUserByUsernameSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>(GetUserByUsernameDocument, options);
        }
export type GetUserByUsernameQueryHookResult = ReturnType<typeof useGetUserByUsernameQuery>;
export type GetUserByUsernameLazyQueryHookResult = ReturnType<typeof useGetUserByUsernameLazyQuery>;
export type GetUserByUsernameSuspenseQueryHookResult = ReturnType<typeof useGetUserByUsernameSuspenseQuery>;
export type GetUserByUsernameQueryResult = ApolloReactCommon.QueryResult<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>;
export const GetUsersDocument = gql`
    query GetUsers($limit: Int = 25, $offset: Int = 0) {
  getUsers(limit: $limit, offset: $offset) {
    id
    username
    email
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
export function useGetUsersQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
// @ts-ignore
export function useGetUsersSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetUsersQuery, GetUsersQueryVariables>;
export function useGetUsersSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetUsersQuery | undefined, GetUsersQueryVariables>;
export function useGetUsersSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersSuspenseQueryHookResult = ReturnType<typeof useGetUsersSuspenseQuery>;
export type GetUsersQueryResult = ApolloReactCommon.QueryResult<GetUsersQuery, GetUsersQueryVariables>;
export const LoginDocument = gql`
    mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    success
    error
    user {
      id
      username
      email
      firstName
      createdAt
      updatedAt
    }
  }
}
    `;
export type LoginMutationFn = ApolloReactCommon.MutationFunction<LoginMutation, LoginMutationVariables>;

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
export function useLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = ApolloReactCommon.MutationResult<LoginMutation>;
export type LoginMutationOptions = ApolloReactCommon.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const CreateUserDocument = gql`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    success
    error
    user {
      id
      username
      email
      firstName
      createdAt
      updatedAt
    }
  }
}
    `;
export type CreateUserMutationFn = ApolloReactCommon.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

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
export function useCreateUserMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = ApolloReactCommon.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `;
export type ForgotPasswordMutationFn = ApolloReactCommon.MutationFunction<ForgotPasswordMutation, ForgotPasswordMutationVariables>;

/**
 * __useForgotPasswordMutation__
 *
 * To run a mutation, you first call `useForgotPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useForgotPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [forgotPasswordMutation, { data, loading, error }] = useForgotPasswordMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useForgotPasswordMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ForgotPasswordMutation, ForgotPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument, options);
      }
export type ForgotPasswordMutationHookResult = ReturnType<typeof useForgotPasswordMutation>;
export type ForgotPasswordMutationResult = ApolloReactCommon.MutationResult<ForgotPasswordMutation>;
export type ForgotPasswordMutationOptions = ApolloReactCommon.BaseMutationOptions<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ValidateResetTokenDocument = gql`
    query ValidateResetToken($token: String!) {
  validateResetToken(token: $token)
}
    `;

/**
 * __useValidateResetTokenQuery__
 *
 * To run a query within a React component, call `useValidateResetTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useValidateResetTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useValidateResetTokenQuery({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useValidateResetTokenQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ValidateResetTokenQuery, ValidateResetTokenQueryVariables> & ({ variables: ValidateResetTokenQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ValidateResetTokenQuery, ValidateResetTokenQueryVariables>(ValidateResetTokenDocument, options);
      }
export function useValidateResetTokenLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ValidateResetTokenQuery, ValidateResetTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ValidateResetTokenQuery, ValidateResetTokenQueryVariables>(ValidateResetTokenDocument, options);
        }
// @ts-ignore
export function useValidateResetTokenSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ValidateResetTokenQuery, ValidateResetTokenQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ValidateResetTokenQuery, ValidateResetTokenQueryVariables>;
export function useValidateResetTokenSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ValidateResetTokenQuery, ValidateResetTokenQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ValidateResetTokenQuery | undefined, ValidateResetTokenQueryVariables>;
export function useValidateResetTokenSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ValidateResetTokenQuery, ValidateResetTokenQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ValidateResetTokenQuery, ValidateResetTokenQueryVariables>(ValidateResetTokenDocument, options);
        }
export type ValidateResetTokenQueryHookResult = ReturnType<typeof useValidateResetTokenQuery>;
export type ValidateResetTokenLazyQueryHookResult = ReturnType<typeof useValidateResetTokenLazyQuery>;
export type ValidateResetTokenSuspenseQueryHookResult = ReturnType<typeof useValidateResetTokenSuspenseQuery>;
export type ValidateResetTokenQueryResult = ApolloReactCommon.QueryResult<ValidateResetTokenQuery, ValidateResetTokenQueryVariables>;
export const ResetPasswordWithTokenDocument = gql`
    mutation ResetPasswordWithToken($token: String!, $newPassword: String!) {
  resetPasswordWithToken(token: $token, newPassword: $newPassword)
}
    `;
export type ResetPasswordWithTokenMutationFn = ApolloReactCommon.MutationFunction<ResetPasswordWithTokenMutation, ResetPasswordWithTokenMutationVariables>;

/**
 * __useResetPasswordWithTokenMutation__
 *
 * To run a mutation, you first call `useResetPasswordWithTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordWithTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordWithTokenMutation, { data, loading, error }] = useResetPasswordWithTokenMutation({
 *   variables: {
 *      token: // value for 'token'
 *      newPassword: // value for 'newPassword'
 *   },
 * });
 */
export function useResetPasswordWithTokenMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ResetPasswordWithTokenMutation, ResetPasswordWithTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ResetPasswordWithTokenMutation, ResetPasswordWithTokenMutationVariables>(ResetPasswordWithTokenDocument, options);
      }
export type ResetPasswordWithTokenMutationHookResult = ReturnType<typeof useResetPasswordWithTokenMutation>;
export type ResetPasswordWithTokenMutationResult = ApolloReactCommon.MutationResult<ResetPasswordWithTokenMutation>;
export type ResetPasswordWithTokenMutationOptions = ApolloReactCommon.BaseMutationOptions<ResetPasswordWithTokenMutation, ResetPasswordWithTokenMutationVariables>;
export const CreateSituationDocument = gql`
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
export type CreateSituationMutationFn = ApolloReactCommon.MutationFunction<CreateSituationMutation, CreateSituationMutationVariables>;

/**
 * __useCreateSituationMutation__
 *
 * To run a mutation, you first call `useCreateSituationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSituationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSituationMutation, { data, loading, error }] = useCreateSituationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSituationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateSituationMutation, CreateSituationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateSituationMutation, CreateSituationMutationVariables>(CreateSituationDocument, options);
      }
export type CreateSituationMutationHookResult = ReturnType<typeof useCreateSituationMutation>;
export type CreateSituationMutationResult = ApolloReactCommon.MutationResult<CreateSituationMutation>;
export type CreateSituationMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateSituationMutation, CreateSituationMutationVariables>;
export const GetSituationsByUserDocument = gql`
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

/**
 * __useGetSituationsByUserQuery__
 *
 * To run a query within a React component, call `useGetSituationsByUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSituationsByUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSituationsByUserQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetSituationsByUserQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetSituationsByUserQuery, GetSituationsByUserQueryVariables> & ({ variables: GetSituationsByUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetSituationsByUserQuery, GetSituationsByUserQueryVariables>(GetSituationsByUserDocument, options);
      }
export function useGetSituationsByUserLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetSituationsByUserQuery, GetSituationsByUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetSituationsByUserQuery, GetSituationsByUserQueryVariables>(GetSituationsByUserDocument, options);
        }
// @ts-ignore
export function useGetSituationsByUserSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetSituationsByUserQuery, GetSituationsByUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetSituationsByUserQuery, GetSituationsByUserQueryVariables>;
export function useGetSituationsByUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetSituationsByUserQuery, GetSituationsByUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetSituationsByUserQuery | undefined, GetSituationsByUserQueryVariables>;
export function useGetSituationsByUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetSituationsByUserQuery, GetSituationsByUserQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetSituationsByUserQuery, GetSituationsByUserQueryVariables>(GetSituationsByUserDocument, options);
        }
export type GetSituationsByUserQueryHookResult = ReturnType<typeof useGetSituationsByUserQuery>;
export type GetSituationsByUserLazyQueryHookResult = ReturnType<typeof useGetSituationsByUserLazyQuery>;
export type GetSituationsByUserSuspenseQueryHookResult = ReturnType<typeof useGetSituationsByUserSuspenseQuery>;
export type GetSituationsByUserQueryResult = ApolloReactCommon.QueryResult<GetSituationsByUserQuery, GetSituationsByUserQueryVariables>;
export const UpdateSituationDocument = gql`
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
export type UpdateSituationMutationFn = ApolloReactCommon.MutationFunction<UpdateSituationMutation, UpdateSituationMutationVariables>;

/**
 * __useUpdateSituationMutation__
 *
 * To run a mutation, you first call `useUpdateSituationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSituationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSituationMutation, { data, loading, error }] = useUpdateSituationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSituationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateSituationMutation, UpdateSituationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateSituationMutation, UpdateSituationMutationVariables>(UpdateSituationDocument, options);
      }
export type UpdateSituationMutationHookResult = ReturnType<typeof useUpdateSituationMutation>;
export type UpdateSituationMutationResult = ApolloReactCommon.MutationResult<UpdateSituationMutation>;
export type UpdateSituationMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateSituationMutation, UpdateSituationMutationVariables>;