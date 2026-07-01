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
import { LocationItem } from '../../src/components/common/LocationItem';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { VehicleCard } from '../../src/components/common/VehicleCard';
import {
  FLAT_TRIPS_DATA,
  MOCK_TRIP_DETAILS_BY_STAGE,
} from '../../src/data/mockData';

export default function PostRideChecklistStep1Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId ?? '1';
  const selectedTrip = FLAT_TRIPS_DATA.find((trip) => trip.id === activeTripId);
  const trip = MOCK_TRIP_DETAILS_BY_STAGE.ongoing;

  const [vehicleModel, vehiclePlate] = selectedTrip?.vehicle.split('•').map((value) => value.trim()) ?? [
    trip.vehicle.model,
    trip.vehicle.plate,
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <View className="flex-1" style={{ flex: 1 }}>
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

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
          address={trip.locations.dropoff}
          onMapPress={() => console.log('Open Dropoff Map')}
        />

        <View className="mb-2 mt-2">
          <Text className="font-inter font-medium text-[13px] text-[#101928] uppercase mb-4">
            Assigned Vehicle
          </Text>

          <VehicleCard model={vehicleModel} plate={vehiclePlate} />
        </View>
      </ScrollView>

      <ChecklistFooter
        title="Next"
        activeOpacity={0.8}
        onPress={() => router.push(`/post-ride-checklist/step2?tripId=${encodeURIComponent(activeTripId)}`)}
      />
      </View>
    </SafeAreaView>
  );
}
