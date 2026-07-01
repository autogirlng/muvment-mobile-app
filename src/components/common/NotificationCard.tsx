import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface NotificationCardProps {
  iconName: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  timestamp: string;
  isDismissible?: boolean;
  onDismiss?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  iconName,
  title,
  description,
  timestamp,
  isDismissible = false,
  onDismiss,
}) => {
  return (
    <View className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden flex-row border border-[#E4E7EC]">
      {/* Thick Blue Left Border Indicator */}
      <View className="w-1.5 bg-[#0673FF]" />
      
      {/* Main Content Area */}
      <View className="flex-1 p-4 flex-row items-start">
        
        {/* Icon Container */}
        <View className="w-10 h-10 rounded-xl bg-[#EFF4FF] items-center justify-center mr-3 mt-0.5 border border-[#D1E0FF]">
          <Feather name={iconName} size={18} color="#0673FF" />
        </View>

        {/* Text Content */}
        <View className="flex-1 pr-2">
          <Text className="font-inter font-semibold text-[#101928] text-[15px] mb-1">
            {title}
          </Text>
          <Text className="font-inter text-[#475367] text-[14px] leading-5 mb-2">
            {description}
          </Text>
          <Text className="font-inter text-[#98A2B3] text-xs">
            {timestamp}
          </Text>
        </View>

        {/* Optional Dismiss Button */}
        {isDismissible && (
          <TouchableOpacity 
            onPress={onDismiss}
            className="p-1 ml-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={20} color="#101928" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};