import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const DEFAULT_NOTIFICATION_CHANNEL_ID = "default";

export const configureAndroidNotificationChannel = async () => {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    DEFAULT_NOTIFICATION_CHANNEL_ID,
    {
      importance: Notifications.AndroidImportance.DEFAULT,
      name: "Default",
    },
  );
};

export const getPushNotificationPermissionStatus = async () => {
  const permission = await Notifications.getPermissionsAsync();

  return permission.status;
};

export const requestPushNotificationPermission = async () => {
  await configureAndroidNotificationChannel();

  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.status === "granted") {
    return true;
  }

  if (!currentPermission.canAskAgain) {
    return false;
  }

  const nextPermission = await Notifications.requestPermissionsAsync();

  return nextPermission.status === "granted";
};
