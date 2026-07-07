import { useMutation } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";

import {
  ACCESS_TOKEN_KEY,
  apiFetchClient,
  AUTH_LOGIN_PATH,
  AUTH_REFRESH_PATH,
  REFRESH_TOKEN_KEY,
} from "../client.fetch";
import type {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginResponseData,
  LoginPayload,
  LoginResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "../types";

const getLoginTokens = (responseData: LoginResponseData) => {
  const { accessToken, refreshToken } = responseData;

  if (!accessToken || !refreshToken) {
    throw new Error(
      "Invalid login response from server. Please try again.",
    );
  }

  return { accessToken, refreshToken };
};

export const useLogin = () =>
  useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: async (payload) => {
      const response = await apiFetchClient.post<LoginResponse>(
        AUTH_LOGIN_PATH,
        payload,
      );
      const { accessToken, refreshToken } = getLoginTokens(response.data.data);

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

      return response.data;
    },
  });

export const useRefreshToken = () =>
  useMutation<
    RefreshTokenResponse,
    Error,
    RefreshTokenPayload
  >({
    mutationFn: async (payload) => {
      const response = await apiFetchClient.post<RefreshTokenResponse>(
        AUTH_REFRESH_PATH,
        payload,
      );

      await SecureStore.setItemAsync(
        ACCESS_TOKEN_KEY,
        response.data.data.accessToken,
      );

      return response.data;
    },
  });

export const useForgotPassword = () =>
  useMutation<
    ForgotPasswordResponse,
    Error,
    ForgotPasswordPayload
  >({
    mutationFn: async (payload) => {
      const response = await apiFetchClient.post<ForgotPasswordResponse>(
        "/auth/forgot-password",
        payload,
      );

      return response.data;
    },
  });

export const useResetPassword = () =>
  useMutation<
    ResetPasswordResponse,
    Error,
    ResetPasswordPayload
  >({
    mutationFn: async (payload) => {
      const response = await apiFetchClient.post<ResetPasswordResponse>(
        "/auth/reset-password",
        payload,
      );

      return response.data;
    },
  });
