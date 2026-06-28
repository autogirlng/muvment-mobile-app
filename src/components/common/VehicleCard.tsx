import React from 'react';
import { View, Text, Image } from 'react-native';

interface VehicleCardProps {
  model: string;
  plate: string;
  imageUri?: string;
  statusText?: string;
}

const DEFAULT_VEHICLE_IMAGE = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800';

export const VehicleCard: React.FC<VehicleCardProps> = ({
  model,
  plate,
  imageUri = DEFAULT_VEHICLE_IMAGE,
  statusText = 'Selected for this ride',
}) => {
  return (
    <View className="border border-[#E4E7EC] rounded-2xl bg-white overflow-hidden shadow-sm">
      <Image
        source={{ uri: imageUri }}
        className="w-full h-40"
        resizeMode="cover"
      />

      <View className="p-4">
        <Text className="font-inter font-medium text-[16px] text-[#475367] mb-1">
          {model}
        </Text>
        <Text className="font-inter text-[#98A2B3] text-[14px] mb-4">
          {plate}
        </Text>

        <View className="flex-row items-center">
          <View className="w-1.5 h-1.5 rounded-full bg-[#12B76A] mr-2" />
          <Text className="font-inter text-[#475367] text-[13px]">
            {statusText}
          </Text>
        </View>
      </View>
    </View>
  );
};
