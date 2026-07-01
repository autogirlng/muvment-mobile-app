// src/components/common/PaymentCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export interface PaymentCardProps {
  category: string;
  status: string;
  clientName: string;
  tripId: string;
  date: string;
  duration: string;
  onPress?: () => void;
}

// Helpers for the specific badge and border color mappings
const getStatusStyles = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDING': return { bg: 'bg-[#F5A623]', border: 'border-t-[#F5A623]' };
    case 'IN REVIEW': return { bg: 'bg-[#0673FF]', border: 'border-t-[#0673FF]' };
    case 'APPROVED': return { bg: 'bg-[#12B76A]', border: 'border-t-[#12B76A]' };
    case 'PAID': return { bg: 'bg-[#027A48]', border: 'border-t-[#027A48]' };
    case 'REJECTED': return { bg: 'bg-[#D92D20]', border: 'border-t-[#D92D20]' };
    default: return { bg: 'bg-[#98A2B3]', border: 'border-t-[#98A2B3]' };
  }
};

const getCategoryStyles = (category: string) => {
  switch (category.toUpperCase()) {
    case 'EXTRA HOURS': return { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' }; // Orange tint
    case 'INTERSTATE': return { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]' };  // Cyan tint
    case 'OFF DAY': return { bg: 'bg-[#FCE7F3]', text: 'text-[#DB2777]' };     // Pink tint
    default: return { bg: 'bg-[#F2F4F7]', text: 'text-[#475367]' };
  }
};

export const PaymentCard: React.FC<PaymentCardProps> = ({
  category,
  status,
  clientName,
  tripId,
  date,
  duration,
  onPress
}) => {
  const statusStyle = getStatusStyles(status);
  const categoryStyle = getCategoryStyles(category);

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      // The border-t-[3px] handles that specific colored top line from the design
      className={`bg-white border border-[#E4E7EC] border-t-[3px] rounded-2xl p-4 mb-4 shadow-sm ${statusStyle.border}`}
    >
      {/* Top Badges Row */}
      <View className="flex-row justify-between items-center mb-4">
        {/* Category Badge */}
        <View className={`px-2.5 py-1 rounded-full ${categoryStyle.bg}`}>
          <Text className={`font-inter font-semibold text-[10px] tracking-wide uppercase ${categoryStyle.text}`}>
            {category}
          </Text>
        </View>

        {/* Status Badge */}
        <View className={`px-2.5 py-1 rounded-full ${statusStyle.bg}`}>
          <Text className="font-inter font-semibold text-[10px] tracking-wide text-white uppercase">
            {status}
          </Text>
        </View>
      </View>

      {/* Client Name */}
      <Text className="font-inter font-semibold text-lg text-[#101928] mb-3">
        {clientName}
      </Text>

      {/* Details List */}
      <View className="space-y-2">
        <View className="flex-row items-center">
          <Ionicons name="car-outline" size={16} color="#98A2B3" />
          <Text className="ml-2 font-inter text-[#475367] text-sm">
            {tripId}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Feather name="calendar" size={16} color="#98A2B3" />
          <Text className="ml-2 font-inter text-[#475367] text-sm">
            {date}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Feather name="clock" size={16} color="#98A2B3" />
          <Text className="ml-2 font-inter text-[#475367] text-sm">
            {duration}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};