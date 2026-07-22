import { useMutation } from "@tanstack/react-query";

import {
  apiFetchClient,
  AUTH_LOGIN_PATH,
  AUTH_RESEND_VERIFICATION_OTP_PATH,
  AUTH_REFRESH_PATH,
  AUTH_VERIFY_ACCOUNT_PATH,
} from "../client.fetch";
import { setStoredAccessToken } from "../authStorage";
import type {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginResponseData,
  LoginPayload,
  LoginResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  ResendVerificationOtpPayload,
  ResendVerificationOtpResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  VerifyAccountPayload,
  VerifyAccountResponse,
} from "../types";
import { useAuthSession } from "../../context/AuthSessionContext";

const getLoginTokens = (responseData: LoginResponseData) => {
  const { accessToken, refreshToken } = responseData;

  if (!accessToken || !refreshToken) {
    throw new Error(
      "Invalid login response from server. Please try again.",
    );
  }

  return { accessToken, refreshToken };
};

export const useLogin = () => {
  const authSession = useAuthSession();

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: async (payload) => {
      const response = await apiFetchClient.post<LoginResponse>(
        AUTH_LOGIN_PATH,
        payload,
      );
      const { accessToken, refreshToken } = getLoginTokens(response.data.data);

      await authSession.signIn({ accessToken, refreshToken });

      return response.data;
    },
  });
};

export const useRefreshToken = () => {
  const authSession = useAuthSession();

  return useMutation<
    RefreshTokenResponse,
    Error,
    RefreshTokenPayload
  >({
    mutationFn: async (payload) => {
      const response = await apiFetchClient.post<RefreshTokenResponse>(
        AUTH_REFRESH_PATH,
        payload,
      );

      await setStoredAccessToken(response.data.data.accessToken);
      await authSession.refreshSession();

      return response.data;
    },
  });
};

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

export const useVerifyAccount = () =>
  useMutation<
    VerifyAccountResponse,
    Error,
    VerifyAccountPayload
  >({
    mutationFn: async (payload) => {
      const response = await apiFetchClient.post<
        VerifyAccountResponse,
        VerifyAccountPayload
      >(AUTH_VERIFY_ACCOUNT_PATH, payload);

      return response.data;
    },
  });

export const useResendVerificationOtp = () =>
  useMutation<
    ResendVerificationOtpResponse,
    Error,
    ResendVerificationOtpPayload
  >({
    mutationFn: async (payload) => {
      const response = await apiFetchClient.post<
        ResendVerificationOtpResponse,
        ResendVerificationOtpPayload
      >(AUTH_RESEND_VERIFICATION_OTP_PATH, payload);

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
