import * as SecureStore from "expo-secure-store";

export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

export interface StoredAuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

type AuthStorageChangeListener = () => void;

const authStorageChangeListeners =
  new Set<AuthStorageChangeListener>();

const notifyAuthStorageChanged = () => {
  authStorageChangeListeners.forEach((listener) => listener());
};

export const subscribeToAuthStorageChanges = (
  listener: AuthStorageChangeListener,
) => {
  authStorageChangeListeners.add(listener);

  return () => {
    authStorageChangeListeners.delete(listener);
  };
};

export const hasStoredAuthSession = ({
  accessToken,
  refreshToken,
}: StoredAuthTokens) => Boolean(accessToken || refreshToken);

export const getStoredAccessToken = () =>
  SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

export const getStoredRefreshToken = () =>
  SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

export const getStoredAuthTokens = async (): Promise<StoredAuthTokens> => {
  const [accessToken, refreshToken] = await Promise.all([
    getStoredAccessToken(),
    getStoredRefreshToken(),
  ]);

  return { accessToken, refreshToken };
};

export const setStoredAccessToken = async (accessToken: string) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  notifyAuthStorageChanged();
};

export const setStoredAuthTokens = async ({
  accessToken,
  refreshToken,
}: AuthTokens) => {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
  notifyAuthStorageChanged();
};

export const clearStoredAuthTokens = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
  notifyAuthStorageChanged();
};
