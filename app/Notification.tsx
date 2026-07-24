import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import { 
  ActivityIndicator,
  Platform,
  View, 
  Text, 
  SectionList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { getApiErrorMessage } from '../src/api/errors';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUserNotifications,
} from '../src/api/hooks/useNotifications';
import type { UserNotification } from '../src/api/types';
import { AppStatusBar } from '../src/components/common/AppStatusBar';
import { CustomBack } from '../src/components/common/CustomBack';
import { NotificationCard } from '../src/components/common/NotificationCard';
import { EmptyState } from '../src/components/common/EmptyState'; // Imported the reusable component

interface NotificationSection {
  title: 'Today' | 'Older';
  data: UserNotification[];
}

const parseNotificationDate = (value: string) => {
  const normalizedValue = value.replace(/(\.\d{3})\d+/, '$1');
  const date = new Date(normalizedValue);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const isToday = (value: string) => {
  const date = parseNotificationDate(value);

  if (!date) {
    return false;
  }

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const formatNotificationTimestamp = (value: string) => {
  const date = parseNotificationDate(value);

  if (!date) {
    return 'Time unavailable';
  }

  if (isToday(value)) {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getNotificationIcon = (
  notification: UserNotification,
): keyof typeof Feather.glyphMap => {
  if (notification.priority === 'HIGH') {
    return 'alert-circle';
  }

  switch (notification.type) {
    case 'ERROR':
      return 'alert-triangle';
    case 'SUCCESS':
      return 'check-circle';
    case 'WARNING':
      return 'alert-circle';
    case 'INFO':
    default:
      return 'bell';
  }
};

const groupNotifications = (
  notifications: UserNotification[],
): NotificationSection[] => {
  const todayNotifications: UserNotification[] = [];
  const olderNotifications: UserNotification[] = [];

  notifications.forEach((notification) => {
    if (isToday(notification.createdAt)) {
      todayNotifications.push(notification);
      return;
    }

    olderNotifications.push(notification);
  });

  return [
    todayNotifications.length > 0
      ? { title: 'Today' as const, data: todayNotifications }
      : undefined,
    olderNotifications.length > 0
      ? { title: 'Older' as const, data: olderNotifications }
      : undefined,
  ].filter((section): section is NotificationSection => Boolean(section));
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const notificationsQuery = useUserNotifications();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const [readingNotificationId, setReadingNotificationId] = useState<string>();
  const refetchNotifications = notificationsQuery.refetch;

  const notifications = useMemo(
    () =>
      notificationsQuery.data?.pages.flatMap((page) => page.data.content) ??
      [],
    [notificationsQuery.data],
  );
  const notificationSections = useMemo(
    () => groupNotifications(notifications),
    [notifications],
  );
  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.isRead,
  );
  const errorMessage = getApiErrorMessage(notificationsQuery.error);
  const isInitialLoading =
    notificationsQuery.isLoading && notificationSections.length === 0;
  const isRefreshing =
    notificationsQuery.isRefetching && !notificationsQuery.isFetchingNextPage;

  useFocusEffect(
    useCallback(() => {
      void refetchNotifications();
    }, [refetchNotifications]),
  );

  const handleEndReached = () => {
    if (
      notificationsQuery.hasNextPage &&
      !notificationsQuery.isFetchingNextPage
    ) {
      void notificationsQuery.fetchNextPage();
    }
  };

  const handleMarkNotificationRead = async (notification: UserNotification) => {
    if (notification.isRead || readingNotificationId) {
      return;
    }

    setReadingNotificationId(notification.id);

    try {
      await markNotificationRead.mutateAsync(notification.id);
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Unable to update notification',
        text2: getApiErrorMessage(error) ?? 'Please try again.',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setReadingNotificationId(undefined);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!hasUnreadNotifications || markAllNotificationsRead.isPending) {
      return;
    }

    try {
      const response = await markAllNotificationsRead.mutateAsync();

      Toast.show({
        type: 'successToast',
        text1: response.message || 'All notifications marked as read',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Unable to mark all as read',
        text2: getApiErrorMessage(error) ?? 'Please try again.',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <View
        className="px-6 pb-4"
        style={{
          paddingTop:
            Platform.OS === 'android' ? Math.max(insets.top, 20) + 8 : 8,
        }}
      >
        <CustomBack color="#1D2739" className="mb-4" />
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-inter font-bold text-[#000000]">
            Notifications
          </Text>

          {notifications.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={
                !hasUnreadNotifications || markAllNotificationsRead.isPending
              }
              onPress={handleMarkAllNotificationsRead}
              className={`flex-row items-center px-3 py-2 rounded-lg border ${
                hasUnreadNotifications
                  ? 'border-[#0673FF]'
                  : 'border-[#D0D5DD]'
              }`}
            >
              <Feather
                name="check-circle"
                size={16}
                color={hasUnreadNotifications ? '#0673FF' : '#98A2B3'}
              />
              <Text
                className={`font-inter font-medium text-xs ml-1.5 ${
                  hasUnreadNotifications ? 'text-[#0673FF]' : 'text-[#98A2B3]'
                }`}
              >
                Mark all
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isInitialLoading ? (
        <View className="flex-1 items-center justify-center pb-20">
          <ActivityIndicator size="small" color="#0673FF" />
          <Text className="font-inter text-[#667185] mt-3">
            Loading notifications
          </Text>
        </View>
      ) : notificationsQuery.isError && notificationSections.length === 0 ? (
        <View className="flex-1 justify-center pb-20">
          <EmptyState
            title="Unable to load notifications"
            description={errorMessage ?? 'Please check your connection and try again.'}
          />
        </View>
      ) : notificationSections.length > 0 ? (
        <SectionList
          sections={notificationSections}
          keyExtractor={(notification) => notification.id}
          contentContainerStyle={{
            paddingBottom: 24,
            paddingHorizontal: 16,
          }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          refreshing={isRefreshing}
          onRefresh={() => {
            void notificationsQuery.refetch();
          }}
          renderSectionHeader={({ section }) => (
            <Text className="font-inter font-medium text-[13px] text-[#475367] tracking-wider mb-3 mt-1 ml-1 uppercase">
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <NotificationCard
              iconName={getNotificationIcon(item)}
              title={item.title}
              description={item.message}
              timestamp={formatNotificationTimestamp(item.createdAt)}
              isRead={item.isRead}
              onPress={
                item.isRead
                  ? undefined
                  : () => {
                      void handleMarkNotificationRead(item);
                    }
              }
            />
          )}
          ListFooterComponent={
            notificationsQuery.isFetchingNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#0673FF" />
              </View>
            ) : null
          }
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <View className="flex-1 justify-center pb-20">
          <EmptyState
            title="No notifications yet"
            description="When you receive trip updates, reminders, or alerts, they'll appear here."
          />
        </View>
      )}

    </SafeAreaView>
  );
}
