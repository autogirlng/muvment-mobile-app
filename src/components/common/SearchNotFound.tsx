import React from 'react';
import { View, Text, Image } from 'react-native';

interface SearchNotFoundProps {
  searchQuery: string;
}

export const SearchNotFound: React.FC<SearchNotFoundProps> = ({ searchQuery }) => {
  return (
    <View className="flex-1 items-center justify-center px-8 mt-12 mb-10">
      <Image 
        // Save the magnifying glass graphic to your assets folder
        source={require('../../../assets/brand/search-empty.png')} 
        className="w-44 h-44 mb-6"
        resizeMode="contain"
      />
      <Text className="text-2xl font-inter font-semibold text-[#101928] mb-3 text-center">
        No trips Found
      </Text>
      <Text className="text-[#475367] font-inter text-center leading-6">
        No trips match "{searchQuery}". Try searching with a different Trip ID or Client Name
      </Text>
    </View>
  );
};