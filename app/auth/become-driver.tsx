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
import { useCreateDriverApplication } from '../../src/api/hooks/useDriverApplications';
import { getApiErrorMessage } from '../../src/api/errors';

export default function BecomeDriverScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const createDriverApplication = useCreateDriverApplication();

  // Validate that all required fields are filled
  const yearsOfExperience = Number(experience);
  const isFormValid = 
    fullName.trim().length > 0 && 
    email.trim().length > 0 && 
    experience.trim().length > 0 && 
    Number.isFinite(yearsOfExperience) &&
    yearsOfExperience >= 0 &&
    phone.trim().length > 0;
  const backendError = getApiErrorMessage(createDriverApplication.error);

  const handleSubmit = async () => {
    const applicationPayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      primaryPhoneNumber: phone.trim(),
      yearsOfExperience,
      ...(altPhone.trim()
        ? { alternativePhoneNumber: altPhone.trim() }
        : {}),
    };

    try {
      await createDriverApplication.mutateAsync(applicationPayload);

      Toast.show({
        type: 'successToast',
        text1: 'Application Submitted!',
        text2: 'We will review your credentials and contact you soon.',
        position: 'top',
        topOffset: 60,
      });

      router.push('/auth/bd-success');
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Application failed',
        text2: getApiErrorMessage(error) || 'Please check your details and try again',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <AppStatusBar style="dark" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Header with Back Button */}
          <View className="pt-2 pb-6 mt-2 ml-[-8px]">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="flex-row items-center"
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Feather name="chevron-left" size={24} color="#0673FF" />
              <Text className="text-[#0673FF] font-inter text-[17px] font-medium ml-1">
                Back
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View className="mb-8">
            <Text className="text-[32px] font-inter font-bold text-[#101928] mb-3 leading-10">
              Become a Driver
            </Text>
            <Text className="text-[#667185] font-inter text-[16px] leading-6">
              Apply to become a driver by submitting your credentials
            </Text>
          </View>

          {/* Form Section */}
          <View className="w-full">
            <CustomInput
              label="Full Name"
              placeholder="e.g Jeffry Dolapo Ayo"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <CustomInput
              label="Email Address"
              placeholder="name@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CustomInput
              label="Driving Experience (Years)"
              placeholder="e.g 4"
              value={experience}
              onChangeText={setExperience}
              keyboardType="numeric"
            />

            <CustomInput
              label="Phone Number"
              placeholder="090 1234 5678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <CustomInput
              label="Alt. Phone Number (Optional)"
              placeholder="090 1234 5678"
              value={altPhone}
              onChangeText={setAltPhone}
              keyboardType="phone-pad"
              hasError={Boolean(backendError)}
              errorMessage={backendError}
            />

            <View className="mt-6 mb-4">
              <CustomButton
                title={createDriverApplication.isPending ? "Submitting..." : "Submit Application"}
                disabled={!isFormValid || createDriverApplication.isPending}
                onPress={handleSubmit}
              />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
