import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView
} from 'react-native';
import { router } from 'expo-router';

import { CustomBack } from '../../src/components/common/CustomBack';
import { CustomButton } from '../../src/components/common/CustomButton';
import { LocationItem } from '../../src/components/common/LocationItem';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { VehicleCard } from '../../src/components/common/VehicleCard';
import { MOCK_TRIP_DETAILS } from '../../src/data/mockData';

export default function ChecklistStep1Screen() {
  const trip = MOCK_TRIP_DETAILS;
  const [expandedLocation, setExpandedLocation] = useState<'pickup' | 'dropoff' | null>(null);

  const toggleLocation = (location: 'pickup' | 'dropoff') => {
    setExpandedLocation((currentLocation) => (
      currentLocation === location ? null : location
    ));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      
      {/* Header with Back Button */}
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} bounces={true}>
        
        {/* Dynamic Step Tracker */}
        <StepIndicator currentStep={1} totalSteps={6} />

        <Text className="font-inter font-bold text-[18px] text-[#101928] uppercase tracking-wide mb-8">
          Confirm Vehicle
        </Text>

        {/* Locations */}
        <LocationItem
          title="Pickup Location"
          address={trip.locations.pickup}
          showDropdown
          details={[
            trip.itinerary[0],
            trip.itinerary[3],
          ]}
          isExpanded={expandedLocation === 'pickup'}
          onToggle={() => toggleLocation('pickup')}
          onMapPress={() => console.log('Open Pickup Map')}
        />

        <LocationItem
          title="Drop-Off Location"
          address={trip.locations.dropoff}
          showDropdown
          details={[
            trip.itinerary[1],
            trip.itinerary[2],
          ]}
          isExpanded={expandedLocation === 'dropoff'}
          onToggle={() => toggleLocation('dropoff')}
          onMapPress={() => console.log('Open Dropoff Map')}
        />

        {/* Assigned Vehicle Card */}
        <View className="mb-2 mt-2">
          <Text className="font-inter font-medium text-[13px] text-[#101928] uppercase mb-4">
            Assigned Vehicle
          </Text>

          <VehicleCard model={trip.vehicle.model} plate={trip.vehicle.plate} />
        </View>

      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View className="px-5 pb-8 pt-4 bg-[#F8FAFC] mb-6">
        <CustomButton
          title="Next"
          activeOpacity={0.8}
          onPress={() => router.push('/checklist/step2')} // Will update this to route to step 2 next!
        />
      </View>

    </SafeAreaView>
  );
}
