import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline';
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  disabled, 
  variant = 'primary', 
  ...props 
}) => {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      className={`h-12 rounded-xl items-center justify-center ${
        disabled 
          ? 'bg-brand-border' 
          : isOutline 
            ? 'bg-transparent border border-brand-link' 
            : 'bg-brand-link' 
      }`}
      disabled={disabled}
      {...props}
    >
      <Text className={`font-inter font-medium text-base ${
        disabled ? 'text-white' : isOutline ? 'text-brand-link' : 'text-white'
      }`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};