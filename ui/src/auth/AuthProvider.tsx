import { useEffect, useState, type ReactNode } from 'react';
import { apolloClient } from '../lib/apollo-client';
import {
  GetUserDocument,
  GetUserByUsernameDocument,
  CreateUserDocument,
  type GetUserQuery,
  type GetUserQueryVariables,
  type GetUserByUsernameQuery,
  type GetUserByUsernameQueryVariables,
  type CreateUserMutation,
  type CreateUserMutationVariables,
} from '../generated';
import { AuthContext, type User } from './AuthContext';

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms)),
  ]);
}

function toUser(data: any): User | null {
  if (!data) return null;
  return {
    id: data.id,
    username: data.username,
    firstName: data.firstName ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('authToken', user.id);
    } else {
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
    }
  }, [user]);

  useEffect(() => {
    const savedUser = (() => {
      try {
        const raw = localStorage.getItem('authUser');
        return raw ? (JSON.parse(raw) as User) : null;
      } catch {
        return null;
      }
    })();

    if (!savedUser) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await withTimeout(
          apolloClient.query<GetUserQuery, GetUserQueryVariables>({
            query: GetUserDocument,
            variables: { id: savedUser.id },
            fetchPolicy: 'network-only',
          })
        );
        if (!cancelled) setUser(toUser(data?.getUser));
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await withTimeout(
        apolloClient.query<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>({
          query: GetUserByUsernameDocument,
          variables: { username },
          fetchPolicy: 'network-only',
        })
      );

      const found = data?.getUserByUsername;
      if (!found || found.passwordHash !== password) {
        return false;
      }

      setUser(toUser(found));
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    username: string,
    firstName: string,
    password: string,
    securityQuestion: string,
    securityAnswer: string
  ) => {
    setLoading(true);
    try {
      const { data: existing } = await withTimeout(
        apolloClient.query<GetUserByUsernameQuery, GetUserByUsernameQueryVariables>({
          query: GetUserByUsernameDocument,
          variables: { username },
          fetchPolicy: 'network-only',
        })
      );

      if (existing?.getUserByUsername) {
        return { success: false, error: 'Username already taken' };
      }

      const { data } = await withTimeout(
        apolloClient.mutate<CreateUserMutation, CreateUserMutationVariables>({
          mutation: CreateUserDocument,
          variables: {
            input: {
              username,
              firstName,
              passwordHash: password,
              securityQuestion,
              securityAnswer,
            },
          },
        })
      );

      const created = data?.createUser;
      if (!created) {
        return { success: false, error: 'Failed to create account' };
      }

      setUser(toUser(created));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message ?? 'Something went wrong' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
