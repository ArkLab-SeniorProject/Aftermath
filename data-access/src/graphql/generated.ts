/* -------------------------------------------------------------------------- */
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT BY HAND.                            */
/* To update, run: `npx graphql-codegen --config codegen.yml`                   */
/* The header below disables TypeScript and ESLint checks for this generated file. */
/* -------------------------------------------------------------------------- */
/* eslint-disable */
// @ts-nocheck
import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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
  createUser: User;
  deleteDisaster: Scalars['Boolean']['output'];
  deleteGuide: Scalars['Boolean']['output'];
  deleteResource: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
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
  username?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  passwordHash?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
};
