import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

interface PhotoUploadCardProps {
  title: string;
  subtitle?: string;
  imageUri?: string | null;
  onPress: () => void;
  onRemove?: () => void;
}

export const PhotoUploadCard: React.FC<PhotoUploadCardProps> = ({
  title,
  subtitle,
  imageUri,
  onPress,
  onRemove
}) => {
  const isFilled = Boolean(imageUri);

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress}
      className={`h-40 rounded-xl overflow-hidden mb-4 border-2 border-dashed ${
        isFilled ? 'border-[#0673FF]' : 'border-[#D0D5DD] bg-white'
      }`}
    >
      {isFilled ? (
        <ImageBackground 
          source={{ uri: imageUri! }} 
          className="w-full h-full"
          resizeMode="cover"
        >
          {/* Light translucent overlay so the text remains readable over the image */}
          <View className="flex-1 bg-white/60 items-center justify-center p-4 relative">
            
            {/* Remove (X) Button */}
            {onRemove && (
              <TouchableOpacity 
                onPress={onRemove}
                className="absolute top-2 right-2 p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle-outline" size={26} color="#E32636" />
              </TouchableOpacity>
            )}

            {/* Camera Icon Badge */}
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center mb-2 shadow-sm">
              <Feather name="camera" size={18} color="#475367" />
            </View>
            
            <Text className="font-inter font-semibold text-[#101928] text-[15px] mb-1">
              {title}
            </Text>
            {subtitle && (
              <Text className="font-inter text-[#475367] text-[12px] text-center">
                {subtitle}
              </Text>
            )}
          </View>
        </ImageBackground>
      ) : (
        /* Empty State */
        <View className="flex-1 items-center justify-center p-4">
          <View className="w-10 h-10 bg-[#F2F4F7] rounded-full items-center justify-center mb-2 border border-[#E4E7EC]">
            <Feather name="camera" size={18} color="#475367" />
          </View>
          <Text className="font-inter font-medium text-[#101928] text-[15px] mb-1">
            {title}
          </Text>
          {subtitle && (
            <Text className="font-inter text-[#667185] text-[12px] text-center">
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
