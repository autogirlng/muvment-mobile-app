import React from "react";
import {
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppStatusBar } from "../common/AppStatusBar";
import { CustomBack } from "../common/CustomBack";

interface LegalDocumentScreenProps {
  body: string;
  title: string;
}

const isSectionHeading = (line: string) =>
  /^\d+(\.\d+)?\.\s/.test(line);

const isDocumentTitle = (line: string) =>
  line === "Muvment Privacy Policy" || line === "Muvment Terms of Use";

export const LegalDocumentScreen = ({
  body,
  title,
}: LegalDocumentScreenProps) => {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />

      <View className="px-6 pt-2 pb-4 bg-[#F8FAFC]">
        <CustomBack color="#0673FF" className="mb-4" />
        <Text className="text-3xl font-inter font-bold text-[#101928]">
          {title}
        </Text>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={{
          paddingBottom: 48,
          paddingHorizontal: 24,
        }}
      >
        <View className="bg-white border border-[#E4E7EC] rounded-2xl px-5 py-5">
          {lines.map((line, index) => {
            const key = `${index}-${line.slice(0, 12)}`;

            if (isDocumentTitle(line)) {
              return (
                <Text
                  key={key}
                  className="font-inter font-bold text-[#101928] text-xl mb-2"
                >
                  {line}
                </Text>
              );
            }

            if (line.startsWith("Operated by") || line.includes("date:")) {
              return (
                <Text
                  key={key}
                  className="font-inter text-[#667185] text-sm leading-5 mb-1"
                >
                  {line}
                </Text>
              );
            }

            if (line.startsWith("Important:")) {
              return (
                <Text
                  key={key}
                  className="font-inter text-[#B42318] text-sm leading-6 mt-3 mb-4"
                >
                  {line}
                </Text>
              );
            }

            if (isSectionHeading(line)) {
              return (
                <Text
                  key={key}
                  className="font-inter font-semibold text-[#101928] text-base leading-6 mt-4 mb-2"
                >
                  {line}
                </Text>
              );
            }

            return (
              <Text
                key={key}
                className="font-inter text-[#475367] text-sm leading-6 mb-2"
              >
                {line}
              </Text>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
