import React, {useState} from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

import { TimelineTracker } from '../../../src/components/common/TimelineTracker';
import { LocationItem } from '../../../src/components/common/LocationItem';
import { CallModal } from '../../../src/components/common/CallModal';
import { FLAT_TRIPS_DATA, MOCK_TRIP_DETAILS } from '../../../src/data/mockData';

const getStatusFromBadges = (badges: { label: string }[]) => {
  const labels = badges.map((badge) => badge.label.toUpperCase());

  if (labels.includes('ONGOING')) return 'ONGOING';
  if (labels.includes('COMPLETE') || labels.includes('COMPLETED')) return 'COMPLETE';
  if (labels.includes('CANCELLED')) return 'CANCELLED';
  if (labels.includes('AWAITING PICKUP')) return 'AWAITING PICKUP';

  return 'NOT STARTED';
};

const getBannerMessage = (status: string) => {
  switch (status) {
    case 'ONGOING':
      return 'Trip Ongoing - Complete Ride Safely';
    case 'COMPLETE':
      return 'Trip Complete';
    case 'CANCELLED':
      return 'Trip Cancelled';
    case 'AWAITING PICKUP':
      return "Waiting for client. Tap 'Start Ride' when ready.";
    case 'RUNNING LATE':
      return 'Pickup overdue. Contact operations.';
    default:
      return 'Trip Not Started - Complete Pre-Ride Checklist';
  }
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const selectedTrip = FLAT_TRIPS_DATA.find((trip) => trip.id === id);
  const selectedStatus = selectedTrip ? getStatusFromBadges(selectedTrip.badges) : MOCK_TRIP_DETAILS.status;
  const trip = {
    ...MOCK_TRIP_DETAILS,
    id: selectedTrip?.tripId ?? MOCK_TRIP_DETAILS.id,
    status: selectedStatus,
    bannerMessage: getBannerMessage(selectedStatus),
    client: {
      ...MOCK_TRIP_DETAILS.client,
      name: selectedTrip?.clientName ?? MOCK_TRIP_DETAILS.client.name,
    },
    locations: {
      ...MOCK_TRIP_DETAILS.locations,
      pickup: selectedTrip?.location ?? MOCK_TRIP_DETAILS.locations.pickup,
    },
    vehicle: {
      ...MOCK_TRIP_DETAILS.vehicle,
      model: selectedTrip?.vehicle.split('•')[0]?.trim() ?? MOCK_TRIP_DETAILS.vehicle.model,
      plate: selectedTrip?.vehicle.split('•')[1]?.trim() ?? MOCK_TRIP_DETAILS.vehicle.plate,
    },
  };

  const [isCallModalVisible, setIsCallModalVisible] = useState(false);

  const SectionDivider = () => <View className="h-[1px] bg-[#E4E7EC] w-full my-3" />;

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="font-inter font-semibold text-[13px] text-[#1F2937] tracking-wider uppercase mb-4">
      {title}
    </Text>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      
      {/* Header */}
      <View className="px-4 pt-2 pb-4 z-10">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="flex-row items-center ml-[-8px]"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="chevron-left" size={24} color="#101928" />
          <Text className="text-[#101928] font-inter text-base ml-1">
            Back
          </Text>
        </TouchableOpacity>
      </View>

      {/* Red Status Banner */}
      <View className="bg-[#DC2626] px-4 py-3 w-full">
        <Text className="text-white font-inter font-medium text-center text-[14px]">
          {trip.bannerMessage}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} bounces={true}>
        
        {/* --- TRIP STATUS --- */}
        <SectionHeader title="Trip Status" />
        <View className="bg-[#EAB308] self-start px-4 py-2 rounded-full mb-2">
          <Text className="text-white font-inter font-semibold text-[11px] uppercase tracking-wide">
            {trip.status}
          </Text>
        </View>

        <SectionDivider />

        {/* --- TRIP TIMELINE (Now Reusable!) --- */}
        <SectionHeader title="Trip Timeline" />
        <TimelineTracker steps={trip.timeline as any} />

        <SectionDivider />

        {/* --- CLIENT --- */}
        <SectionHeader title="Client" />
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="font-inter font-medium text-[16px] text-[#101928] mb-1">
              {trip.client.name}
            </Text>
            <Text className="font-inter text-[#667185] text-[14px]">
              {trip.client.phone}
            </Text>
          </View>
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-[#E6F4EA] items-center justify-center"
            onPress={() => setIsCallModalVisible(true)}
          >
            <Feather name="phone" size={18} color="#12B76A" />
          </TouchableOpacity>
        </View>

        <SectionDivider />

        {/* --- LOCATIONS (Now Reusable!) --- */}
        <LocationItem
          title="Pickup Location" 
          address={trip.locations.pickup} 
          onMapPress={() => console.log('Open Maps Pickup')} 
        />

        <SectionDivider />
        
        <LocationItem
          title="Drop-Off Location" 
          address={trip.locations.dropoff} 
          onMapPress={() => console.log('Open Maps Dropoff')} 
        />

        <SectionDivider />

        {/* --- VEHICLE --- */}
        <SectionHeader title="Vehicle" />
        <View className="flex-row items-center">
          <View className="w-[46px] h-[46px] bg-[#F2F4F7] rounded-xl items-center justify-center mr-3">
            <Ionicons name="car-outline" size={24} color="#475367" />
          </View>
          <View>
            <Text className="font-inter font-medium text-[15px] text-[#101928] mb-0.5">
              {trip.vehicle.model}
            </Text>
            <Text className="font-inter text-[#667185] text-[13px]">
              {trip.vehicle.plate}
            </Text>
          </View>
        </View>

        <SectionDivider />

        {/* --- BOOKING --- */}
        <SectionHeader title="Booking" />
        <View className="flex-row items-center space-x-2 mb-4">
          <View className="bg-[#101928] px-2.5 py-1 rounded-full">
            <Text className="text-[#F5A623] font-inter font-semibold text-[10px] tracking-wide uppercase">
              {trip.booking.type}
            </Text>
          </View>
          <View className="bg-[#F4F3FF] px-2.5 py-1 rounded-full ml-2">
            <Text className="text-[#5925DC] font-inter font-semibold text-[10px] tracking-wide uppercase">
              {trip.booking.rentalType}
            </Text>
          </View>
        </View>

        <View className="space-y-2">
          <View className="flex-row items-center">
            <Feather name="calendar" size={15} color="#98A2B3" />
            <Text className="ml-2 font-inter text-[#667185] text-[14px]">
              Date: <Text className="text-[#101928] font-medium">{trip.booking.date}</Text>
            </Text>
          </View>
          <View className="flex-row items-center mt-2">
            <Feather name="clock" size={15} color="#98A2B3" />
            <Text className="ml-2 font-inter text-[#667185] text-[14px]">
              Duration: <Text className="text-[#101928] font-medium">{trip.booking.duration}</Text>
            </Text>
          </View>
          <View className="flex-row items-center mt-2">
            <Feather name="calendar" size={15} color="#98A2B3" />
            <Text className="ml-2 font-inter text-[#667185] text-[14px]">
              Schedule: <Text className="text-[#101928] font-medium">{trip.booking.schedule}</Text>
            </Text>
          </View>
        </View>

        <SectionDivider />

        {/* --- ITINERARY --- */}
        <SectionHeader title="Itinerary" />
        <View className="space-y-4">
          {trip.itinerary.map((item, index) => (
            <View key={index} className="flex-row items-start mt-2">
              <View className="w-5 h-5 rounded-full bg-[#D0D5DD] items-center justify-center mt-0.5 mr-3">
                <Text className="font-inter font-semibold text-[#344054] text-[10px]">
                  {index + 1}
                </Text>
              </View>
              <Text className="flex-1 font-inter text-[#475367] text-[14px] leading-5">
                {item}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="w-full bg-[#0673FF] h-[52px] rounded-xl flex-row items-center justify-center shadow-sm mt-8 mb-6"
          onPress={() => router.push('/checklist/step1')}
        >
          <Text className="text-white font-inter font-medium text-base">
            Start Pre-Ride Checklist
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <CallModal
        visible={isCallModalVisible}
        onClose={() => setIsCallModalVisible(false)}
        phoneNumber={trip.client.phone}
      />

    </SafeAreaView>
  );
}
