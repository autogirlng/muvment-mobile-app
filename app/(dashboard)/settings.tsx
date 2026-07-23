import React, { useEffect, useState } from 'react';
import { 
  AppState,
  Linking,
  Platform,
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '../../src/api/errors';
import {
  useDriverNotificationSettings,
  useToggleDriverNotificationSettings,
} from '../../src/api/hooks/useDriverSettings';
import { DashboardHeader } from '../../src/components/layout/DashboardHeader';
import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ConfirmationModal } from '../../src/components/common/ConfirmModal';
import { SettingsToggle } from '../../src/components/common/SettingsToggle';
import { useAuthSession } from '../../src/context/AuthSessionContext';

const ANDROID_DASHBOARD_TAB_BAR_BASE_HEIGHT = 70;
const ANDROID_DASHBOARD_TAB_BAR_BOTTOM_PADDING_MIN = 20;
const ANDROID_DASHBOARD_TAB_BAR_BOTTOM_PADDING_EXTRA = 8;
const IOS_DASHBOARD_TAB_BAR_HEIGHT = 85;
const SIGN_OUT_BUTTON_HEIGHT = 56;
const SIGN_OUT_BUTTON_GAP = 24;
const IOS_SIGN_OUT_BOTTOM_OFFSET_MIN = 32;
const IOS_SIGN_OUT_BOTTOM_OFFSET_EXTRA = 16;
const SUPPORT_EMAIL = 'info@autogirl.ng';

interface SettingsActionRowProps {
  iconName: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}

const SettingsActionRow = ({
  iconName,
  title,
  description,
  onPress,
}: SettingsActionRowProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    className="flex-row items-center justify-between px-6 py-4"
  >
    <View className="flex-row items-center flex-1 pr-4">
      <Feather name={iconName} size={20} color="#475367" />
      <View className="ml-4">
        <Text className="text-brand-primary font-inter font-medium text-base mb-0.5">
          {title}
        </Text>
        <Text className="text-brand-secondary font-inter text-sm">
          {description}
        </Text>
      </View>
    </View>
    <Feather name="chevron-right" size={20} color="#98A2B3" />
  </TouchableOpacity>
);

const isLocationPermissionGranted = (permission: {
  granted?: boolean;
  status?: string;
}) => permission.granted === true || permission.status === 'granted';

const openAppSettings = async () => {
  try {
    await Linking.openSettings();
  } catch {
    await Linking.openURL('app-settings:');
  }
};

const reportProblem = async () => {
  const subject = encodeURIComponent('Muvment Driver App Problem Report');
  const body = encodeURIComponent(
    'Please describe the problem you experienced:\n\n',
  );

  try {
    await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  } catch {
    Toast.show({
      type: 'errorToast',
      text1: 'Unable to open email',
      text2: `Please contact ${SUPPORT_EMAIL}.`,
      position: 'top',
      topOffset: 60,
    });
  }
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const authSession = useAuthSession();
  const queryClient = useQueryClient();
  const notificationSettingsQuery = useDriverNotificationSettings();
  const toggleDriverNotificationSettings =
    useToggleDriverNotificationSettings();
  const [locationServices, setLocationServices] = useState(false);
  const [isLocationPermissionLoading, setLocationPermissionLoading] = useState(false);
  
  // State to control the visibility of the confirmation modal
  const [isSignOutModalVisible, setSignOutModalVisible] = useState(false);

  const pushNotifications =
    notificationSettingsQuery.data?.data.sendNotification ?? false;
  const isPushNotificationLoading =
    notificationSettingsQuery.isLoading ||
    toggleDriverNotificationSettings.isPending;
  const notificationErrorMessage = getApiErrorMessage(
    notificationSettingsQuery.error,
  );
  const isPushNotificationToggleDisabled =
    isPushNotificationLoading || !notificationSettingsQuery.data;
  const pushNotificationDescription = notificationSettingsQuery.isError
    ? notificationErrorMessage ?? 'Unable to load notification preference'
    : pushNotifications
      ? 'Trip alerts are enabled'
      : 'Trip alerts are off';
  const dashboardTabBarHeight =
    Platform.OS === 'android'
      ? ANDROID_DASHBOARD_TAB_BAR_BASE_HEIGHT +
        Math.max(insets.bottom, ANDROID_DASHBOARD_TAB_BAR_BOTTOM_PADDING_MIN) +
        ANDROID_DASHBOARD_TAB_BAR_BOTTOM_PADDING_EXTRA
      : IOS_DASHBOARD_TAB_BAR_HEIGHT;
  const signOutBottomOffset =
    Platform.OS === 'ios'
      ? Math.max(insets.bottom + IOS_SIGN_OUT_BOTTOM_OFFSET_EXTRA, IOS_SIGN_OUT_BOTTOM_OFFSET_MIN)
      : dashboardTabBarHeight + Math.max(insets.bottom, 16);
  const scrollBottomPadding =
    signOutBottomOffset + SIGN_OUT_BUTTON_HEIGHT + SIGN_OUT_BUTTON_GAP;

  const syncLocationPermission = async () => {
    try {
      const [permission, servicesEnabled] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        Location.hasServicesEnabledAsync(),
      ]);

      setLocationServices(
        isLocationPermissionGranted(permission) && servicesEnabled,
      );
    } catch {
      setLocationServices(false);
    }
  };

  useEffect(() => {
    void syncLocationPermission();

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void syncLocationPermission();
      }
    });

    return () => appStateSubscription.remove();
  }, []);

  const requestLocationPermission = async () => {
    setLocationPermissionLoading(true);

    try {
      let permission = await Location.getForegroundPermissionsAsync();

      if (!isLocationPermissionGranted(permission) && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (isLocationPermissionGranted(permission)) {
        const servicesEnabled = await Location.hasServicesEnabledAsync();

        if (!servicesEnabled) {
          setLocationServices(false);
          Toast.show({
            type: 'errorToast',
            text1: 'Turn on device location',
            text2: 'Location permission is enabled, but device location services are off.',
            position: 'top',
            topOffset: 60,
          });
          return;
        }

        setLocationServices(true);

        Toast.show({
          type: 'successToast',
          text1: 'Location enabled',
          position: 'top',
          topOffset: 60,
        });
        return;
      }

      setLocationServices(false);

      Toast.show({
        type: 'errorToast',
        text1: 'Location permission required',
        text2: permission.canAskAgain
          ? 'Please allow location access to use navigation.'
          : 'Turn on location access in your app settings.',
        position: 'top',
        topOffset: 60,
      });

      if (!permission.canAskAgain) {
        setTimeout(() => {
          void openAppSettings();
        }, 500);
      }
    } catch {
      setLocationServices(false);
      Toast.show({
        type: 'errorToast',
        text1: 'Unable to enable location',
        text2: 'Please try again from your device settings.',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLocationPermissionLoading(false);
    }
  };

  const handleLocationServicesChange = async (nextValue: boolean) => {
    if (nextValue) {
      await requestLocationPermission();
      return;
    }

    Toast.show({
      type: 'errorToast',
      text1: 'Manage location in Settings',
      text2: 'Location permission can only be turned off from your device settings.',
      position: 'top',
      topOffset: 60,
    });
    await openAppSettings();
  };

  const handlePushNotificationsChange = async () => {
    if (isPushNotificationToggleDisabled) {
      return;
    }

    try {
      const response = await toggleDriverNotificationSettings.mutateAsync();

      Toast.show({
        type: 'successToast',
        text1: response.data.sendNotification
          ? 'Push notifications enabled'
          : 'Push notifications disabled',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Unable to update notifications',
        text2: getApiErrorMessage(error) ?? 'Please try again.',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const confirmSignOut = async () => {
    setSignOutModalVisible(false);

    try {
      await authSession.signOut();
      queryClient.clear();

      Toast.show({
        type: 'successToast',
        text1: 'Signed out successfully',
        position: 'top',
        topOffset: 60,
      });

      router.replace('/auth/login');
    } catch {
      Toast.show({
        type: 'errorToast',
        text1: 'Sign out failed',
        text2: 'Please try again.',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <AppStatusBar style="dark" backgroundColor="#FAFAFA" />
      <DashboardHeader title="Settings" />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: scrollBottomPadding,
        }}
        bounces={false}
      >
        <View className="mt-2">
          <SettingsToggle
            iconName="bell"
            title="Push Notifications"
            description={pushNotificationDescription}
            value={pushNotifications}
            onValueChange={handlePushNotificationsChange}
            disabled={isPushNotificationToggleDisabled}
          />
          
          <SettingsToggle
            iconName="map-pin"
            title="Location Services"
            description={
              locationServices
                ? 'Location access is enabled'
                : 'Required for navigation'
            }
            value={locationServices}
            onValueChange={handleLocationServicesChange}
            disabled={isLocationPermissionLoading}
          />

          <SettingsActionRow
            iconName="lock"
            title="Change Password"
            description="Update your account password"
            onPress={() => router.push('/change-password')}
          />

          <SettingsActionRow
            iconName="shield"
            title="Privacy Notice"
            description="Review how your information is handled"
            onPress={() => router.push('/privacy-policy')}
          />

          <SettingsActionRow
            iconName="file-text"
            title="Employee Terms of Use"
            description="Read driver app terms and conditions"
            onPress={() => router.push('/terms-of-use')}
          />

          <SettingsActionRow
            iconName="alert-circle"
            title="Report a Problem"
            description="Contact support about an app issue"
            onPress={reportProblem}
          />
        </View>
      </ScrollView>

      <View
        className="absolute left-6 right-6"
        style={{ bottom: signOutBottomOffset }}
      >
        <TouchableOpacity 
          onPress={() => setSignOutModalVisible(true)} // Opens the modal instead of instantly signing out
          className="flex-row items-center justify-between bg-white border border-[#E4E7EC] rounded-2xl px-4 h-14 shadow-sm"
        >
          <View className="flex-row items-center">
            <Feather name="log-out" size={20} color="#D92D20" />
            <Text className="ml-3 font-inter font-medium text-base text-[#D92D20]">
              Sign Out
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#D92D20" />
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={isSignOutModalVisible}
        onClose={() => setSignOutModalVisible(false)}
        onConfirm={confirmSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        confirmVariant="danger"
      />

    </SafeAreaView>
  );
}
