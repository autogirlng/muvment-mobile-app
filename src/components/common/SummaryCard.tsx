import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SummaryCardProps {
  title: string;
  subtitle: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, subtitle }) => {
  return (
    <View className="border border-[#E4E7EC] rounded-xl bg-white p-4 mb-3 flex-row items-center shadow-sm">
      <View className="w-6 h-6 rounded-full bg-[#12B76A] items-center justify-center mr-3">
        <Feather name="check" size={14} color="#FFFFFF" />
      </View>
      <View className="flex-1">
        <Text className="font-inter font-medium text-[15px] text-[#101928] mb-0.5">
          {title}
        </Text>
        <Text className="font-inter text-[#667185] text-[13px]">
          {subtitle}
        </Text>
      </View>
    </View>
  );
};
