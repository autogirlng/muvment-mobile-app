import React from 'react';
import { Tabs } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationSocketBridge } from '../../src/components/notifications/NotificationSocketBridge';
import { useAppTheme } from '../../src/theme/useAppTheme';

const ANDROID_TAB_BAR_BASE_HEIGHT = 70;
const ANDROID_TAB_BAR_BOTTOM_PADDING_MIN = 20;
const ANDROID_TAB_BAR_BOTTOM_PADDING_EXTRA = 8;
const IOS_TAB_BAR_HEIGHT = 85;
const IOS_TAB_BAR_BOTTOM_PADDING = 25;

export default function DashboardLayout() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const tabBarPaddingBottom =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, ANDROID_TAB_BAR_BOTTOM_PADDING_MIN) +
        ANDROID_TAB_BAR_BOTTOM_PADDING_EXTRA
      : IOS_TAB_BAR_BOTTOM_PADDING;
  const tabBarHeight =
    Platform.OS === 'android'
      ? ANDROID_TAB_BAR_BASE_HEIGHT + tabBarPaddingBottom
      : IOS_TAB_BAR_HEIGHT;

  return (
    <>
      <NotificationSocketBridge />
      <Tabs 
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.isDark ? theme.colors.primary : '#2563EB',
          tabBarInactiveTintColor: theme.isDark ? theme.colors.textSubtle : '#9CA3AF',
          tabBarStyle: { 
            backgroundColor: theme.isDark ? theme.colors.surface : '#FFFFFF',
            borderTopColor: theme.isDark ? theme.colors.border : '#F2F4F7',
            height: tabBarHeight, 
            paddingBottom: tabBarPaddingBottom, 
            paddingTop: 10,
            borderTopWidth: 1,
          },
          tabBarLabelStyle: { 
            fontFamily: 'Inter', 
            fontSize: 12, 
            marginTop: 4 
          }
        }}
      >
        <Tabs.Screen 
          name="home" 
          options={{ 
            title: 'Home', 
            tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="trips" 
          options={{ 
            title: 'Trips', 
            tabBarIcon: ({ color }) => <Ionicons name="car-outline" size={24} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="settings" 
          options={{ 
            title: 'Settings', 
            tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} /> 
          }} 
        />
      </Tabs>
    </>
  );
}
