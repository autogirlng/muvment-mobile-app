import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface NotificationCardProps {
  iconName: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  timestamp: string;
  isRead?: boolean;
  isDismissible?: boolean;
  onDismiss?: () => void;
  onPress?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  iconName,
  title,
  description,
  timestamp,
  isRead = false,
  isDismissible = false,
  onDismiss,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={!onPress}
      onPress={onPress}
      className={`bg-white rounded-xl shadow-sm mb-3 overflow-hidden flex-row border ${
        isRead ? 'border-[#E4E7EC]' : 'border-[#B2CCFF]'
      }`}
    >
      <View className={`w-1.5 ${isRead ? 'bg-[#D0D5DD]' : 'bg-[#0673FF]'}`} />
      
      {/* Main Content Area */}
      <View className="flex-1 p-4 flex-row items-start">
        
        {/* Icon Container */}
        <View
          className={`w-10 h-10 rounded-xl items-center justify-center mr-3 mt-0.5 border ${
            isRead
              ? 'bg-[#F2F4F7] border-[#E4E7EC]'
              : 'bg-[#EFF4FF] border-[#D1E0FF]'
          }`}
        >
          <Feather name={iconName} size={18} color={isRead ? '#667185' : '#0673FF'} />
        </View>

        {/* Text Content */}
        <View className="flex-1 pr-2">
          <View className="flex-row items-center mb-1">
            {!isRead && (
              <View className="w-2 h-2 rounded-full bg-[#0673FF] mr-2" />
            )}
            <Text
              className={`font-inter text-[15px] flex-1 ${
                isRead
                  ? 'font-medium text-[#475367]'
                  : 'font-semibold text-[#101928]'
              }`}
            >
              {title}
            </Text>
          </View>
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
    </TouchableOpacity>
  );
};
