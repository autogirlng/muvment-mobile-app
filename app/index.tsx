// app/index.tsx
import { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { AppStatusBar } from "../src/components/common/AppStatusBar";
import { Logo } from "../src/components/common/Logo";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-brand-splash">
      <AppStatusBar style="light" backgroundColor="#1D2739" />

      <Logo size={120} />
    </View>
  );
}
