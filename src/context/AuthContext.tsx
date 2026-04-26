import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AUTH_REFRESH_TOKEN_KEY, AUTH_TOKEN_KEY } from "@/lib/constants";
import { authService } from "@/services";
import type { LoginPayload, User } from "@/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => void;
  refreshMe: () => Promise<User | null>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_TOKEN_KEY)
  );
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!storedToken) {
      clearSession();
      return null;
    }

    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
      setToken(storedToken);
      return currentUser;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      await refreshMe();
      if (isMounted) {
        setIsLoading(false);
      }
    };

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [refreshMe]);

  const login = useCallback(async (payload: LoginPayload) => {
    const auth = await authService.login(payload);

    localStorage.setItem(AUTH_TOKEN_KEY, auth.accessToken);
    if (auth.refreshToken) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, auth.refreshToken);
    }

    setToken(auth.accessToken);
    setUser(auth.user);
    return auth.user;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      logout,
      refreshMe,
    }),
    [isLoading, login, logout, refreshMe, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
