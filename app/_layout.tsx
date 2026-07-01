// app/_layout.tsx
import "../global.css";

import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { AppStatusBar } from '../src/components/common/AppStatusBar';
import { toastConfig } from '../src/components/common/ToastConfig';

export default function RootLayout() {
  return (
    <>
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <Stack screenOptions={{ headerShown: false }} />
      {/* Toast must be the last component rendered so it sits on top of all screens */}
      <Toast config={toastConfig} />
    </>
  );
}
