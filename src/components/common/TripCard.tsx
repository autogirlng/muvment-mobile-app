import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import {
  getDriverTripBadgeStyle,
  type DriverTripBadge,
} from '../../utils/driverTrips';

interface TripCardProps {
  badges: DriverTripBadge[];
  clientName: string;
  location: string;
  vehicle: string;
  timeRange: string;
  tripId: string;
  onPress?: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  badges,
  clientName,
  location,
  vehicle,
  timeRange,
  tripId,
  onPress
}) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white border border-[#E4E7EC] rounded-2xl p-4 mb-4 shadow-sm"
    >
      <View className="flex-row flex-wrap gap-2 mb-4">
        {badges.map((badge, index) => {
          const style = getDriverTripBadgeStyle(badge.label, badge.type);
          return (
            <View key={index} className={`px-2.5 py-1 rounded-full ${style.bg}`}>
              <Text className={`font-inter font-semibold text-[10px] tracking-wide uppercase ${style.text}`}>
                {badge.label}
              </Text>
            </View>
          );
        })}
      </View>

      <Text className="font-inter font-medium text-lg text-[#101928] mb-4">
        {clientName}
      </Text>

      <View className="space-y-3 mb-4">
        <View className="flex-row items-center mb-2">
          <Feather name="map-pin" size={16} color="#98A2B3" />
          <Text className="ml-2 font-inter text-[#475367] text-sm flex-1">
            {location}
          </Text>
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name="car-outline" size={16} color="#98A2B3" />
          <Text className="ml-2 font-inter text-[#475367] text-sm flex-1">
            {vehicle}
          </Text>
        </View>

        <View className="flex-row items-center mb-2">
          <Feather name="clock" size={16} color="#98A2B3" />
          <Text className="ml-2 font-inter text-[#475367] text-sm flex-1">
            {timeRange}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-[#E4E7EC] w-full mb-3" />

      <Text className="text-right font-inter font-semibold text-[11px] text-[#667185] tracking-[2px] uppercase">
        {tripId}
      </Text>
    </TouchableOpacity>
  );
};
