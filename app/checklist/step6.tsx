// app/checklist/step6.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { ConfirmationModal } from '../../src/components/common/ConfirmModal';
import { CustomBack } from '../../src/components/common/CustomBack';
import { NumberedListItem } from '../../src/components/common/NumberedListItem';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { SummaryCard } from '../../src/components/common/SummaryCard';
import { getApiErrorMessage } from '../../src/api/errors';
import {
  usePreRideChecklistSummary,
  useSubmitPreRideChecklist,
} from '../../src/api/hooks/usePreRideChecklist';
import type { PreRideChecklistSummarySection } from '../../src/api/types';

const getPhotosNotCaptured = (section: PreRideChecklistSummarySection) =>
  section.photosNotCaptured ?? section.photoNotCaptured ?? 0;

const getPhotoSummaryLabel = (
  section: PreRideChecklistSummarySection,
  label: string,
) => {
  const missing = getPhotosNotCaptured(section);
  const status = section.valid ? 'complete' : 'incomplete';

  return `${section.photosCaptured} ${label} captured${
    missing > 0 ? `, ${missing} missing` : ''
  } | ${status}`;
};

export default function ChecklistStep6Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId ?? '1';
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const summaryQuery = usePreRideChecklistSummary(activeTripId);
  const submitPreRideChecklist = useSubmitPreRideChecklist();
  const summary = summaryQuery.data?.data;
  const summaryTimestamp = summaryQuery.data?.timestamp;
  const checklistIsValid = Boolean(
    summary?.exteriorPhotos.valid &&
      summary.interiorPhotos.valid &&
      summary.vehicleHealthCheckPhotos.valid &&
      summary.driverPhoto.valid,
  );
  const canSubmit =
    checklistIsValid &&
    !summaryQuery.isLoading &&
    !summaryQuery.isError &&
    !submitPreRideChecklist.isPending;

  const handleSubmit = async () => {
    setIsConfirmVisible(false);

    try {
      await submitPreRideChecklist.mutateAsync({ tripId: activeTripId });

      Toast.show({
        type: 'successToast',
        text1: 'Checklist Submitted',
        text2: 'You are ready to start the trip.',
        position: 'top',
        topOffset: 60,
      });

      router.replace(`/trip/${encodeURIComponent(activeTripId)}?stage=checked-in`);
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Checklist submission failed',
        text2: getApiErrorMessage(error) ?? 'Please try again.',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <View className="flex-1" style={{ flex: 1 }}>
      
      {/* Header with Back Button */}
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        
        <View className="px-5">
          <StepIndicator currentStep={6} totalSteps={6} />
          
          <Text className="font-inter font-bold text-[16px] text-[#101928] uppercase tracking-wide mb-4">
            Review & Submit
          </Text>
        </View>

        {/* Red Instruction Banner */}
        <View className="bg-[#E32636] px-5 py-3 mb-6 w-full">
          <Text className="text-white font-inter font-medium text-[13px] leading-5">
            Submitting this checklist is irreversible. Please ensure all information is accurate before proceeding.
          </Text>
        </View>

        <View className="px-5">
          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
            Checklist Summary
          </Text>

          {summaryQuery.isLoading && (
            <Text className="font-inter text-[#667185] text-[14px] mb-4">
              Loading checklist summary...
            </Text>
          )}

          {summaryQuery.isError && (
            <Text className="font-inter text-[#E32636] text-[14px] mb-4">
              {getApiErrorMessage(summaryQuery.error) ?? 'Unable to load checklist summary.'}
            </Text>
          )}

          {summary && (
            <>
              <SummaryCard
                title="Vehicle Info"
                subtitle={`${summary.vehicleInfo.vehicleName} - ${summary.vehicleInfo.vehicleIdentifier}`}
              />
              <SummaryCard
                title="Exterior Photos"
                subtitle={getPhotoSummaryLabel(summary.exteriorPhotos, 'photos')}
              />
              <SummaryCard
                title="Interior Photos"
                subtitle={`${getPhotoSummaryLabel(summary.interiorPhotos, 'photos')}, odometer: ${summary.interiorPhotos.metadata?.odometerKM ?? 0} km | FL:${summary.interiorPhotos.metadata?.fuelLevelInPercentage ?? 0}%`}
              />
              <SummaryCard
                title="Health Check"
                subtitle={getPhotoSummaryLabel(summary.vehicleHealthCheckPhotos, 'photos')}
              />
              <SummaryCard
                title="Driver Photo"
                subtitle={getPhotoSummaryLabel(summary.driverPhoto, 'photo')}
              />
            </>
          )}

          <View className="h-[1px] bg-[#E4E7EC] w-full my-6" />

          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
            Submission Details:
          </Text>

          <NumberedListItem
            index={1}
            text={`Timestamp: ${summaryTimestamp ? new Date(summaryTimestamp).toLocaleString() : 'Unavailable'}`}
          />
          <NumberedListItem
            index={2}
            text={`Total Completion: ${summary?.totalCompletionTime ?? 'Unavailable'}`}
          />
          <NumberedListItem
            index={3}
            text={`Checklist Status: ${checklistIsValid ? 'Ready to submit' : 'Incomplete'}`}
          />
        </View>
      </ScrollView>

      <ChecklistFooter
        title={submitPreRideChecklist.isPending ? 'Submitting...' : 'Submit Checklist'}
        disabled={!canSubmit}
        onPress={() => setIsConfirmVisible(true)}
      />
      </View>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        visible={isConfirmVisible}
        onClose={() => setIsConfirmVisible(false)}
        onConfirm={() => {
          void handleSubmit();
        }}
        title="Submit Checklist"
        message="Are you sure you want to Submit Checklist? This action cannot be undone."
        confirmText="Submit"
      />

    </SafeAreaView>
  );
}
