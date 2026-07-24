import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAppTheme } from '../../theme/useAppTheme';

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
  const theme = useAppTheme();
  const iconColor = theme.styles.icon ?? '#98A2B3';
  const dropdownSurfaceStyle = showDropdown ? theme.styles.card : undefined;

  const LocationContent = (
    <View
      className={`flex-row items-center mb-2 ${
      showDropdown ? 'border border-[#E4E7EC] rounded-xl p-4 bg-white justify-between' : ''
    }`}
      style={dropdownSurfaceStyle}
    >
      <View className="flex-row items-center flex-1">
        <Feather name="map-pin" size={18} color={iconColor} className={!showDropdown ? "mt-0.5" : ""} />
        <Text 
          className="font-inter text-[#101928] text-[15px] ml-3 flex-1" 
          numberOfLines={showDropdown ? 1 : undefined}
          style={theme.styles.primaryText}
        >
          {address}
        </Text>
      </View>
      {showDropdown && (
        <Feather
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.isDark ? theme.colors.text : '#101928'}
        />
      )}
    </View>
  );

  return (
    <View className="mb-6">
      <Text
        className={`font-inter uppercase mb-2 ${
        showDropdown ? 'font-medium text-[13px] text-[#101928]' : 'font-semibold text-[13px] text-[#475367] tracking-wider'
      }`}
        style={showDropdown ? theme.styles.primaryText : theme.styles.mutedText}
      >
        {title}
      </Text>
      
      {showDropdown && onToggle ? (
        <TouchableOpacity activeOpacity={0.85} onPress={onToggle}>
          {LocationContent}
        </TouchableOpacity>
      ) : LocationContent}

      {showDropdown && isExpanded && details.length > 0 && (
        <View className="border border-[#E4E7EC] rounded-xl bg-white p-4 mb-3" style={theme.styles.card}>
          <Text className="font-inter text-[#667185] text-[13px] mb-2" style={theme.styles.mutedText}>
            Assigned address
          </Text>
          <Text className="font-inter font-medium text-[#101928] text-[14px] mb-4" style={theme.styles.primaryText}>
            {address}
          </Text>

          <Text className="font-inter text-[#667185] text-[13px] mb-2" style={theme.styles.mutedText}>
            Trip context
          </Text>
          {details.map((detail) => (
            <View key={detail} className="flex-row items-start mb-2">
              <View className="w-1.5 h-1.5 rounded-full bg-[#0673FF] mt-2 mr-2" />
              <Text className="font-inter text-[#475367] text-[14px] flex-1" style={theme.styles.mutedText}>
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
