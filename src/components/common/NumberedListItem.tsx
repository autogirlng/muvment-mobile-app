import React from 'react';
import { View, Text } from 'react-native';

interface NumberedListItemProps {
  index: number;
  text: string;
  size?: 'small' | 'medium'; // Small for Step 6 timestamps, Medium for Step 5 requirements
}

export const NumberedListItem: React.FC<NumberedListItemProps> = ({ index, text, size = 'small' }) => {
  const isSmall = size === 'small';
  
  return (
    <View className={`flex-row items-center ${isSmall ? 'mb-2.5' : 'mb-3'}`}>
      <View className={`rounded-full bg-[#E4E7EC] items-center justify-center mr-3 ${
        isSmall ? 'w-[15px] h-[15px]' : 'w-[18px] h-[18px]'
      }`}>
        <Text className={`font-inter font-bold text-[#98A2B3] ${
          isSmall ? 'text-[8px]' : 'text-[9px]'
        }`}>
          {index}
        </Text>
      </View>
      <Text className={`font-inter text-[#667185] ${
        isSmall ? 'text-[13px]' : 'text-[14px]'
      }`}>
        {text}
      </Text>
    </View>
  );
};