import { createContext } from 'react';

export type User = {
  id: string;
  username: string;
  firstName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (
    username: string,
    firstName: string,
    password: string,
    securityQuestion: string,
    securityAnswer: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
