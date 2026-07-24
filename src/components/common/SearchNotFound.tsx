import React from 'react';
import { View, Text, Image } from 'react-native';

import { useAppTheme } from '../../theme/useAppTheme';

interface SearchNotFoundProps {
  searchQuery: string;
}

export const SearchNotFound: React.FC<SearchNotFoundProps> = ({ searchQuery }) => {
  const theme = useAppTheme();

  return (
    <View className="flex-1 items-center justify-center px-8 mt-12 mb-10">
      <Image 
        // Save the magnifying glass graphic to your assets folder
        source={require('../../../assets/brand/search-empty.png')} 
        className="w-44 h-44 mb-6"
        resizeMode="contain"
      />
      <Text
        className="text-2xl font-inter font-semibold text-[#101928] mb-3 text-center"
        style={theme.styles.primaryText}
      >
        No trips Found
      </Text>
      <Text
        className="text-[#475367] font-inter text-center leading-6"
        style={theme.styles.mutedText}
      >
        No trips match "{searchQuery}". Try searching with a different Trip ID or Client Name
      </Text>
    </View>
  );
};
