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

export default function CreatePasswordScreen() {
  // Initialized to show the mismatch error from your design
  const [newPassword, setNewPassword] = useState('Autogirl!2026');
  const [confirmPassword, setConfirmPassword] = useState('Autogirl!202'); // Missing the last digit to trigger error

  // Real-time validation rules
  const validations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    digit: /\d/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    noSpaces: newPassword.length > 0 && !/\s/.test(newPassword),
  };

  const passwordsMatch = newPassword === confirmPassword;
  
  // Only trigger the visual error if they have typed something in the confirm box AND it doesn't match
  const showMatchError = confirmPassword.length > 0 && !passwordsMatch;

  const isFormValid = 
    Object.values(validations).every(Boolean) && 
    passwordsMatch;

  const handleSetPassword = async () => {
    // Local validation check is technically handled by the disabled button now, 
    // but keeping it here as a safety net is good practice.
    if (!passwordsMatch) return; 

    try {
      // await apiClient.post('/auth/reset-password', { newPassword });

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
        text2: 'Please try again',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const ValidationItem = ({ label, isValid }: { label: string, isValid: boolean }) => (
    <View className="flex-row items-center mt-2">
      <Feather 
        name={isValid ? "check-circle" : "circle"} 
        size={16} 
        color={isValid ? "#039855" : "#98A2B3"} 
      />
      <Text 
        className={`ml-2 font-inter text-sm ${isValid ? "text-[#039855]" : "text-brand-secondary"}`}
      >
        {label}
      </Text>
    </View>
  );

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
              onChangeText={setNewPassword}
              isPassword 
              hasError={showMatchError} // Turns border red based on design
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

            {/* Validation Checklist */}
            <View className="mt-2 mb-8">
              <Text className="text-brand-primary font-inter font-medium text-sm mb-1">
                Password must include at least:
              </Text>
              <ValidationItem label="8 characters long" isValid={validations.length} />
              <ValidationItem label="One uppercase character" isValid={validations.uppercase} />
              <ValidationItem label="One lowercase character" isValid={validations.lowercase} />
              <ValidationItem label="One digit" isValid={validations.digit} />
              <ValidationItem label="One special character" isValid={validations.special} />
              <ValidationItem label="Must not include spaces" isValid={validations.noSpaces} />
            </View>

            <CustomButton
              title="Set Password"
              disabled={!isFormValid}
              onPress={handleSetPassword}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
