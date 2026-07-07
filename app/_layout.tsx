import "../global.css";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { AppStatusBar } from '../src/components/common/AppStatusBar';
import { toastConfig } from '../src/components/common/ToastConfig';
import { PasswordResetProvider } from '../src/context/PasswordResetContext';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PasswordResetProvider>
        <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
        <Stack screenOptions={{ headerShown: false }} />
        {/* Toast must be the last component rendered so it sits on top of all screens */}
        <Toast config={toastConfig} />
      </PasswordResetProvider>
    </QueryClientProvider>
  );
}
