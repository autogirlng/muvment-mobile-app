import React, { useState, useEffect } from 'react';
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
import { CustomOTPInput } from '../../src/components/common/CustomOTPInput';
import { CustomButton } from '../../src/components/common/CustomButton';
import {
  useResendVerificationOtp,
  useVerifyAccount,
} from '../../src/api/hooks/useAuth';
import { usePasswordReset } from '../../src/context/PasswordResetContext';
import { getApiErrorMessage } from '../../src/api/errors';

export default function VerifyCodeScreen() {
  // Initialized with the exact code from your design to show the active state
  const [otpCode, setOtpCode] = useState('');
  const verifyAccount = useVerifyAccount();
  const resendVerificationOtp = useResendVerificationOtp();
  const passwordReset = usePasswordReset();
  
  // Set to 0 to show the active "Resend" link state instead of the countdown
  const [timer, setTimer] = useState(0); 
  
  const isFormValid = otpCode.length === 6;
  const maskedEmail = passwordReset.email
    ? passwordReset.email.replace(/^(.).+(@.+)$/, '$1***$2')
    : 'your email';

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (!passwordReset.email) {
      Toast.show({
        type: 'errorToast',
        text1: 'Email is required',
        text2: 'Please request a new verification code',
        position: 'top',
        topOffset: 60,
      });
      router.replace("/auth/reset-password");
      return;
    }

    try {
      await verifyAccount.mutateAsync({
        email: passwordReset.email,
        otp: otpCode,
      });

      passwordReset.setOtp(otpCode);

      Toast.show({
        type: 'successToast',
        text1: 'Code verified',
        position: 'top',
        topOffset: 60,
      });

      router.replace("/auth/create-password");
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Verification failed',
        text2: getApiErrorMessage(error) || 'Please check the code and try again',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const handleResendCode = async () => {
    if (!passwordReset.email) {
      Toast.show({
        type: 'errorToast',
        text1: 'Email is required',
        text2: 'Please request a new verification code',
        position: 'top',
        topOffset: 60,
      });
      router.replace("/auth/reset-password");
      return;
    }

    try {
      await resendVerificationOtp.mutateAsync({ email: passwordReset.email });
      setTimer(60);

      Toast.show({
        type: 'successToast',
        text1: 'Verification code resent',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Failed to resend code',
        text2: getApiErrorMessage(error) || 'Please try again',
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
            className="flex-row items-center mb-8 ml-[-8px] py-2"
          >
            <Feather name="chevron-left" size={24} color="#0088FF" />
            <Text className="text-brand-link font-inter font-medium text-base ml-1">
              Back
            </Text>
          </TouchableOpacity>

          {/* Title & Subtitle */}
          <View className="mb-8">
            <Text className="text-brand-primary font-inter font-bold text-3xl mb-3 tracking-tight">
              Check your email
            </Text>
            <Text className="text-brand-secondary font-inter text-base leading-6">
              We've sent a 6-digit code to{"\n"}
              <Text className="underline text-[#475367]">{maskedEmail}</Text>
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full">
            <Text className="text-brand-primary font-inter font-medium text-sm">
              Enter OTP
            </Text>

            <CustomOTPInput 
              length={6} 
              value={otpCode} 
              onChange={setOtpCode} 
            />

            {/* Verify Button */}
            <View className="mt-2">
              <CustomButton
                title={verifyAccount.isPending ? "Verifying..." : "Verify"}
                disabled={!isFormValid || verifyAccount.isPending}
                onPress={handleVerify}
              />
            </View>

            {/* Updated Timer / Resend Action located below the button */}
            <View className="mt-6">
              {timer > 0 ? (
                <Text className="text-brand-secondary font-inter text-base">
                  Resend Code in {timer}s
                </Text>
              ) : (
                <TouchableOpacity
                  disabled={resendVerificationOtp.isPending}
                  onPress={handleResendCode}
                >
                  <Text className="text-brand-link font-inter text-base">
                    {resendVerificationOtp.isPending ? "Resending..." : "Didn't get code? Resend"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
