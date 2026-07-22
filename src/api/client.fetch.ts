import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearStoredAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredAccessToken,
} from "./authStorage";
import type {
  ApiErrorResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
} from "./types";

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const AUTH_REFRESH_PATH = "/auth/refresh-token";
export const AUTH_LOGIN_PATH = "/auth/login";
const AUTH_FORGOT_PASSWORD_PATH = "/auth/forgot-password";
const AUTH_RESET_PASSWORD_PATH = "/auth/reset-password";
const DRIVER_APPLICATIONS_PATH = "/driver-applications";
const AUTH_EXEMPT_PATHS = [
  AUTH_LOGIN_PATH,
  AUTH_REFRESH_PATH,
  AUTH_FORGOT_PASSWORD_PATH,
  AUTH_RESET_PASSWORD_PATH,
  DRIVER_APPLICATIONS_PATH,
] as const;
const REFRESH_EXEMPT_PATHS = [AUTH_LOGIN_PATH, AUTH_REFRESH_PATH] as const;

if (!rawApiBaseUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_URL. Add it to your Expo .env file and restart Expo before making API requests.",
  );
}

const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");
const API_BASE_PATH = (() => {
  try {
    return new URL(API_BASE_URL).pathname;
  } catch {
    return API_BASE_URL;
  }
})();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiHeaders = Record<string, string>;

type ApiRequestOptions<TBody = unknown> = {
  auth?: boolean;
  body?: TBody;
  headers?: ApiHeaders;
  method: HttpMethod;
  retryOnUnauthorized?: boolean;
};

type ApiClientResponse<TResponse> = {
  data: TResponse;
};

type ApiFailurePayload = ApiErrorResponse | undefined;

export class ApiRequestError extends Error {
  code?: string;
  data?: ApiFailurePayload;
  response?: {
    data?: ApiFailurePayload;
    status: number;
  };
  status?: number;

  constructor({
    code,
    data,
    message,
    status,
  }: {
    code?: string;
    data?: ApiFailurePayload;
    message: string;
    status?: number;
  }) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.data = data;
    this.status = status;

    if (status) {
      this.response = {
        data,
        status,
      };
    }
  }
}

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

const getRequestPath = (url?: string) => {
  if (!url) {
    return "";
  }

  try {
    if (isAbsoluteUrl(url)) {
      return new URL(url).pathname;
    }
  } catch {
    return url;
  }

  return `/${url.replace(/^\/+/, "").split(/[?#]/)[0]}`;
};

const getRequestUrl = (path: string) => {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
};

const matchesPath = (url: string | undefined, paths: readonly string[]) => {
  const requestPath = getRequestPath(url);

  return paths.some((path) => requestPath.endsWith(path));
};

const shouldSkipAuth = (url?: string) => !url || matchesPath(url, AUTH_EXEMPT_PATHS);

const shouldSkipRefresh = (url?: string) =>
  !url || matchesPath(url, REFRESH_EXEMPT_PATHS);

const getApiErrorMessage = (data: ApiFailurePayload, fallback: string) => {
  const message = data?.message;

  if (Array.isArray(message)) {
    return message.join("\n");
  }

  return message || fallback;
};

const parseResponseBody = async (response: Response) => {
  const responseText = await response.text();

  if (!responseText) {
    return undefined;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return undefined;
  }
};

const logApiRequest = (method: HttpMethod, url: string) => {
  if (!__DEV__) {
    return;
  }

  console.log("[api:fetch] request", {
    method,
    url,
  });
};

const logApiResponse = (method: HttpMethod, url: string, status: number) => {
  if (!__DEV__) {
    return;
  }

  console.log("[api:fetch] response", {
    method,
    status,
    url,
  });
};

const logApiFailure = (
  method: HttpMethod,
  url: string,
  error: ApiRequestError,
) => {
  if (!__DEV__) {
    return;
  }

  console.warn("[api:fetch] failure", {
    code: error.code,
    message: error.message,
    method,
    status: error.status,
    url,
  });
};

const fetchRequest = async (url: string, init: RequestInit) => {
  try {
    return await fetch(url, init);
  } catch (error) {
    throw new ApiRequestError({
      code: "ERR_NETWORK",
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Please check your connection and try again.",
    });
  }
};

const refreshAccessToken = async () => {
  const refreshToken = await getStoredRefreshToken();

  if (!refreshToken) {
    await clearStoredAuthTokens();
    return undefined;
  }

  try {
    const response = await request<RefreshTokenResponse, RefreshTokenPayload>(
      AUTH_REFRESH_PATH,
      {
        auth: false,
        body: { refreshToken },
        method: "POST",
        retryOnUnauthorized: false,
      },
    );
    const accessToken = response.data?.accessToken;

    if (!accessToken) {
      throw new ApiRequestError({
        message: "Invalid refresh response from server. Please sign in again.",
      });
    }

    await setStoredAccessToken(accessToken);

    return accessToken;
  } catch {
    await clearStoredAuthTokens();
    return undefined;
  }
};

const request = async <TResponse, TBody = unknown>(
  path: string,
  {
    auth = true,
    body,
    headers,
    method,
    retryOnUnauthorized = true,
  }: ApiRequestOptions<TBody>,
): Promise<TResponse> => {
  const url = getRequestUrl(path);
  const requestHeaders: ApiHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...headers,
  };
  const shouldAttachAuth = auth && !shouldSkipAuth(path);

  if (shouldAttachAuth) {
    const accessToken = await getStoredAccessToken();

    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  logApiRequest(method, url);

  try {
    const response = await fetchRequest(
      url,
      {
        body: body === undefined ? undefined : JSON.stringify(body),
        headers: requestHeaders,
        method,
      },
    );
    const responseBody = await parseResponseBody(response);

    logApiResponse(method, url, response.status);

    if (
      response.status === 401 &&
      retryOnUnauthorized &&
      !shouldSkipRefresh(path)
    ) {
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        return request<TResponse, TBody>(path, {
          auth,
          body,
          headers,
          method,
          retryOnUnauthorized: false,
        });
      }
    }

    if (!response.ok) {
      const errorData = responseBody as ApiFailurePayload;

      throw new ApiRequestError({
        data: errorData,
        message: getApiErrorMessage(
          errorData,
          `Request failed with status ${response.status}. Please try again.`,
        ),
        status: response.status,
      });
    }

    return responseBody as TResponse;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      logApiFailure(method, url, error);
      throw error;
    }

    const requestError = new ApiRequestError({
      code: "ERR_UNKNOWN",
      message:
        error instanceof Error
          ? error.message
          : "Unable to complete the request. Please try again.",
    });

    logApiFailure(method, url, requestError);
    throw requestError;
  }
};

if (__DEV__) {
  console.log("[api:fetch] client ready", {
    basePath: API_BASE_PATH,
    loginPath: `${API_BASE_PATH}${AUTH_LOGIN_PATH}`,
    refreshPath: `${API_BASE_PATH}${AUTH_REFRESH_PATH}`,
  });
}

export const apiFetchClient = {
  delete: async <TResponse>(
    path: string,
    headers?: ApiHeaders,
  ): Promise<ApiClientResponse<TResponse>> => ({
    data: await request<TResponse>(path, {
      headers,
      method: "DELETE",
    }),
  }),
  get: async <TResponse>(
    path: string,
    headers?: ApiHeaders,
  ): Promise<ApiClientResponse<TResponse>> => ({
    data: await request<TResponse>(path, {
      headers,
      method: "GET",
    }),
  }),
  patch: async <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    headers?: ApiHeaders,
  ): Promise<ApiClientResponse<TResponse>> => ({
    data: await request<TResponse, TBody>(path, {
      body,
      headers,
      method: "PATCH",
    }),
  }),
  post: async <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    headers?: ApiHeaders,
  ): Promise<ApiClientResponse<TResponse>> => ({
    data: await request<TResponse, TBody>(path, {
      body,
      headers,
      method: "POST",
    }),
  }),
  put: async <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    headers?: ApiHeaders,
  ): Promise<ApiClientResponse<TResponse>> => ({
    data: await request<TResponse, TBody>(path, {
      body,
      headers,
      method: "PUT",
    }),
  }),
  request,
};
