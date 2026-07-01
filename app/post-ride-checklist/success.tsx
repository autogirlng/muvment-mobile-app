import React from 'react';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';

import { SuccessState } from '../../src/components/common/SuccessState';

export default function PostRideChecklistSuccessScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <SuccessState
        title="Ride Complete"
        description="Post-ride report submitted successfully."
        buttonText="Back to Home"
        buttonIconName="home"
        animationSource={null}
        onButtonPress={() => router.replace('/home')}
      />
    </SafeAreaView>
  );
}
