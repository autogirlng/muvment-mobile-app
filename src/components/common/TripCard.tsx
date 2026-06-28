import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export interface BadgeProps {
  label: string;
}

interface TripCardProps {
  badges: BadgeProps[];
  clientName: string;
  location: string;
  vehicle: string;
  timeRange: string;
  tripId: string;
  onPress?: () => void;
}

const getBadgeStyle = (label: string) => {
  switch (label.toUpperCase()) {
    case 'ONGOING': return { bg: 'bg-[#12B76A]', text: 'text-white' };
    case 'FULL DAY RENTAL': return { bg: 'bg-[#F4EBFF]', text: 'text-[#6941C6]' };
    case 'CUSTOMER': return { bg: 'bg-[#101928]', text: 'text-[#F5A623]' };
    case 'NOT STARTED': return { bg: 'bg-[#F79009]', text: 'text-white' };
    case 'CHECKED IN': return { bg: 'bg-[#12B76A]', text: 'text-white' };
    case 'STANDARD': return { bg: 'bg-[#E0EAFF]', text: 'text-[#3538CD]' };
    case 'MAINTENANCE': return { bg: 'bg-[#E4E7EC]', text: 'text-[#475367]' };
    case 'AWAITING PICKUP': return { bg: 'bg-[#F97316]', text: 'text-white' };
    case 'RUNNING LATE': return { bg: 'bg-[#D92D20]', text: 'text-white' };
    case 'COMPANY': return { bg: 'bg-[#2D3192]', text: 'text-white' };
    // New status badges added below
    case 'COMPLETE': return { bg: 'bg-[#667185]', text: 'text-white' };
    case 'AIRPORT': return { bg: 'bg-[#CFFAFE]', text: 'text-[#0891B2]' };
    case 'CANCELLED': return { bg: 'bg-[#D92D20]', text: 'text-white' };
    default: return { bg: 'bg-[#F2F4F7]', text: 'text-[#475367]' };
  }
};

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
          const style = getBadgeStyle(badge.label);
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
        <View className="flex-row items-center">
          <Feather name="map-pin" size={16} color="#98A2B3" />
          <Text className="ml-2 font-inter text-[#475367] text-sm flex-1">
            {location}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="car-outline" size={16} color="#98A2B3" />
          <Text className="ml-2 font-inter text-[#475367] text-sm flex-1">
            {vehicle}
          </Text>
        </View>

        <View className="flex-row items-center">
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
