import { createContext } from "react";
import type { Player } from "../api/player";

export interface User {
  id: number;
  email: string | null;
}

export interface AuthContextValue {
  user: User | null;
  profile: Player | null;
  profileLoading: boolean;
  isAuth: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  guest: (name: string) => Promise<void>;
  loginWithToken: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
