import { useEffect, useState, type ReactNode } from "react";
import { getToken, onTokenCleared, requestSessionToken, setToken } from "../api/auth/client";
import * as authApi from "../api/auth/auth";
import { getMe, type Player } from "../api/player";
import { AuthContext, type User } from "./auth-context";

interface JwtPayload {
  sub: number;
  email: string | null;
}

function decodeToken(token: string): User | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as JwtPayload;
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
  const [fetchedProfile, setFetchedProfile] = useState<{ userId: number; profile: Player | null } | null>(null);
  const [isLoading, setIsLoading] = useState(() => !getToken() && typeof BroadcastChannel !== "undefined");

  useEffect(() => {
    if (!isLoading) return;

    let ignore = false;
    void requestSessionToken().then((token) => {
      if (ignore) return;
      if (token) setUser(decodeToken(token));
      setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [isLoading]);

  useEffect(() => onTokenCleared(() => setUser(null)), []);

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

  async function login(email: string, pw: string, rememberMe: boolean) {
    const { accessToken } = await authApi.login(email, pw, rememberMe);
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

  // OAuth: the token comes from the callback URL instead of a fetch response.
  // The backend signs it for 30 days, so it is kept like a "remember me" one.
  function loginWithToken(token: string) {
    setToken(token, true);
    setUser(decodeToken(token));
  }

  function logout() {
    authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileLoading,
        isAuth: !!user,
        isGuest,
        isAdmin: !!profile?.isAdmin,
        isLoading,
        login,
        register,
        guest,
        loginWithToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
