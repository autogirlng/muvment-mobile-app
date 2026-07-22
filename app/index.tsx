// app/index.tsx
import { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { AppStatusBar } from "../src/components/common/AppStatusBar";
import { Logo } from "../src/components/common/Logo";
import { useAuthSession } from "../src/context/AuthSessionContext";

export default function SplashScreen() {
  const authSession = useAuthSession();

  useEffect(() => {
    if (authSession.isLoading) {
      return undefined;
    }

    const timer = setTimeout(() => {
      router.replace(
        authSession.isAuthenticated ? "/home" : "/auth/login",
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [authSession.isAuthenticated, authSession.isLoading]);

  return (
    <View className="flex-1 items-center justify-center bg-brand-splash">
      <AppStatusBar style="light" backgroundColor="#1D2739" />

      <Logo size={120} />
    </View>
  );
}
