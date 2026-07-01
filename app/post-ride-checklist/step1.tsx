import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { CustomBack } from '../../src/components/common/CustomBack';
import { CustomButton } from '../../src/components/common/CustomButton';
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
  const [isDropoffExpanded, setIsDropoffExpanded] = useState(false);

  const [vehicleModel, vehiclePlate] = selectedTrip?.vehicle.split('•').map((value) => value.trim()) ?? [
    trip.vehicle.model,
    trip.vehicle.plate,
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} bounces={true}>
        <StepIndicator currentStep={1} totalSteps={4} />

        <Text className="font-inter font-bold text-[18px] text-[#101928] uppercase tracking-wide mb-8">
          Post-Ride Checklist
        </Text>

        <LocationItem
          title="Drop-Off Location"
          address={trip.locations.dropoff}
          showDropdown
          details={[
            trip.itinerary[1],
            trip.itinerary[3],
          ]}
          isExpanded={isDropoffExpanded}
          onToggle={() => setIsDropoffExpanded((isExpanded) => !isExpanded)}
          onMapPress={() => console.log('Open Dropoff Map')}
        />

        <View className="mb-2 mt-2">
          <Text className="font-inter font-medium text-[13px] text-[#101928] uppercase mb-4">
            Assigned Vehicle
          </Text>

          <VehicleCard model={vehicleModel} plate={vehiclePlate} />
        </View>
      </ScrollView>

      <View className="px-5 pb-8 pt-4 bg-[#F8FAFC]">
        <CustomButton
          title="Next"
          activeOpacity={0.8}
          onPress={() => router.push(`/post-ride-checklist/step2?tripId=${encodeURIComponent(activeTripId)}`)}
        />
      </View>
    </SafeAreaView>
  );
}
