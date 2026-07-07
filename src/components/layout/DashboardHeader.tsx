import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useCurrentUser } from '../../api/hooks/useUsers';
import { getUserInitials } from '../../utils/userProfile';

interface DashboardHeaderProps {
  title: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  const currentUserQuery = useCurrentUser();
  const currentUser = currentUserQuery.data?.data;
  const userInitials = getUserInitials(currentUser);

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
          className="w-10 h-10 rounded-full bg-[#E0EAFF] items-center justify-center"
        >
          <Text className="font-inter font-bold text-[#1E3A5F] text-sm">
            {userInitials}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
