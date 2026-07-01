import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SettingsToggleProps {
  iconName: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
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
        onPress={() => onValueChange(!value)}
        className={`w-14 h-8 rounded-full flex-row items-center ${
          value ? 'bg-[#1D2739]' : 'bg-[#D0D5DD]'
        }`}
      >
        {/* The small vertical indicator line (visible when active) */}
        {value && (
          <View className="w-[2px] h-3.5 bg-white/50 ml-2.5 rounded-full" />
        )}
        
        {/* The toggle thumb */}
        <View 
          className={`w-6 h-6 bg-white rounded-full absolute transition-all duration-200 ${
            value ? 'right-1' : 'left-1'
          }`} 
        />
      </TouchableOpacity>
    </View>
  );
};