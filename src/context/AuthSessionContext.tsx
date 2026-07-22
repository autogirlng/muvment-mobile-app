import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearStoredAuthTokens,
  getStoredAuthTokens,
  hasStoredAuthSession,
  setStoredAuthTokens,
  subscribeToAuthStorageChanges,
  type AuthTokens,
  type StoredAuthTokens,
} from "../api/authStorage";

type AuthSessionStatus =
  | "authenticated"
  | "loading"
  | "unauthenticated";

interface AuthSessionContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  signIn: (tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
  status: AuthSessionStatus;
}

const AuthSessionContext =
  createContext<AuthSessionContextValue | null>(null);

const getStatusFromTokens = (
  tokens: StoredAuthTokens,
): AuthSessionStatus =>
  hasStoredAuthSession(tokens) ? "authenticated" : "unauthenticated";

export const AuthSessionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [status, setStatus] =
    useState<AuthSessionStatus>("loading");

  const refreshSession = useCallback(async () => {
    const tokens = await getStoredAuthTokens();

    setStatus(getStatusFromTokens(tokens));
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadSession = async () => {
      try {
        const tokens = await getStoredAuthTokens();

        if (isActive) {
          setStatus(getStatusFromTokens(tokens));
        }
      } catch {
        if (isActive) {
          setStatus("unauthenticated");
        }
      }
    };

    void loadSession();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    return subscribeToAuthStorageChanges(() => {
      void refreshSession();
    });
  }, [refreshSession]);

  const signIn = useCallback(
    async (tokens: AuthTokens) => {
      await setStoredAuthTokens(tokens);
      setStatus("authenticated");
    },
    [],
  );

  const signOut = useCallback(async () => {
    await clearStoredAuthTokens();
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      refreshSession,
      signIn,
      signOut,
      status,
    }),
    [refreshSession, signIn, signOut, status],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
};

export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error(
      "useAuthSession must be used within an AuthSessionProvider.",
    );
  }

  return context;
};
