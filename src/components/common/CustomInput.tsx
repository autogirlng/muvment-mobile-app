import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CustomInputProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
  hasError?: boolean;    // NEW: Triggers the red border
  errorMessage?: string; // NEW: Renders the error text
}

export const CustomInput: React.FC<CustomInputProps> = ({ 
  label, 
  isPassword, 
  hasError,
  errorMessage,
  ...props 
}) => {
  const [isSecure, setIsSecure] = useState(isPassword);

  return (
    // Reduce bottom margin if there's an error message so it doesn't push elements too far down
    <View className={errorMessage ? "mb-2" : "mb-5"}>
      <Text className="text-brand-primary font-inter font-medium text-sm mb-2">
        {label}
      </Text>
      
      <View 
        className={`flex-row items-center border rounded-xl px-4 h-12 bg-white ${
          hasError ? 'border-[#D92D20]' : 'border-brand-border'
        }`}
      >
        <TextInput
          className="flex-1 font-inter text-brand-primary h-full text-base"
          placeholderTextColor="#98A2B3"
          secureTextEntry={isSecure}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} className="ml-2 pt-1">
            <Feather 
              name={isSecure ? "eye" : "eye-off"} 
              size={20} 
              color="#475367" 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Render the error text if provided */}
      {errorMessage && (
        <Text className="text-[#D92D20] font-inter text-sm mt-1.5 ml-1">
          {errorMessage}
        </Text>
      )}
    </View>
  );
};