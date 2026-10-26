import { useEffect, useState, type ReactNode } from "react";
import { onLoggedOut } from "../api/auth/client";
import * as authApi from "../api/auth/auth";
import { getMe, type Player } from "../api/player";
import { AuthContext, type User } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [fetchedProfile, setFetchedProfile] = useState<{ userId: number; profile: Player | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    getMe()
      .then((player) => {
        if (ignore) return;
        setUser({ id: player.id, email: player.email });
        setFetchedProfile({ userId: player.id, profile: player });
      })
      .catch(() => {
        if (!ignore) setUser(null);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => onLoggedOut(() => setUser(null)), []);

  const fetchedUserId = fetchedProfile?.userId;

  useEffect(() => {
    if (!user || fetchedUserId === user.id) return;

    let ignore = false;
    getMe()
      .then((player) => {
        if (!ignore) setFetchedProfile({ userId: user.id, profile: player });
      })
      .catch(() => {
        if (!ignore) setFetchedProfile({ userId: user.id, profile: null });
      });

    return () => {
      ignore = true;
    };
  }, [user, fetchedUserId]);

  const profile = user && fetchedProfile?.userId === user.id ? fetchedProfile.profile : null;
  const profileLoading = !!user && fetchedProfile?.userId !== user.id;
  const isGuest = profile?.isGuest ?? false;

  async function login(email: string, pw: string, rememberMe: boolean) {
    setUser(await authApi.login(email, pw, rememberMe));
  }

  async function register(email: string, pw: string, name: string) {
    setUser(await authApi.register(email, pw, name));
  }

  async function guest(name: string) {
    setUser(await authApi.guest(name));
  }

  async function logout() {
    await authApi.logout();
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
