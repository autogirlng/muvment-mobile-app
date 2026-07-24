import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useUnreadNotificationsCount } from '../../api/hooks/useNotifications';
import { useAppTheme } from '../../theme/useAppTheme';

interface NotificationBellButtonProps {
  className?: string;
}

const formatUnreadCount = (unreadCount: number) =>
  unreadCount > 99 ? '99+' : String(unreadCount);

export const NotificationBellButton = ({
  className = '',
}: NotificationBellButtonProps) => {
  const theme = useAppTheme();
  const { unreadCount } = useUnreadNotificationsCount();
  const hasUnreadNotifications = unreadCount > 0;
  const hasCustomBackground = className.includes('bg-');

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push('/Notification')}
      className={`w-10 h-10 rounded-full items-center justify-center relative border border-[#D0D5DD] ${className}`}
      style={
        theme.isDark
          ? {
              backgroundColor: hasCustomBackground ? undefined : theme.colors.surface,
              borderColor: theme.colors.border,
            }
          : undefined
      }
    >
      <Feather
        name="bell"
        size={20}
        color={theme.isDark ? theme.colors.textMuted : '#1E3A5F'}
      />

      {hasUnreadNotifications && (
        <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0673FF] items-center justify-center border border-white">
          <Text className="font-inter font-bold text-[10px] leading-3 text-white">
            {formatUnreadCount(unreadCount)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
