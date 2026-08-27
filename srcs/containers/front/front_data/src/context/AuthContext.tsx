import { useState, type ReactNode } from "react";
import { getToken } from "../api/auth/client";
import * as authApi from "../api/auth/auth";
import { AuthContext, type User } from "./auth-context";

function decodeToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.sub, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = getToken();
    return token ? decodeToken(token) : null;
  });

  async function login(email: string, pw: string) {
    const { accessToken } = await authApi.login(email, pw);
    setUser(decodeToken(accessToken));
  }

  async function register(email: string, pw: string, name: string) {
    const { accessToken } = await authApi.register(email, pw, name);
    setUser(decodeToken(accessToken));
  }

  function logout() {
    authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuth: !!user, isLoading: false, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
