// app/profile.tsx
import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar } from '../src/components/common/AppStatusBar';
import { CustomBack } from '../src/components/common/CustomBack';

const ProfileInfoRow = ({ label, value }: { label: string, value: string }) => (
  <View className="border-b border-[#E4E7EC] pb-2 mb-4">
    <Text className="text-[#98A2B3] font-inter text-sm mb-1">
      {label}
    </Text>
    <Text className="text-[#475367] font-inter text-base font-medium">
      {value}
    </Text>
  </View>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <AppStatusBar style="light" backgroundColor="#1D2739" />

      <View
        className="bg-brand-primaryMid rounded-b-[24px] px-6 pb-6"
        style={{ paddingTop: Math.max(insets.top, 20) + 10 }}
      >
        <CustomBack className="mb-6" />

        <Text className="text-white font-inter font-bold text-3xl">
          My Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} bounces={false}>
        <View className="items-center mt-8 mb-8">
          <View className="w-28 h-28 rounded-full border border-[#E4E7EC] shadow-sm overflow-hidden bg-white">
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>

        <View className="px-6">
          <Text className="text-[#101928] font-inter font-semibold text-lg mb-4">
            Personal Information
          </Text>

          <ProfileInfoRow label="Full Name" value="John Adebayo" />
          <ProfileInfoRow label="Email Address" value="john.adebayo@email.com" />
          <ProfileInfoRow label="Phone Number" value="+234 803 456 7890" />
          <ProfileInfoRow label="Driver ID" value="AG005" />

          <Text className="text-[#101928] font-inter font-semibold text-lg mt-4 mb-4">
            Bank Details
          </Text>

          <ProfileInfoRow label="Bank Name" value="Access Bank" />
          <ProfileInfoRow label="Account Number" value="******4567" />
          <ProfileInfoRow label="Account Holder Name" value="John Adebayo" />
        </View>
      </ScrollView>
    </View>
  );
}
