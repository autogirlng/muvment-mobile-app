import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { ConfirmationModal } from '../../src/components/common/ConfirmModal';
import { CustomBack } from '../../src/components/common/CustomBack';
import { NumberedListItem } from '../../src/components/common/NumberedListItem';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { SummaryCard } from '../../src/components/common/SummaryCard';
import { MOCK_POST_RIDE_CHECKLIST } from '../../src/data/mockData';

export default function PostRideChecklistStep4Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId ?? '1';
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const handleSubmit = () => {
    setIsConfirmVisible(false);
    router.replace(`/post-ride-checklist/success?tripId=${encodeURIComponent(activeTripId)}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        bounces={true}
      >
        <View className="px-5">
          <StepIndicator currentStep={4} totalSteps={4} />

          <Text className="font-inter font-bold text-[16px] text-[#101928] uppercase tracking-wide mb-4">
            Review & Submit
          </Text>
        </View>

        <View className="bg-[#E32636] px-5 py-3 mb-6 w-full">
          <Text className="text-white font-inter font-medium text-[13px] leading-5">
            Submitting this checklist is irreversible. Please ensure all information is accurate before proceeding.
          </Text>
        </View>

        <View className="px-5">
          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
            Checklist Summary - Before
          </Text>

          {MOCK_POST_RIDE_CHECKLIST.summaryBefore.map((item) => (
            <SummaryCard key={item.title} title={item.title} subtitle={item.subtitle} />
          ))}

          <View className="h-[1px] bg-[#98A2B3] w-full my-6" />

          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
            Checklist Summary - After
          </Text>

          {MOCK_POST_RIDE_CHECKLIST.summaryAfter.map((item) => (
            <SummaryCard key={item.title} title={item.title} subtitle={item.subtitle} />
          ))}

          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mt-2 mb-4">
            Submission Details:
          </Text>

          {MOCK_POST_RIDE_CHECKLIST.submissionDetails.map((detail, index) => (
            <NumberedListItem key={detail} index={index + 1} text={detail} size="small" />
          ))}

          <View className="h-[1px] bg-[#E4E7EC] w-full mt-4" />
        </View>
      </ScrollView>

      <ChecklistFooter
        title="Submit Checklist"
        activeOpacity={0.8}
        onPress={() => setIsConfirmVisible(true)}
      />

      <ConfirmationModal
        visible={isConfirmVisible}
        onClose={() => setIsConfirmVisible(false)}
        onConfirm={handleSubmit}
        title="Submit Report"
        message="Are you sure you want to Submit Report? This action cannot be undone."
        confirmText="Submit"
      />
    </SafeAreaView>
  );
}
