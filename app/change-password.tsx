import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../src/components/common/AppStatusBar';
import { CustomBack } from '../src/components/common/CustomBack';
import { CustomButton } from '../src/components/common/CustomButton';
import { CustomInput } from '../src/components/common/CustomInput';
import {
  isPasswordValid,
  PasswordRequirementChecklist,
} from '../src/components/common/PasswordRequirementChecklist';
import { getApiErrorMessage } from '../src/api/errors';
import { useChangePassword } from '../src/api/hooks/useUsers';

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const changePassword = useChangePassword();
  const passwordsMatch = newPassword === confirmPassword;
  const passwordsDiffer = oldPassword.length > 0 &&
    newPassword.length > 0 &&
    oldPassword !== newPassword;
  const showMatchError = confirmPassword.length > 0 && !passwordsMatch;
  const showSamePasswordError = oldPassword.length > 0 &&
    newPassword.length > 0 &&
    !passwordsDiffer;
  const backendError = getApiErrorMessage(changePassword.error);
  const isFormValid = oldPassword.length > 0 &&
    isPasswordValid(newPassword) &&
    passwordsMatch &&
    passwordsDiffer;
  const shouldShowPasswordRequirements =
    showPasswordRequirements || newPassword.length > 0;

  const handleChangePassword = async () => {
    if (!isFormValid || changePassword.isPending) {
      return;
    }

    try {
      const response = await changePassword.mutateAsync({
        newPassword,
        oldPassword,
      });

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.replace('/settings');

      setTimeout(() => {
        Toast.show({
          type: 'successToast',
          text1: response.message || 'Password changed successfully',
          position: 'top',
          topOffset: 60,
        });
      }, 100);
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Failed to change password',
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
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40,
            paddingHorizontal: 24,
            paddingTop: 10,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <CustomBack
            label="Settings"
            color="#0088FF"
            className="mb-8"
          />

          <View className="mb-8">
            <Text className="text-brand-primary font-inter font-bold text-3xl mb-3 tracking-tight">
              Change password
            </Text>
            <Text className="text-brand-secondary font-inter text-base leading-6 pr-4">
              Use a strong password that is different from your current password.
            </Text>
          </View>

          <View className="w-full">
            <CustomInput
              label="Current Password"
              placeholder="Enter current password"
              value={oldPassword}
              onChangeText={setOldPassword}
              isPassword
              hasError={Boolean(backendError)}
              errorMessage={backendError}
              autoCapitalize="none"
              textContentType="password"
            />

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
              hasError={showSamePasswordError}
              errorMessage={
                showSamePasswordError
                  ? 'New password must be different from current password'
                  : undefined
              }
              autoCapitalize="none"
              textContentType="newPassword"
            />

            <CustomInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              hasError={showMatchError}
              errorMessage={showMatchError ? 'Passwords do not match' : undefined}
              autoCapitalize="none"
              textContentType="newPassword"
            />

            {shouldShowPasswordRequirements && (
              <PasswordRequirementChecklist password={newPassword} />
            )}

            <CustomButton
              title={changePassword.isPending ? 'Changing password...' : 'Change Password'}
              disabled={!isFormValid || changePassword.isPending}
              onPress={handleChangePassword}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
