import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { CustomInput } from '../../src/components/common/CustomInput';
import { CustomButton } from '../../src/components/common/CustomButton';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');

  // Button becomes active when email is typed
  const isFormValid = email.trim().length > 0;

  const handleSendCode = async () => {
    try {
      // Integrate your existing apiClient here
      // e.g., await apiClient.post('/auth/forgot-password', { email });

      Toast.show({
        type: 'successToast',
        text1: 'Verification code sent',
        position: 'top',
        topOffset: 60,
      });

      router.push("/auth/verify-code");

    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Failed to send code',
        text2: 'Please check the email and try again',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-auth">
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 10 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Navigation */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="flex-row items-center mb-8 ml-[-8px] py-2" // Negative margin to align icon perfectly
          >
            <Feather name="chevron-left" size={24} color="#0088FF" />
            <Text className="text-brand-link font-inter font-medium text-base ml-1">
              Back
            </Text>
          </TouchableOpacity>

          {/* Title & Subtitle */}
          <View className="mb-8">
            <Text className="text-brand-primary font-inter font-bold text-3xl mb-3 tracking-tight">
              Reset your password
            </Text>
            <Text className="text-brand-secondary font-inter text-base leading-6">
              Enter your email address and we'll send you a verification code
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full">
            <CustomInput
              label="Email Address"
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <View className="mt-2">
              <CustomButton
                title="Send Verification Code"
                disabled={!isFormValid}
                onPress={handleSendCode}
              />
            </View>

            {/* Footer Link */}
            <TouchableOpacity 
              className="items-center mt-10 py-2"
              onPress={() => router.back()}
            >
              <Text className="text-brand-link font-inter font-medium text-base">
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
