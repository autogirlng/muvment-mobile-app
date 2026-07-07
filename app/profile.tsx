// app/profile.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar } from '../src/components/common/AppStatusBar';
import { CustomBack } from '../src/components/common/CustomBack';
import { EmptyState } from '../src/components/common/EmptyState';
import { getApiErrorMessage } from '../src/api/errors';
import { useCurrentUser } from '../src/api/hooks/useUsers';
import {
  getUserDisplayName,
  getUserInitials,
} from '../src/utils/userProfile';

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

const getBooleanLabel = (value: boolean) => (value ? 'Yes' : 'No');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const currentUserQuery = useCurrentUser();
  const currentUser = currentUserQuery.data?.data;
  const profileErrorMessage = getApiErrorMessage(currentUserQuery.error);

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
        {currentUserQuery.isLoading ? (
          <EmptyState
            title="Loading profile"
            description="Fetching your account information."
          />
        ) : currentUserQuery.isError || !currentUser ? (
          <EmptyState
            title="Unable to load profile"
            description={profileErrorMessage ?? "Please check your connection and try again."}
          />
        ) : (
          <>
            <View className="items-center mt-8 mb-8">
              <View className="w-28 h-28 rounded-full border border-[#E4E7EC] shadow-sm bg-[#E0EAFF] items-center justify-center">
                <Text className="font-inter font-bold text-[#1E3A5F] text-3xl">
                  {getUserInitials(currentUser)}
                </Text>
              </View>

              <Text className="text-[#101928] font-inter font-semibold text-xl mt-4">
                {getUserDisplayName(currentUser)}
              </Text>
              <Text className="text-[#667185] font-inter text-sm mt-1">
                {currentUser.userType}
              </Text>
            </View>

            <View className="px-6">
              <Text className="text-[#101928] font-inter font-semibold text-lg mb-4">
                Personal Information
              </Text>

              <ProfileInfoRow
                label="Full Name"
                value={getUserDisplayName(currentUser)}
              />
              <ProfileInfoRow label="Email Address" value={currentUser.email} />
              <ProfileInfoRow label="Phone Number" value={currentUser.phoneNumber} />
              <ProfileInfoRow label="User Type" value={currentUser.userType} />
              <ProfileInfoRow label="User ID" value={currentUser.userId} />

              <Text className="text-[#101928] font-inter font-semibold text-lg mt-4 mb-4">
                Verification
              </Text>

              <ProfileInfoRow
                label="Email Verified"
                value={getBooleanLabel(currentUser.emailVerified)}
              />
              <ProfileInfoRow
                label="Phone Verified"
                value={getBooleanLabel(currentUser.phoneVerified)}
              />
              <ProfileInfoRow
                label="API Access"
                value={getBooleanLabel(currentUser.canSeeApi)}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
