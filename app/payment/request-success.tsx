// app/(dashboard)/request-success.tsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { SuccessState } from '../../src/components/common/SuccessState';

export default function RequestSuccessScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <SuccessState 
        title="Request Submitted!"
        description="Your payment request has been submitted and is now pending review."
        buttonText="Back to Home"
        buttonIconName="home"
        onButtonPress={() => router.replace('/home')}
      />
    </SafeAreaView>
  );
}
