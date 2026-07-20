import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { ConfirmationModal } from '../../src/components/common/ConfirmModal';
import { CustomBack } from '../../src/components/common/CustomBack';
import { EmptyState } from '../../src/components/common/EmptyState';
import { NumberedListItem } from '../../src/components/common/NumberedListItem';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { SummaryCard } from '../../src/components/common/SummaryCard';
import { getApiErrorMessage } from '../../src/api/errors';
import {
  usePostRideChecklistAggregate,
  useTransitionDriverTripStatus,
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

export default function PostRideChecklistStep4Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId?.trim() ?? '';
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const aggregateQuery = usePostRideChecklistAggregate(activeTripId);
  const transitionDriverTripStatus = useTransitionDriverTripStatus();
  const aggregate = aggregateQuery.data?.data;
  const preTripSummary = aggregate?.preTripSummary;
  const postTripSummary = aggregate?.postTripSummary;
  const aggregateTimestamp = aggregateQuery.data?.timestamp;
  const postRideChecklistIsValid = Boolean(
    postTripSummary?.exteriorPhotos.valid &&
      postTripSummary.interiorPhotos.valid,
  );
  const canSubmit =
    postRideChecklistIsValid &&
    Boolean(activeTripId) &&
    !aggregateQuery.isLoading &&
    !aggregateQuery.isError &&
    !transitionDriverTripStatus.isPending;

  const handleSubmit = async () => {
    setIsConfirmVisible(false);

    if (!activeTripId) {
      Toast.show({
        type: 'errorToast',
        text1: 'Trip unavailable',
        text2: 'Please go back and select the trip again.',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    try {
      await transitionDriverTripStatus.mutateAsync({
        driverTripStatus: 'COMPLETE',
        tripId: activeTripId,
      });

      Toast.show({
        type: 'successToast',
        text1: 'Post-ride checklist submitted',
        text2: 'The ride has been marked complete.',
        position: 'top',
        topOffset: 60,
      });

      router.replace(`/trip/${encodeURIComponent(activeTripId)}?stage=complete`);
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Post-ride submission failed',
        text2: getApiErrorMessage(error) ?? 'Please try again.',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  if (!activeTripId) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
        <View className="px-4 pt-2 pb-2 z-10">
          <CustomBack color="#101928" />
        </View>
        <EmptyState
          title="Trip unavailable"
          description="Missing trip ID. Please go back and select a trip again."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <View className="flex-1" style={{ flex: 1 }}>
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
          {aggregateQuery.isLoading && (
            <Text className="font-inter text-[#667185] text-[14px] mb-4">
              Loading checklist summary...
            </Text>
          )}

          {aggregateQuery.isError && (
            <Text className="font-inter text-[#E32636] text-[14px] mb-4">
              {getApiErrorMessage(aggregateQuery.error) ?? 'Unable to load checklist summary.'}
            </Text>
          )}

          {preTripSummary && (
            <>
              <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
                Checklist Summary - Before
              </Text>

              <SummaryCard
                title="Vehicle Info"
                subtitle={`${preTripSummary.vehicleInfo.vehicleName} - ${preTripSummary.vehicleInfo.vehicleIdentifier}`}
              />
              <SummaryCard
                title="Exterior Photos"
                subtitle={getPhotoSummaryLabel(preTripSummary.exteriorPhotos, 'photos')}
              />
              <SummaryCard
                title="Interior Photos"
                subtitle={`${getPhotoSummaryLabel(preTripSummary.interiorPhotos, 'photos')}, odometer: ${preTripSummary.interiorPhotos.metadata?.odometerKM ?? 0} km | FL:${preTripSummary.interiorPhotos.metadata?.fuelLevelInPercentage ?? 0}%`}
              />
              <SummaryCard
                title="Health Check"
                subtitle={getPhotoSummaryLabel(preTripSummary.vehicleHealthCheckPhotos, 'photos')}
              />
              <SummaryCard
                title="Driver Photo"
                subtitle={getPhotoSummaryLabel(preTripSummary.driverPhoto, 'photo')}
              />
            </>
          )}

          <View className="h-[1px] bg-[#98A2B3] w-full my-6" />

          {postTripSummary && (
            <>
              <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
                Checklist Summary - After
              </Text>

              <SummaryCard
                title="Drop-off Location"
                subtitle={postTripSummary.dropOffLocation || 'Drop-off location unavailable'}
              />
              <SummaryCard
                title="Exterior Photos"
                subtitle={getPhotoSummaryLabel(postTripSummary.exteriorPhotos, 'photos')}
              />
              <SummaryCard
                title="Interior Photos"
                subtitle={`${getPhotoSummaryLabel(postTripSummary.interiorPhotos, 'photos')}, odometer: ${postTripSummary.interiorPhotos.metadata?.odometerKM ?? postTripSummary.vehicleMetadata?.odometerKM ?? 0} km | FL:${postTripSummary.interiorPhotos.metadata?.fuelLevelInPercentage ?? postTripSummary.vehicleMetadata?.fuelLevelInPercentage ?? 0}%`}
              />
            </>
          )}

          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mt-2 mb-4">
            Submission Details:
          </Text>

          <NumberedListItem
            index={1}
            text={`Timestamp: ${aggregateTimestamp ? new Date(aggregateTimestamp).toLocaleString() : 'Unavailable'}`}
            size="small"
          />
          <NumberedListItem
            index={2}
            text={`Total Completion: ${postTripSummary?.totalCompletionTime ?? 'Unavailable'}`}
            size="small"
          />
          <NumberedListItem
            index={3}
            text={`Checklist Status: ${postRideChecklistIsValid ? 'Ready to submit' : 'Incomplete'}`}
            size="small"
          />

          <View className="h-[1px] bg-[#E4E7EC] w-full mt-4" />
        </View>
      </ScrollView>

      <ChecklistFooter
        title={transitionDriverTripStatus.isPending ? 'Submitting...' : 'Submit Checklist'}
        activeOpacity={0.8}
        disabled={!canSubmit}
        onPress={() => setIsConfirmVisible(true)}
      />
      </View>

      <ConfirmationModal
        visible={isConfirmVisible}
        onClose={() => setIsConfirmVisible(false)}
        onConfirm={() => {
          void handleSubmit();
        }}
        title="Submit Report"
        message="Are you sure you want to Submit Report? This action cannot be undone."
        confirmText="Submit"
      />
    </SafeAreaView>
  );
}
