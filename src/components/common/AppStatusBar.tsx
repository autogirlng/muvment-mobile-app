import React, { useCallback } from 'react';
import { Platform, StatusBar } from 'react-native';
import { useFocusEffect } from 'expo-router';

type AppStatusBarProps = {
  style?: 'dark' | 'light';
  backgroundColor?: string;
};

export const AppStatusBar: React.FC<AppStatusBarProps> = ({
  style = 'dark',
  backgroundColor = '#F8FAFC',
}) => {
  const barStyle = style === 'light' ? 'light-content' : 'dark-content';

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(barStyle, true);

      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(backgroundColor, true);
      }
    }, [backgroundColor, barStyle])
  );

  return null;
};
