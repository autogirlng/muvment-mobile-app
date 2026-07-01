import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

interface DashboardHeaderProps {
  title: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  return (
    <View className="flex-row justify-between items-center px-6 pt-2 pb-4">
      <Text className="text-3xl font-inter font-bold text-[#000000]">
        {title}
      </Text>

      <View className="flex-row items-center gap-x-3">
        <TouchableOpacity 
          onPress={() => router.push('/Notification')}
          className="w-10 h-10 rounded-full items-center justify-center relative border border-[#D0D5DD]">
          <Feather name="bell" size={20} color="#1E3A5F" />
          <View className="absolute top-0 right-0 w-3 h-3 bg-[#0673FF] rounded-full" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/profile')}
          className="w-10 h-10 rounded-full overflow-hidden"
        >
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?img=47' }} 
            className="w-full h-full"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
