import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { AppStatusBar } from "../common/AppStatusBar";
import { CustomBack } from "../common/CustomBack";

interface LegalDocumentScreenProps {
  body: string;
  title: string;
}

interface LegalSection {
  body: string[];
  id: string;
  title: string;
}

interface ParsedLegalDocument {
  metadata: string[];
  sections: LegalSection[];
  warning?: string;
}

const isTopLevelSectionHeading = (line: string) =>
  /^\d+\.\s/.test(line);

const isNestedSectionHeading = (line: string) =>
  /^\d+\.\d+\s/.test(line);

const isDocumentTitle = (line: string) =>
  line === "Muvment Privacy Policy" || line === "Muvment Terms of Use";

const parseLegalDocument = (body: string): ParsedLegalDocument => {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const sections: LegalSection[] = [];
  const metadata: string[] = [];
  let warning: string | undefined;
  let currentSection: LegalSection | undefined;

  lines.forEach((line) => {
    if (isDocumentTitle(line)) {
      return;
    }

    if (line.startsWith("Important:")) {
      warning = line;
      return;
    }

    if (line.startsWith("Operated by") || line.includes("date:")) {
      metadata.push(line);
      return;
    }

    if (isTopLevelSectionHeading(line)) {
      currentSection = {
        body: [],
        id: line.match(/^\d+/)?.[0] ?? String(sections.length + 1),
        title: line,
      };
      sections.push(currentSection);
      return;
    }

    if (currentSection) {
      currentSection.body.push(line);
    }
  });

  return {
    metadata,
    sections,
    warning,
  };
};

const getMetadataValue = (metadata: string[], label: string) =>
  metadata.find((item) => item.startsWith(label))?.replace(label, "").trim();

const renderSectionLine = (line: string, key: string) => {
  if (line.startsWith("- ")) {
    return (
      <View key={key} className="flex-row items-start mb-2">
        <View className="w-1.5 h-1.5 rounded-full bg-[#98A2B3] mt-2 mr-3" />
        <Text className="flex-1 font-inter text-[#475367] text-sm leading-6">
          {line.slice(2)}
        </Text>
      </View>
    );
  }

  if (isNestedSectionHeading(line)) {
    return (
      <Text
        key={key}
        className="font-inter font-semibold text-[#344054] text-sm leading-6 mt-3 mb-1"
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
};

export const LegalDocumentScreen = ({
  body,
  title,
}: LegalDocumentScreenProps) => {
  const document = useMemo(() => parseLegalDocument(body), [body]);
  const [expandedSectionId, setExpandedSectionId] = useState(
    document.sections[0]?.id,
  );

  useEffect(() => {
    setExpandedSectionId(document.sections[0]?.id);
  }, [document.sections]);

  const lastUpdated = getMetadataValue(document.metadata, "Last updated:");
  const effectiveDate = getMetadataValue(document.metadata, "Effective date:");
  const operatedBy = document.metadata.find((item) =>
    item.startsWith("Operated by"),
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />

      <View className="px-6 pt-2 pb-5 bg-[#F8FAFC]">
        <CustomBack color="#0673FF" className="mb-4" />
        <Text className="text-3xl font-inter font-bold text-[#101928]">
          {title}
        </Text>
        {operatedBy && (
          <Text className="font-inter text-[#667185] text-sm mt-2">
            {operatedBy}
          </Text>
        )}

        <View className="flex-row flex-wrap mt-4 gap-2">
          {lastUpdated && (
            <View className="border border-[#E4E7EC] bg-white rounded-lg px-3 py-2">
              <Text className="font-inter text-[#667185] text-xs">
                Last updated
              </Text>
              <Text className="font-inter font-semibold text-[#101928] text-sm mt-0.5">
                {lastUpdated}
              </Text>
            </View>
          )}

          {effectiveDate && (
            <View className="border border-[#E4E7EC] bg-white rounded-lg px-3 py-2">
              <Text className="font-inter text-[#667185] text-xs">
                Effective date
              </Text>
              <Text className="font-inter font-semibold text-[#101928] text-sm mt-0.5">
                {effectiveDate}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={{
          paddingBottom: 48,
          paddingHorizontal: 20,
        }}
      >
        {document.warning && (
          <View className="bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-4 py-4 mb-4">
            <View className="flex-row items-start">
              <Feather name="alert-circle" size={18} color="#B42318" />
              <Text className="flex-1 font-inter font-semibold text-[#B42318] text-sm ml-2">
                Draft notice
              </Text>
            </View>
            <Text className="font-inter text-[#B42318] text-sm leading-6 mt-2">
              {document.warning.replace("Important: ", "")}
            </Text>
          </View>
        )}

        {document.sections.map((section) => {
          const isExpanded = expandedSectionId === section.id;

          return (
            <View
              key={section.id}
              className="bg-white border border-[#E4E7EC] rounded-lg mb-3 overflow-hidden"
            >
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex-row items-center px-4 py-4"
                onPress={() => setExpandedSectionId(
                  isExpanded ? undefined : section.id,
                )}
              >
                <View className="w-8 h-8 rounded-lg bg-[#EFF8FF] items-center justify-center mr-3">
                  <Text className="font-inter font-bold text-[#0673FF] text-sm">
                    {section.id}
                  </Text>
                </View>

                <Text className="flex-1 font-inter font-semibold text-[#101928] text-base pr-3">
                  {section.title.replace(/^\d+\.\s/, "")}
                </Text>

                <Feather
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#98A2B3"
                />
              </TouchableOpacity>

              {isExpanded && (
                <View className="border-t border-[#E4E7EC] px-4 pt-4 pb-3">
                  {section.body.map((line, index) =>
                    renderSectionLine(
                      line,
                      `${section.id}-${index}-${line.slice(0, 8)}`,
                    ),
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};
