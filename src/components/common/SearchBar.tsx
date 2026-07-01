import React from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SearchBarProps extends TextInputProps {
  onMenuPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onMenuPress, ...props }) => {
  return (
    <View className="px-4 pb-4">
      <View className="flex-row items-center bg-white border border-dashboard-cardBorder rounded-2xl px-4 h-16">
        <Feather name="search" size={20} color="#98A2B3" />
        <TextInput
          className="flex-1 font-inter text-base text-brand-primary ml-3 h-full"
          placeholderTextColor="#98A2B3"
          {...props}
        />
        <TouchableOpacity 
          onPress={onMenuPress} 
          className="ml-2 w-10 h-10 border border-dashboard-cardBorder rounded-xl items-center justify-center"
        >
          <Feather name="more-vertical" size={20} color="#475367" />
        </TouchableOpacity>
      </View>
    </View>
  );
};