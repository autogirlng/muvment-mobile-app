import React from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAppTheme } from '../../theme/useAppTheme';

interface SearchBarProps extends TextInputProps {
  onMenuPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onMenuPress, ...props }) => {
  const theme = useAppTheme();
  const iconColor = theme.styles.icon ?? '#98A2B3';

  return (
    <View className="px-4 pb-4">
      <View
        className="flex-row items-center bg-white border border-dashboard-cardBorder rounded-2xl px-4 h-16"
        style={theme.styles.card}
      >
        <Feather name="search" size={20} color={iconColor} />
        <TextInput
          className="flex-1 font-inter text-base text-brand-primary ml-3 h-full"
          placeholderTextColor={theme.isDark ? theme.colors.textSubtle : '#98A2B3'}
          style={theme.styles.primaryText}
          {...props}
        />
        <TouchableOpacity 
          onPress={onMenuPress} 
          className="ml-2 w-10 h-10 border border-dashboard-cardBorder rounded-xl items-center justify-center"
          style={theme.styles.border}
        >
          <Feather name="more-vertical" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
