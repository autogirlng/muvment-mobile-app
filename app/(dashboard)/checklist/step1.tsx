import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { CustomBack } from '../../../src/components/common/CustomBack';
import { CustomButton } from '../../../src/components/common/CustomButton';
import { StepIndicator } from '../../../src/components/common/StepIndicator';
import { MOCK_TRIP_DETAILS } from '../../../src/data/mockData';

type LocationSelectorProps = {
  title: string;
  address: string;
  details: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onMapPress: () => void;
};

export default function ChecklistStep1Screen() {
  const trip = MOCK_TRIP_DETAILS;
  const [expandedLocation, setExpandedLocation] = useState<'pickup' | 'dropoff' | null>(null);

  const toggleLocation = (location: 'pickup' | 'dropoff') => {
    setExpandedLocation((currentLocation) => (
      currentLocation === location ? null : location
    ));
  };

  // Helper component for the Location Dropdown style UI
  const LocationSelector = ({
    title,
    address,
    details,
    isExpanded,
    onToggle,
    onMapPress,
  }: LocationSelectorProps) => (
    <View className="mb-6">
      <Text className="font-inter font-medium text-[13px] text-[#101928] uppercase mb-2">
        {title}
      </Text>
      
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggle}
        className="border border-[#E4E7EC] rounded-xl p-4 flex-row items-center justify-between bg-white mb-2"
      >
        <View className="flex-row items-center flex-1">
          <Feather name="map-pin" size={18} color="#98A2B3" />
          <Text className="font-inter text-[#101928] text-[15px] ml-3 flex-1" numberOfLines={1}>
            {address}
          </Text>
        </View>
        <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#101928" />
      </TouchableOpacity>

      {isExpanded && (
        <View className="border border-[#E4E7EC] rounded-xl bg-white p-4 mb-3">
          <Text className="font-inter text-[#667185] text-[13px] mb-2">
            Assigned address
          </Text>
          <Text className="font-inter font-medium text-[#101928] text-[14px] mb-4">
            {address}
          </Text>

          <Text className="font-inter text-[#667185] text-[13px] mb-2">
            Trip context
          </Text>
          {details.map((detail) => (
            <View key={detail} className="flex-row items-start mb-2">
              <View className="w-1.5 h-1.5 rounded-full bg-[#0673FF] mt-2 mr-2" />
              <Text className="font-inter text-[#475367] text-[14px] flex-1">
                {detail}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={onMapPress}>
        <Text className="text-[#0673FF] font-inter text-[14px]">Open in Maps</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      
      {/* Header with Back Button */}
      <View className="px-4 pt-2 pb-2 bg-[#F8FAFC] z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} bounces={true}>
        
        {/* Dynamic Step Tracker */}
        <StepIndicator currentStep={1} totalSteps={6} />

        <Text className="font-inter font-bold text-[18px] text-[#101928] uppercase tracking-wide mb-8">
          Confirm Vehicle
        </Text>

        {/* Locations */}
        <LocationSelector 
          title="Pickup Location"
          address={trip.locations.pickup}
          details={[
            trip.itinerary[0],
            trip.itinerary[3],
          ]}
          isExpanded={expandedLocation === 'pickup'}
          onToggle={() => toggleLocation('pickup')}
          onMapPress={() => console.log('Open Pickup Map')}
        />

        <LocationSelector 
          title="Drop-Off Location"
          address={trip.locations.dropoff}
          details={[
            trip.itinerary[1],
            trip.itinerary[2],
          ]}
          isExpanded={expandedLocation === 'dropoff'}
          onToggle={() => toggleLocation('dropoff')}
          onMapPress={() => console.log('Open Dropoff Map')}
        />

        {/* Assigned Vehicle Card */}
        <View className="mb-4 mt-2">
          <Text className="font-inter font-medium text-[13px] text-[#101928] uppercase mb-4">
            Assigned Vehicle
          </Text>

          <View className="border border-[#E4E7EC] rounded-2xl bg-white overflow-hidden shadow-sm">
            {/* Generic placeholder car image to match your mockup */}
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800' }} 
              className="w-full h-40" 
              resizeMode="cover" 
            />
            
            <View className="p-4">
              <Text className="font-inter font-medium text-[16px] text-[#475367] mb-1">
                {trip.vehicle.model}
              </Text>
              <Text className="font-inter text-[#98A2B3] text-[14px] mb-4">
                {trip.vehicle.plate}
              </Text>
              
              <View className="flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-[#12B76A] mr-2" />
                <Text className="font-inter text-[#475367] text-[13px]">
                  Selected for this ride
                </Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View className="px-5 pb-8 pt-4 bg-[#F8FAFC]">
        <CustomButton
          title="Next"
          activeOpacity={0.8}
          onPress={() => console.log('Proceed to Step 2')} // Will update this to route to step 2 next!
        />
      </View>

    </SafeAreaView>
  );
}
