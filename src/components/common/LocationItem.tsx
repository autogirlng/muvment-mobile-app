import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface LocationItemProps {
  title: string;
  address: string;
  onMapPress?: () => void;
  showDropdown?: boolean; // If true, it looks like an input (Step 1). If false, it looks like read-only text (Trip Details).
  details?: string[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const LocationItem: React.FC<LocationItemProps> = ({ 
  title, 
  address, 
  onMapPress, 
  showDropdown = false,
  details = [],
  isExpanded = false,
  onToggle,
}) => {
  const LocationContent = (
    <View className={`flex-row items-center mb-2 ${
      showDropdown ? 'border border-[#E4E7EC] rounded-xl p-4 bg-white justify-between' : ''
    }`}>
      <View className="flex-row items-center flex-1">
        <Feather name="map-pin" size={18} color="#98A2B3" className={!showDropdown ? "mt-0.5" : ""} />
        <Text 
          className="font-inter text-[#101928] text-[15px] ml-3 flex-1" 
          numberOfLines={showDropdown ? 1 : undefined}
        >
          {address}
        </Text>
      </View>
      {showDropdown && <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#101928" />}
    </View>
  );

  return (
    <View className="mb-6">
      <Text className={`font-inter uppercase mb-2 ${
        showDropdown ? 'font-medium text-[13px] text-[#101928]' : 'font-semibold text-[13px] text-[#475367] tracking-wider'
      }`}>
        {title}
      </Text>
      
      {showDropdown && onToggle ? (
        <TouchableOpacity activeOpacity={0.85} onPress={onToggle}>
          {LocationContent}
        </TouchableOpacity>
      ) : LocationContent}

      {showDropdown && isExpanded && details.length > 0 && (
        <View className="border border-[#E4E7EC] rounded-xl bg-white p-4 mb-3">
          <Text className="font-inter text-[#667185] text-[13px] mb-2">
            Assigned address
          </Text>
          <Text className="font-inter font-medium text-[#101928] text-[14px] mb-4">
            {address}
          </Text>

          <Text className="font-inter text-[#667185] text-[13px] mb-2">
            Trip context
          </Text>
          {details.map((detail) => (
            <View key={detail} className="flex-row items-start mb-2">
              <View className="w-1.5 h-1.5 rounded-full bg-[#0673FF] mt-2 mr-2" />
              <Text className="font-inter text-[#475367] text-[14px] flex-1">
                {detail}
              </Text>
            </View>
          ))}
        </View>
      )}

      {onMapPress && (
        <TouchableOpacity onPress={onMapPress} className={!showDropdown ? "ml-7" : ""}>
          <Text className="text-[#0673FF] font-inter text-[13px]">Open in Maps</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
