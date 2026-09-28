import { useEffect, useState, type ReactNode } from "react";
import { getToken } from "../api/auth/client";
import * as authApi from "../api/auth/auth";
import { getMe, type Player } from "../api/player";
import { AuthContext, type User } from "./auth-context";

interface JwtPayload {
  sub: number;
  email: string | null;
}

function decodeToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as JwtPayload;
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = getToken();
    return token ? decodeToken(token) : null;
  });
  // Keyed by userId so profile/profileLoading can be derived below without
  // ever setting state synchronously inside the effect (only from its
  // promise callbacks, once the fetch actually resolves).
  const [fetchedProfile, setFetchedProfile] = useState<{ userId: number; profile: Player | null } | null>(null);

  useEffect(() => {
    if (!user) return;

    let ignore = false;
    getMe()
      .then((player) => {
        if (!ignore) setFetchedProfile({ userId: user.id, profile: player });
      })
      .catch(() => {
        if (ignore) return;
        if (!getToken()) {
          setUser(null);
          return;
        }
        setFetchedProfile({ userId: user.id, profile: null });
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  const profile = user && fetchedProfile?.userId === user.id ? fetchedProfile.profile : null;
  const profileLoading = !!user && fetchedProfile?.userId !== user.id;
  const isGuest = profile?.isGuest ?? false;

  async function login(email: string, pw: string) {
    const { accessToken } = await authApi.login(email, pw);
    setUser(decodeToken(accessToken));
  }

  async function register(email: string, pw: string, name: string) {
    const { accessToken } = await authApi.register(email, pw, name);
    setUser(decodeToken(accessToken));
  }

  async function guest(name: string) {
    const { accessToken } = await authApi.guest(name);
    setUser(decodeToken(accessToken));
  }

  function logout() {
    authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, profileLoading, isAuth: !!user, isGuest, isLoading: false, login, register, guest, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
