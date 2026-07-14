import React, {
  useEffect,
  useMemo,
} from "react";
import { AppState } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  Client,
  type IMessage,
  type StompSubscription,
} from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { ACCESS_TOKEN_KEY } from "../../api/client.fetch";
import {
  USER_NOTIFICATIONS_QUERY_KEY,
  upsertLoadedNotification,
} from "../../api/hooks/useNotifications";
import { useCurrentUser } from "../../api/hooks/useUsers";
import type {
  NotificationPriority,
  NotificationType,
  UserNotification,
} from "../../api/types";

const NOTIFICATION_TYPES: NotificationType[] = [
  "INFO",
  "WARNING",
  "ERROR",
  "SUCCESS",
];
const NOTIFICATION_PRIORITIES: NotificationPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
];
const WS_URL = process.env.EXPO_PUBLIC_WS_URL?.trim();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getString = (
  source: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = source[key];

  return typeof value === "string" && value.trim()
    ? value
    : undefined;
};

const getNullableString = (
  source: Record<string, unknown>,
  key: string,
): string | null | undefined => {
  if (source[key] === null) {
    return null;
  }

  return getString(source, key);
};

const getBoolean = (
  source: Record<string, unknown>,
  key: string,
  fallback: boolean,
) => (typeof source[key] === "boolean" ? source[key] : fallback);

const getNotificationType = (
  value: unknown,
): NotificationType =>
  typeof value === "string" &&
  NOTIFICATION_TYPES.includes(value as NotificationType)
    ? (value as NotificationType)
    : "INFO";

const getNotificationPriority = (
  value: unknown,
): NotificationPriority =>
  typeof value === "string" &&
  NOTIFICATION_PRIORITIES.includes(value as NotificationPriority)
    ? (value as NotificationPriority)
    : "LOW";

const getCreatedAt = (value: unknown) => {
  if (typeof value !== "string") {
    return new Date().toISOString();
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString()
    : value;
};

const normalizeNotification = (
  payload: unknown,
): UserNotification | undefined => {
  if (!isRecord(payload)) {
    return undefined;
  }

  const id = getString(payload, "id");
  const title = getString(payload, "title");
  const message = getString(payload, "message");

  if (!id || !title || !message) {
    return undefined;
  }

  return {
    actionUrl: getNullableString(payload, "actionUrl") ?? null,
    createdAt: getCreatedAt(payload.createdAt),
    entityId: getNullableString(payload, "entityId") ?? null,
    entityName: getNullableString(payload, "entityName") ?? null,
    id,
    isDeleted: getBoolean(payload, "isDeleted", false),
    isRead: getBoolean(payload, "isRead", false),
    message,
    priority: getNotificationPriority(payload.priority),
    title,
    type: getNotificationType(payload.type),
    updatedAt: getNullableString(payload, "updatedAt") ?? null,
  };
};

const parseSocketMessage = (
  message: IMessage,
): UserNotification | undefined => {
  try {
    return normalizeNotification(JSON.parse(message.body));
  } catch {
    if (__DEV__) {
      console.warn("[notifications:socket] Ignored malformed payload");
    }

    return undefined;
  }
};

const getToastType = (notification: UserNotification) =>
  notification.type === "ERROR" || notification.priority === "HIGH"
    ? "errorToast"
    : "successToast";

export function NotificationSocketBridge() {
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  const userId = currentUserQuery.data?.data.userId;
  const subscriptionDestination = useMemo(
    () => (userId ? `/user/${userId}/queue/notifications` : undefined),
    [userId],
  );

  useEffect(() => {
    if (!WS_URL || !subscriptionDestination) {
      if (__DEV__ && !WS_URL) {
        console.warn(
          "[notifications:socket] Missing EXPO_PUBLIC_WS_URL",
        );
      }

      return;
    }

    let subscription: StompSubscription | undefined;
    let client: Client | undefined;
    let isActive = true;

    const readConnectHeaders = async () => {
      const accessToken = await SecureStore.getItemAsync(
        ACCESS_TOKEN_KEY,
      );

      if (!accessToken) {
        return undefined;
      }

      return {
        Authorization: `Bearer ${accessToken}`,
      };
    };

    const startClient = async () => {
      const initialConnectHeaders = await readConnectHeaders();

      if (!isActive || !initialConnectHeaders) {
        if (__DEV__) {
          console.warn(
            "[notifications:socket] Missing access token",
          );
        }

        return;
      }

      client = new Client({
        brokerURL: WS_URL,
        connectHeaders: initialConnectHeaders,
        reconnectDelay: 5000,
        debug: () => undefined,
        beforeConnect: async () => {
          const latestConnectHeaders = await readConnectHeaders();

          if (!latestConnectHeaders) {
            if (__DEV__) {
              console.warn(
                "[notifications:socket] Missing access token",
              );
            }

            void client?.deactivate();
            return;
          }

          if (client) {
            client.connectHeaders = latestConnectHeaders;
          }
        },
        onConnect: () => {
          if (!isActive || !client) {
            return;
          }

          if (__DEV__) {
            console.log("[notifications:socket] Connected");
          }

          subscription = client.subscribe(
            subscriptionDestination,
            (message) => {
              const notification = parseSocketMessage(message);

              if (!notification) {
                return;
              }

              upsertLoadedNotification(queryClient, notification);

              Toast.show({
                type: getToastType(notification),
                text1: notification.title,
                text2: notification.message,
                position: "top",
                topOffset: 60,
              });

              void queryClient.invalidateQueries({
                queryKey: USER_NOTIFICATIONS_QUERY_KEY,
              });
            },
          );
        },
        onDisconnect: () => {
          if (__DEV__) {
            console.log("[notifications:socket] Disconnected");
          }
        },
        onStompError: (frame) => {
          if (__DEV__) {
            console.warn(
              "[notifications:socket] STOMP error",
              frame.headers.message,
            );
          }
        },
        onWebSocketClose: () => {
          if (__DEV__) {
            console.log("[notifications:socket] WebSocket closed");
          }
        },
        onWebSocketError: () => {
          if (__DEV__) {
            console.warn("[notifications:socket] WebSocket error");
          }
        },
      });

      client.activate();
    };

    void startClient();

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "active") {
          void queryClient.invalidateQueries({
            queryKey: USER_NOTIFICATIONS_QUERY_KEY,
          });
        }
      },
    );

    return () => {
      isActive = false;
      appStateSubscription.remove();
      subscription?.unsubscribe();
      void client?.deactivate();
    };
  }, [queryClient, subscriptionDestination]);

  return null;
}
