import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useUnreadNotificationsCount } from '../../api/hooks/useNotifications';

interface NotificationBellButtonProps {
  className?: string;
}

const formatUnreadCount = (unreadCount: number) =>
  unreadCount > 99 ? '99+' : String(unreadCount);

export const NotificationBellButton = ({
  className = '',
}: NotificationBellButtonProps) => {
  const { unreadCount } = useUnreadNotificationsCount();
  const hasUnreadNotifications = unreadCount > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push('/Notification')}
      className={`w-10 h-10 rounded-full items-center justify-center relative border border-[#D0D5DD] ${className}`}
    >
      <Feather name="bell" size={20} color="#1E3A5F" />

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
