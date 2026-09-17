import { createContext } from "react";
import type { Player } from "../api/player";

export interface User {
  id: number;
  email: string;
  isAdmin: boolean;
}

export interface AuthContextValue {
  user: User | null;
  profile: Player | null;
  profileLoading: boolean;
  isAuth: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
