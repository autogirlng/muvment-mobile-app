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
import Svg, { Circle } from 'react-native-svg';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { TimelineTracker } from '../../src/components/common/TimelineTracker';
import { LocationItem } from '../../src/components/common/LocationItem';
import { CallModal } from '../../src/components/common/CallModal';
import { ConfirmationModal } from '../../src/components/common/ConfirmModal';
import {
  FLAT_TRIPS_DATA,
  MOCK_TRIP_DETAILS,
  MOCK_TRIP_DETAILS_BY_STAGE,
} from '../../src/data/mockData';
import type { TripStageKey } from '../../src/data/mockData';
import { openMapForAddress } from '../../src/utils/deviceActions';
import {
  getDriverTripBookingTimerType,
  type DriverTripBookingTimerType,
} from '../../src/utils/driverTrips';

const getStatusFromBadges = (badges: { label: string }[]) => {
  const labels = badges.map((badge) => badge.label.toUpperCase());

  if (labels.includes('ONGOING')) return 'ONGOING';
  if (labels.includes('CHECKED IN')) return 'CHECKED IN';
  if (labels.includes('RUNNING LATE')) return 'RUNNING LATE';
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

const getStageFromParam = (stage?: string | string[]): TripStageKey | null => {
  const normalizedStage = Array.isArray(stage) ? stage[0] : stage;

  switch (normalizedStage) {
    case 'not-started':
      return 'notStarted';
    case 'checked-in':
      return 'checkedIn';
    case 'awaiting-pickup':
      return 'awaitingPickup';
    case 'running-late':
      return 'runningLate';
    case 'ongoing':
      return 'ongoing';
    case 'complete':
      return 'complete';
    default:
      return null;
  }
};

const getStageFromStatus = (status: string): TripStageKey | null => {
  switch (status) {
    case 'NOT STARTED':
      return 'notStarted';
    case 'CHECKED IN':
      return 'checkedIn';
    case 'AWAITING PICKUP':
      return 'awaitingPickup';
    case 'RUNNING LATE':
      return 'runningLate';
    case 'ONGOING':
      return 'ongoing';
    case 'COMPLETE':
      return 'complete';
    default:
      return null;
  }
};

type RideTimerType = DriverTripBookingTimerType;

const getStringParam = (value?: string | string[]) => (
  Array.isArray(value) ? value[0] : value
);

const getRideTimerType = (rideType?: string | string[], rentalType?: string): RideTimerType => {
  const normalizedRideType = getStringParam(rideType);

  return getDriverTripBookingTimerType(normalizedRideType || rentalType);
};

const getRideTimerConfig = (rideType: RideTimerType) => {
  switch (rideType) {
    case 'airport':
      return {
        label: 'Airport Transfer – 4 Hours',
        totalSeconds: 4 * 60 * 60,
        defaultRemainingSeconds: (3 * 60 * 60) + (59 * 60) + 45,
      };
    case 'standard':
      return {
        label: 'Standard – 12 Hours',
        totalSeconds: 12 * 60 * 60,
        defaultRemainingSeconds: (11 * 60 * 60) + (59 * 60) + 45,
      };
    case 'full-day':
      return {
        label: 'Full Day Rental – 24 Hours',
        totalSeconds: 24 * 60 * 60,
        defaultRemainingSeconds: (23 * 60 * 60) + (59 * 60) + 45,
      };
  }
};

const formatTime = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
};

const TimerRing = ({
  remainingSeconds,
  totalSeconds,
}: {
  remainingSeconds: number;
  totalSeconds: number;
}) => {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - Math.max(0, Math.min(progress, 1)));

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#D9D9D9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1D8BFF"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <Text className="absolute font-inter font-bold text-[#1D2739] text-[18px]">
        {formatTime(remainingSeconds)}
      </Text>
    </View>
  );
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'CHECKED IN':
      return { banner: 'bg-[#0A8F2A]', badge: 'bg-[#12B76A]' };
    case 'AWAITING PICKUP':
      return { banner: 'bg-[#F97316]', badge: 'bg-[#F97316]' };
    case 'RUNNING LATE':
      return { banner: 'bg-[#DC2626]', badge: 'bg-[#D92D20]' };
    case 'ONGOING':
      return { banner: 'bg-[#0A8F2A]', badge: 'bg-[#12B76A]' };
    case 'COMPLETE':
      return { banner: 'bg-[#667185]', badge: 'bg-[#667185]' };
    case 'CANCELLED':
      return { banner: 'bg-[#DC2626]', badge: 'bg-[#D92D20]' };
    default:
      return { banner: 'bg-[#DC2626]', badge: 'bg-[#EAB308]' };
  }
};

export default function TripDetailScreen() {
  const { id, stage, pickupReady, rideType, remainingSeconds } = useLocalSearchParams<{
    id?: string;
    stage?: string;
    pickupReady?: string;
    rideType?: string;
    remainingSeconds?: string;
  }>();
  const selectedTrip = FLAT_TRIPS_DATA.find((trip) => trip.id === id);
  const selectedStatus = selectedTrip ? getStatusFromBadges(selectedTrip.badges) : MOCK_TRIP_DETAILS.status;
  const selectedStage = getStageFromParam(stage) ?? getStageFromStatus(selectedStatus);
  const stagedTripDetails = selectedStage ? MOCK_TRIP_DETAILS_BY_STAGE[selectedStage] : MOCK_TRIP_DETAILS;
  const trip = {
    ...stagedTripDetails,
    id: selectedTrip?.tripId ?? stagedTripDetails.id,
    status: selectedStage ? stagedTripDetails.status : selectedStatus,
    bannerMessage: selectedStage ? stagedTripDetails.bannerMessage : getBannerMessage(selectedStatus),
    client: {
      ...stagedTripDetails.client,
      name: selectedTrip?.clientName ?? stagedTripDetails.client.name,
    },
    locations: {
      ...stagedTripDetails.locations,
      pickup: selectedTrip?.location ?? stagedTripDetails.locations.pickup,
    },
    vehicle: {
      ...stagedTripDetails.vehicle,
      model: selectedTrip?.vehicle.split('•')[0]?.trim() ?? stagedTripDetails.vehicle.model,
      plate: selectedTrip?.vehicle.split('•')[1]?.trim() ?? stagedTripDetails.vehicle.plate,
    },
  };
  const statusStyle = getStatusStyle(trip.status);
  const routeTripId = id ?? selectedTrip?.id ?? '1';
  const isPickupTimeReached = pickupReady === 'true' || trip.status === 'RUNNING LATE';
  const timerType = getRideTimerType(rideType, trip.booking.rentalType);
  const timerConfig = getRideTimerConfig(timerType);
  const parsedRemainingSeconds = Number(getStringParam(remainingSeconds));
  const timerRemainingSeconds = Number.isFinite(parsedRemainingSeconds)
    ? parsedRemainingSeconds
    : timerConfig.defaultRemainingSeconds;

  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  const [isPickupTooltipVisible, setIsPickupTooltipVisible] = useState(false);
  const [isEndRideConfirmVisible, setIsEndRideConfirmVisible] = useState(false);

  const SectionDivider = () => <View className="h-[1px] bg-[#E4E7EC] w-full my-3" />;

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="font-inter font-semibold text-[13px] text-[#1F2937] tracking-wider uppercase mb-4">
      {title}
    </Text>
  );

  const getActionConfig = () => {
    switch (trip.status) {
      case 'CHECKED IN':
        return {
          title: 'Proceed to Pickup',
          disabled: false,
          showPickupTooltip: false,
          destructive: false,
          onPress: () => router.push(`/trip/${encodeURIComponent(routeTripId)}?stage=awaiting-pickup`),
        };
      case 'AWAITING PICKUP':
        return {
          title: 'Start Ride',
          disabled: !isPickupTimeReached,
          showPickupTooltip: !isPickupTimeReached,
          destructive: false,
          onPress: () => console.log('Start ride'),
        };
      case 'RUNNING LATE':
        return {
          title: 'Start Ride',
          disabled: false,
          showPickupTooltip: false,
          destructive: false,
          onPress: () => console.log('Start ride'),
        };
      case 'ONGOING':
        return {
          title: 'End Ride',
          disabled: false,
          showPickupTooltip: false,
          destructive: true,
          onPress: () => setIsEndRideConfirmVisible(true),
        };
      case 'COMPLETE':
        return null;
      default:
        return {
          title: 'Start Pre-Ride Checklist',
          disabled: false,
          showPickupTooltip: false,
          destructive: false,
          onPress: () => router.push(`/checklist/step1?tripId=${encodeURIComponent(routeTripId)}`),
        };
    }
  };

  const actionConfig = getActionConfig();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      
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

      {trip.status !== 'COMPLETE' && (
        <View className={`${statusStyle.banner} px-4 py-3 w-full`}>
          <Text className="text-white font-inter font-medium text-center text-[14px]">
            {trip.bannerMessage}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} bounces={true}>
        {trip.status === 'ONGOING' && (
          <View className="items-center mb-6">
            <TimerRing
              remainingSeconds={timerRemainingSeconds}
              totalSeconds={timerConfig.totalSeconds}
            />
            <Text className="font-inter text-[#667185] text-[13px] mt-4 mb-1">
              Time remaining
            </Text>
            <Text className="font-inter font-bold text-[#1D2739] text-[17px]">
              {timerConfig.label}
            </Text>
          </View>
        )}

        {/* --- TRIP STATUS --- */}
        <SectionHeader title="Trip Status" />
        <View className={`${statusStyle.badge} self-start px-4 py-2 rounded-full mb-2`}>
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
          onMapPress={() => openMapForAddress(trip.locations.pickup)}
        />

        <SectionDivider />
        
        <LocationItem
          title="Drop-Off Location" 
          address={trip.locations.dropoff} 
          onMapPress={() => openMapForAddress(trip.locations.dropoff)}
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

        {actionConfig?.showPickupTooltip && isPickupTooltipVisible && (
          <View className="bg-[#F2F4F7] border border-[#E4E7EC] rounded-xl px-4 py-3 mt-8 mb-3 flex-row items-center">
            <Ionicons name="information-circle-outline" size={18} color="#667185" />
            <Text className="font-inter text-[#667185] text-[13px] ml-2 flex-1">
              Pickup time not reached.
            </Text>
          </View>
        )}

        {actionConfig && (
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={actionConfig.disabled && !actionConfig.showPickupTooltip}
            className={`w-full h-[52px] rounded-xl flex-row items-center justify-center shadow-sm mb-6 ${
              actionConfig.disabled ? 'bg-[#D0D5DD]' : actionConfig.destructive ? 'bg-[#E32636]' : 'bg-[#0673FF]'
            } ${actionConfig.showPickupTooltip && isPickupTooltipVisible ? '' : 'mt-8'}`}
            onPress={actionConfig.disabled ? undefined : actionConfig.onPress}
          >
            <Text className="text-white font-inter font-medium text-base">
              {actionConfig.title}
            </Text>
            {actionConfig.showPickupTooltip && (
              <TouchableOpacity
                className="ml-2"
                onPress={() => setIsPickupTooltipVisible((isVisible) => !isVisible)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="information-circle-outline" size={18} color="#667185" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>

      <CallModal
        visible={isCallModalVisible}
        onClose={() => setIsCallModalVisible(false)}
        phoneNumber={trip.client.phone}
      />

      <ConfirmationModal
        visible={isEndRideConfirmVisible}
        onClose={() => setIsEndRideConfirmVisible(false)}
        onConfirm={() => {
          setIsEndRideConfirmVisible(false);
          router.push(`/post-ride-checklist/step1?tripId=${encodeURIComponent(routeTripId)}`);
        }}
        title="End this ride?"
        message="Are you sure you want to end this ride? This action cannot be undone."
        confirmText="End Ride"
        confirmVariant="danger"
      />

    </SafeAreaView>
  );
}
