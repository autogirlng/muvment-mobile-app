import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { SuccessState } from '../../src/components/common/SuccessState';

export default function BecomeDriverSuccessScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <AppStatusBar style="dark" backgroundColor="#FFFFFF" />
      <SuccessState 
        title="Success!"
        description="Your application has been received and is currently being reviewed."
        buttonText="Go to Login"
        onButtonPress={() => router.push('/auth/login')}
        animationSource={null} 
      />
    </SafeAreaView>
  );
}
