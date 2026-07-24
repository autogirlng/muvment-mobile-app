import "../global.css";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStatusBar } from '../src/components/common/AppStatusBar';
import { toastConfig } from '../src/components/common/ToastConfig';
import {
  AuthSessionProvider,
  useAuthSession,
} from '../src/context/AuthSessionContext';
import { PasswordResetProvider } from '../src/context/PasswordResetContext';
import { configureTextScaling } from '../src/utils/textScaling';

const queryClient = new QueryClient();

configureTextScaling();

function RootStack() {
  const authSession = useAuthSession();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms-of-use" />

      <Stack.Protected guard={!authSession.isAuthenticated}>
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/reset-password" />
        <Stack.Screen name="auth/verify-code" />
        <Stack.Screen name="auth/create-password" />
        <Stack.Screen name="auth/become-driver" />
        <Stack.Screen name="auth/bd-success" />
      </Stack.Protected>

      <Stack.Protected guard={authSession.isAuthenticated}>
        <Stack.Screen name="(dashboard)" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="Notification" />
        <Stack.Screen name="trip/[id]" />
        <Stack.Screen name="checklist/step1" />
        <Stack.Screen name="checklist/step2" />
        <Stack.Screen name="checklist/step3" />
        <Stack.Screen name="checklist/step4" />
        <Stack.Screen name="checklist/step5" />
        <Stack.Screen name="checklist/step6" />
        <Stack.Screen name="post-ride-checklist/step1" />
        <Stack.Screen name="post-ride-checklist/step2" />
        <Stack.Screen name="post-ride-checklist/step3" />
        <Stack.Screen name="post-ride-checklist/step4" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          <PasswordResetProvider>
            <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
            <RootStack />
            {/* Toast must be the last component rendered so it sits on top of all screens */}
            <Toast config={toastConfig} />
          </PasswordResetProvider>
        </AuthSessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
