import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  CreateUserDocument,
  type CreateUserMutation,
  type CreateUserMutationVariables,
  GetUserDocument,
  type GetUserQuery,
  type GetUserQueryVariables,
  LoginDocument,
  type LoginMutation,
  type LoginMutationVariables,
} from '../generated';
import { apolloClient } from '../lib/apollo-client';
import { AuthContext, type User } from './AuthContext';

function isSignedAuthToken(token: string | null): token is string {
  return token !== null && token.split('.').length === 3;
}

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
    email: data.email ?? null,
    firstName: data.firstName ?? null,
    role: data.role === 'admin' ? 'admin' : 'user',
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
  const authActionRef = useRef(0);

  useEffect(() => {
    if (user) {
      try {
        const token = localStorage.getItem('authToken');
        if (!isSignedAuthToken(token)) {
          localStorage.removeItem('authUser');
          localStorage.removeItem('authToken');
          setUser(null);
          return;
        }
        localStorage.setItem('authUser', JSON.stringify(user));
      } catch {}
    } else {
      try {
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      } catch {}
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

    const savedToken = localStorage.getItem('authToken');
    if (!savedUser || !isSignedAuthToken(savedToken)) {
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      setLoading(false);
      return;
    }

    const restoreVersion = authActionRef.current;
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
        if (!cancelled && authActionRef.current === restoreVersion) {
          setUser(toUser(data?.getUser));
        }
      } catch {
        // Preserve saved session on transient failures
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
    authActionRef.current++;
    try {
      const { data } = await withTimeout(
        apolloClient.mutate<LoginMutation, LoginMutationVariables>({
          mutation: LoginDocument,
          variables: { username, password },
        })
      );

      const result = data?.login;
      if (!result?.success || !result.user || !result.token) {
        return false;
      }

      const loggedInUser = toUser(result.user);
      setUser(loggedInUser);
      if (loggedInUser) {
        localStorage.setItem('authUser', JSON.stringify(loggedInUser));
        localStorage.setItem('authToken', result.token);
      }
      return true;
    } catch (error) {
      console.error('[auth] Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, firstName: string, password: string) => {
    setLoading(true);
    authActionRef.current++;
    try {
      const { data } = await withTimeout(
        apolloClient.mutate<CreateUserMutation, CreateUserMutationVariables>({
          mutation: CreateUserDocument,
          variables: {
            input: {
              username,
              email,
              firstName,
              passwordHash: password,
            },
          },
        })
      );

      const result = data?.createUser;
      if (!result?.success || !result.user || !result.token) {
        return { success: false, error: result?.error ?? 'Failed to create account' };
      }

      const newUser = toUser(result.user);
      setUser(newUser);
      if (newUser) {
        localStorage.setItem('authUser', JSON.stringify(newUser));
        localStorage.setItem('authToken', result.token);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message ?? 'Something went wrong' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authActionRef.current++;
    setUser(null);
    try {
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('recovery_quiz_answers');
      localStorage.removeItem('recovery_quiz_complete');
      localStorage.removeItem('recovery_quiz_synced');
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
