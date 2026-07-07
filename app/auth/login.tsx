import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { CustomInput } from '../../src/components/common/CustomInput';
import { CustomButton } from '../../src/components/common/CustomButton';
import { useLogin } from '../../src/api/hooks/useAuth';
import { getApiErrorMessage } from '../../src/api/errors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  // Evaluates to true immediately with the initial values
  const isFormValid = email.trim().length > 0 && password.length > 0;
  const backendError = getApiErrorMessage(login.error);

  const handleLogin = async () => {
    try {
      await login.mutateAsync({
        email: email.trim(),
        password,
      });

      Toast.show({
        type: 'successToast',
        text1: 'Login Successful',
        position: 'top',
        topOffset: 60,
      });

      setTimeout(() => {
        router.replace("/home");
      }, 1500);
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Login failed',
        text2: getApiErrorMessage(error) || 'Please check your email and password',
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
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View className="items-center mb-10">
            <Link href="/" asChild>
              <TouchableOpacity>
                <Image
                  source={require('../../assets/brand/Logo-Black.png')}
                  className="h-10 w-48 mb-3"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </Link>
            <Text className="text-brand-secondary font-inter text-base font-medium">
              Professional Driver Portal
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

            <CustomInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword 
              hasError={Boolean(backendError)}
              errorMessage={backendError}
            />

            <TouchableOpacity className="self-end mb-8 mt-1"
              onPress={() => router.push("/auth/reset-password")}
            >
              <Text className="text-brand-link font-inter font-medium text-sm">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <CustomButton
              title={login.isPending ? "Signing in..." : "Sign in"}
              disabled={!isFormValid || login.isPending}
              onPress={handleLogin}
            />

            <View className="h-4" />

            <CustomButton
              title="Become a Driver"
              variant="outline"
              onPress={() => router.push("/auth/become-driver")}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
