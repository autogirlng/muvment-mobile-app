import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { DashboardHeader } from '../../src/components/layout/DashboardHeader';
import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ConfirmationModal } from '../../src/components/common/ConfirmModal';
import { SettingsToggle } from '../../src/components/common/SettingsToggle';

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  
  // State to control the visibility of the confirmation modal
  const [isSignOutModalVisible, setSignOutModalVisible] = useState(false);

  const confirmSignOut = () => {
    // 1. Close the modal first
    setSignOutModalVisible(false);

    // 2. API logic to clear tokens goes here
    // e.g., await apiClient.post('/auth/logout');
    
    // 3. Show success message
    Toast.show({
      type: 'successToast',
      text1: 'Signed out successfully',
      position: 'top',
      topOffset: 60,
    });

    // 4. Route back to login
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <AppStatusBar style="dark" backgroundColor="#FAFAFA" />
      <DashboardHeader title="Settings" />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} bounces={false}>
        <View className="mt-2">
          <SettingsToggle
            iconName="bell"
            title="Push Notifications"
            description="Receive trip alerts"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          
          <SettingsToggle
            iconName="map-pin"
            title="Location Services"
            description="Required for navigation"
            value={locationServices}
            onValueChange={setLocationServices}
          />
        </View>

        {/* Pushes the Sign Out button to the bottom of the screen */}
        <View className="flex-1 justify-end px-6 mt-10">
          <TouchableOpacity 
            onPress={() => setSignOutModalVisible(true)} // Opens the modal instead of instantly signing out
            className="flex-row items-center justify-between bg-white border border-[#E4E7EC] rounded-2xl px-4 h-14 shadow-sm"
          >
            <View className="flex-row items-center">
              <Feather name="log-out" size={20} color="#D92D20" />
              <Text className="ml-3 font-inter font-medium text-base text-[#D92D20]">
                Sign Out
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#D92D20" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={isSignOutModalVisible}
        onClose={() => setSignOutModalVisible(false)}
        onConfirm={confirmSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        confirmVariant="danger"
      />

    </SafeAreaView>
  );
}
