import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface LocationRowProps {
  title: string;
  address: string;
  onMapPress?: () => void;
}

export const LocationRow: React.FC<LocationRowProps> = ({ title, address, onMapPress }) => {
  return (
    <View className="mb-6">
      <Text className="font-inter font-semibold text-[13px] text-[#475367] tracking-wider uppercase mb-4">
        {title}
      </Text>
      <View className="flex-row">
        <Feather name="map-pin" size={18} color="#98A2B3" className="mt-0.5" />
        <View className="ml-3 flex-1">
          <Text className="font-inter font-medium text-[#101928] text-[15px] mb-1 leading-5">
            {address}
          </Text>
          <TouchableOpacity onPress={onMapPress}>
            <Text className="text-[#0673FF] font-inter text-[13px]">Open in Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};