import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAppTheme } from '../../theme/useAppTheme';

interface SettingsToggleProps {
  disabled?: boolean;
  iconName: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  disabled = false,
  iconName,
  title,
  description,
  value,
  onValueChange,
}) => {
  const theme = useAppTheme();
  const iconColor = theme.styles.icon ?? '#475367';
  const activeTrackColor = theme.isDark ? theme.colors.primary : '#1D2739';
  const inactiveTrackColor = theme.isDark ? theme.colors.surfaceAlt : '#D0D5DD';

  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      <View className="flex-row items-center flex-1 pr-4">
        <Feather name={iconName} size={20} color={iconColor} />
        <View className="ml-4">
          <Text
            className="text-brand-primary font-inter font-medium text-base mb-0.5"
            style={theme.styles.primaryText}
          >
            {title}
          </Text>
          <Text
            className="text-brand-secondary font-inter text-sm"
            style={theme.styles.mutedText}
          >
            {description}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => onValueChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        className={`w-14 h-8 rounded-full justify-center ${disabled ? 'opacity-60' : ''}`}
        style={{ backgroundColor: value ? activeTrackColor : inactiveTrackColor }}
      >
        <View
          className="w-6 h-6 bg-white rounded-full"
          style={{
            transform: [{ translateX: value ? 28 : 4 }],
          }}
        />
      </TouchableOpacity>
    </View>
  );
};
