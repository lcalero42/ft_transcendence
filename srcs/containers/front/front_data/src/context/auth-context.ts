import { createContext } from "react";

export interface User {
  id: number;
  email: string;
}

export interface AuthContextValue {
  user: User | null;
  isAuth: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
