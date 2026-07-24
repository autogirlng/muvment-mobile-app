import { useMemo } from "react";
import {
  useColorScheme,
  type ColorSchemeName,
  type TextStyle,
  type ViewStyle,
} from "react-native";

const darkColors = {
  background: "#0B1220",
  border: "#263244",
  card: "#151F2E",
  cardSoft: "#1D2739",
  icon: "#CBD5E1",
  primary: "#7DA7F7",
  surface: "#111827",
  surfaceAlt: "#182230",
  text: "#F8FAFC",
  textMuted: "#CBD5E1",
  textSubtle: "#98A2B3",
} as const;

export const useAppTheme = () => {
  const colorScheme: ColorSchemeName = useColorScheme();
  const isDark = colorScheme === "dark";

  return useMemo(
    () => ({
      colors: darkColors,
      isDark,
      styles: {
        background: isDark
          ? ({ backgroundColor: darkColors.background } satisfies ViewStyle)
          : undefined,
        border: isDark
          ? ({ borderColor: darkColors.border } satisfies ViewStyle)
          : undefined,
        card: isDark
          ? ({
              backgroundColor: darkColors.card,
              borderColor: darkColors.border,
            } satisfies ViewStyle)
          : undefined,
        divider: isDark
          ? ({ backgroundColor: darkColors.border } satisfies ViewStyle)
          : undefined,
        icon: isDark ? darkColors.icon : undefined,
        mutedText: isDark
          ? ({ color: darkColors.textMuted } satisfies TextStyle)
          : undefined,
        primaryText: isDark
          ? ({ color: darkColors.text } satisfies TextStyle)
          : undefined,
        subtleText: isDark
          ? ({ color: darkColors.textSubtle } satisfies TextStyle)
          : undefined,
        surface: isDark
          ? ({
              backgroundColor: darkColors.surface,
              borderColor: darkColors.border,
            } satisfies ViewStyle)
          : undefined,
      },
    }),
    [isDark],
  );
};
