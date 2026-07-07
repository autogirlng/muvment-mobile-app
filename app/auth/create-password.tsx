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
import {
  isPasswordValid,
  PasswordRequirementChecklist,
} from '../../src/components/common/PasswordRequirementChecklist';
import { useResetPassword } from '../../src/api/hooks/useAuth';
import { usePasswordReset } from '../../src/context/PasswordResetContext';
import { getApiErrorMessage } from '../../src/api/errors';

export default function CreatePasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const resetPassword = useResetPassword();
  const passwordReset = usePasswordReset();

  const passwordsMatch = newPassword === confirmPassword;
  
  // Only trigger the visual error if they have typed something in the confirm box AND it doesn't match
  const showMatchError = confirmPassword.length > 0 && !passwordsMatch;

  const isFormValid = 
    isPasswordValid(newPassword) &&
    passwordsMatch;
  const backendError = getApiErrorMessage(resetPassword.error);

  const shouldShowPasswordRequirements =
    showPasswordRequirements || newPassword.length > 0;

  const handleSetPassword = async () => {
    // Local validation check is technically handled by the disabled button now, 
    // but keeping it here as a safety net is good practice.
    if (!passwordsMatch) return; 

    if (!passwordReset.email || !passwordReset.otp) {
      Toast.show({
        type: 'errorToast',
        text1: 'Verification required',
        text2: 'Please request and enter your verification code again',
        position: 'top',
        topOffset: 60,
      });
      router.replace("/auth/reset-password");
      return;
    }

    try {
      await resetPassword.mutateAsync({
        email: passwordReset.email,
        otp: passwordReset.otp,
        newPassword,
      });
      passwordReset.clearResetState();
      router.replace("/auth/login");

      setTimeout(() => {
        Toast.show({
          type: 'successToast',
          text1: 'Password Updated',
          position: 'top',
          topOffset: 60,
        });
      }, 100);

    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Failed to reset password',
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
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="flex-row items-center mb-8 ml-[-8px] py-2"
          >
            <Feather name="chevron-left" size={24} color="#0088FF" />
            <Text className="text-brand-link font-inter font-medium text-base ml-1">
              Cancel
            </Text>
          </TouchableOpacity>

          <View className="mb-8">
            <Text className="text-brand-primary font-inter font-bold text-3xl mb-3 tracking-tight">
              Create new password
            </Text>
            <Text className="text-brand-secondary font-inter text-base leading-6 pr-4">
              Your new password must be different from your previous password
            </Text>
          </View>

          <View className="w-full">
            <CustomInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={(value) => {
                setShowPasswordRequirements(true);
                setNewPassword(value);
              }}
              onFocus={() => setShowPasswordRequirements(true)}
              isPassword 
              hasError={showMatchError || Boolean(backendError)}
            />

            <CustomInput
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword 
              hasError={showMatchError} // Turns border red
              errorMessage={showMatchError ? "Passwords do not match" : undefined} // Shows text
            />

            {shouldShowPasswordRequirements && (
              <PasswordRequirementChecklist password={newPassword} />
            )}

            <CustomButton
              title={resetPassword.isPending ? "Setting password..." : "Set Password"}
              disabled={!isFormValid || resetPassword.isPending}
              onPress={handleSetPassword}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
