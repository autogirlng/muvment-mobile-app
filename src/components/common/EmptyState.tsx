// src/components/common/EmptyState.tsx
import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';

import { useAppTheme } from '../../theme/useAppTheme';

interface EmptyStateProps {
  title: string;
  description: string;
  // Make the image prop optional using "?"
  image?: ImageSourcePropType;
  containerClassName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  // Set the default fallback right here in the props
  image = require('../../../assets/brand/empty.png'),
  containerClassName = 'mt-16',
}) => {
  const theme = useAppTheme();

  return (
    <View className={`flex-1 items-center justify-center px-8 ${containerClassName}`}>
      <Image 
        source={image} // Now it dynamically uses whatever was passed, or the default
        className="w-48 h-48 mb-6"
        resizeMode="contain"
      />
      <Text
        className="text-2xl font-inter font-medium text-[#475367] mb-3 text-center"
        style={theme.styles.mutedText}
      >
        {title}
      </Text>
      <Text
        className="text-[#98A2B3] font-inter text-center leading-6"
        style={theme.styles.subtleText}
      >
        {description}
      </Text>
    </View>
  );
};
