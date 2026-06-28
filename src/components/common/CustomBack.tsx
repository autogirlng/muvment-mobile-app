import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

interface CustomBackProps {
  label?: string;
  color?: string;
  onPress?: () => void;
  className?: string;
}

export const CustomBack: React.FC<CustomBackProps> = ({
  label = 'Back',
  color = '#FFFFFF',
  onPress,
  className = '',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress ?? (() => router.back())}
      className={`flex-row items-center ml-[-8px] ${className}`}
    >
      <Feather name="chevron-left" size={24} color={color} />
      <Text className="font-inter text-base ml-1" style={{ color }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
