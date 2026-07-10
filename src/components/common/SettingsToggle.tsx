import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
  return (
    <View className="flex-row items-center justify-between px-6 py-4">
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

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => onValueChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        className={`w-14 h-8 rounded-full justify-center ${
          value ? 'bg-[#1D2739]' : 'bg-[#D0D5DD]'
        } ${disabled ? 'opacity-60' : ''}`}
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
