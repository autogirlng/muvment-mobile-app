import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { CustomBack } from '../../src/components/common/CustomBack';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LocationItem } from '../../src/components/common/LocationItem';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { VehicleCard } from '../../src/components/common/VehicleCard';
import { getApiErrorMessage } from '../../src/api/errors';
import { usePostRideChecklistAggregate } from '../../src/api/hooks/usePreRideChecklist';
import { useDriverTrip } from '../../src/api/hooks/useTrips';
import type { PostRideChecklistAggregate } from '../../src/api/types';
import { openMapForAddress } from '../../src/utils/deviceActions';

const getDisplayValue = (value: string | null | undefined, fallback: string) =>
  value?.trim() || fallback;

const getResumeRoute = (
  tripId: string,
  aggregate?: PostRideChecklistAggregate,
) => {
  const encodedTripId = encodeURIComponent(tripId);
  const postTripSummary = aggregate?.postTripSummary;

  if (!postTripSummary?.exteriorPhotos.valid) {
    return `/post-ride-checklist/step2?tripId=${encodedTripId}`;
  }

  if (!postTripSummary.interiorPhotos.valid) {
    return `/post-ride-checklist/step3?tripId=${encodedTripId}`;
  }

  return `/post-ride-checklist/step4?tripId=${encodedTripId}`;
};

export default function PostRideChecklistStep1Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId?.trim();
  const driverTripQuery = useDriverTrip(activeTripId);
  const aggregateQuery = usePostRideChecklistAggregate(activeTripId);
  const driverTripDetails = driverTripQuery.data?.data;
  const checklistAggregate = aggregateQuery.data?.data;
  const dropOffAddress = getDisplayValue(
    driverTripDetails?.dropOffLocation?.location,
    'Drop-off location unavailable',
  );
  const vehicleName = getDisplayValue(
    driverTripDetails?.vehicleName,
    'Vehicle unavailable',
  );
  const vehicleIdentifier = getDisplayValue(
    driverTripDetails?.vehicleIdentifier,
    'Identifier unavailable',
  );
  const vehicleImage = driverTripDetails?.primaryVehicleImage?.trim() || undefined;

  const renderHeader = () => (
    <View className="px-4 pt-2 pb-2 z-10">
      <CustomBack color="#101928" />
    </View>
  );

  if (!activeTripId) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
        {renderHeader()}
        <EmptyState
          title="Trip unavailable"
          description="Missing trip ID. Please go back and select a trip again."
        />
      </SafeAreaView>
    );
  }

  if (driverTripQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
        {renderHeader()}
        <EmptyState
          title="Loading trip details"
          description="Fetching drop-off and vehicle information."
        />
      </SafeAreaView>
    );
  }

  if (driverTripQuery.isError || !driverTripDetails) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
        {renderHeader()}
        <EmptyState
          title="Unable to load trip details"
          description={getApiErrorMessage(driverTripQuery.error) ?? 'Please check your connection and try again.'}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <View className="flex-1" style={{ flex: 1 }}>
      {renderHeader()}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator currentStep={1} totalSteps={4} />

        <Text className="font-inter font-bold text-[18px] text-[#101928] uppercase tracking-wide mb-8">
          Post-Ride Checklist
        </Text>

        <LocationItem
          title="Drop-Off Location"
          address={dropOffAddress}
          onMapPress={() => openMapForAddress(dropOffAddress)}
        />

        <View className="mb-2 mt-2">
          <Text className="font-inter font-medium text-[13px] text-[#101928] uppercase mb-4">
            Assigned Vehicle
          </Text>

          <VehicleCard
            imageUri={vehicleImage}
            model={vehicleName}
            plate={vehicleIdentifier}
          />
        </View>
      </ScrollView>

      <ChecklistFooter
        title={aggregateQuery.isLoading ? 'Checking...' : 'Next'}
        activeOpacity={0.8}
        disabled={aggregateQuery.isLoading}
        onPress={() => router.push(getResumeRoute(activeTripId, checklistAggregate))}
      />
      </View>
    </SafeAreaView>
  );
}
