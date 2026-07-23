import React, {useCallback, useEffect, useState} from 'react';
import { 
  BackHandler,
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { TimelineTracker } from '../../src/components/common/TimelineTracker';
import { LocationItem } from '../../src/components/common/LocationItem';
import { CallModal } from '../../src/components/common/CallModal';
import { ConfirmationModal } from '../../src/components/common/ConfirmModal';
import { EmptyState } from '../../src/components/common/EmptyState';
import {
  FLAT_TRIPS_DATA,
  MOCK_TRIP_DETAILS,
  MOCK_TRIP_DETAILS_BY_STAGE,
} from '../../src/data/mockData';
import type { TripStageKey } from '../../src/data/mockData';
import { getApiErrorMessage } from '../../src/api/errors';
import { useTransitionDriverTripStatus } from '../../src/api/hooks/usePreRideChecklist';
import { useDriverTrip } from '../../src/api/hooks/useTrips';
import type {
  DriverTripDetails,
  DriverTripLocation,
  DriverTripStatus,
} from '../../src/api/types';
import { openMapForCoordinates } from '../../src/utils/deviceActions';
import {
  getDriverTripBookingBadgeLabel,
  getDriverTripStatusLabel,
  getDriverTripBookingTimerType,
  isUnaccommodatedHourBookingLabel,
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
    case 'EXTRA TIME':
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
    case 'EXTRA TIME':
      return 'ongoing';
    case 'COMPLETE':
      return 'complete';
    default:
      return null;
  }
};

const getStageFromDriverTripStatus = (
  status?: DriverTripStatus | null,
): TripStageKey | null => {
  switch (status) {
    case 'NOT_STARTED':
      return 'notStarted';
    case 'CHECKED_IN':
      return 'checkedIn';
    case 'AWAITING_PICKUP':
      return 'awaitingPickup';
    case 'RUNNING_LATE':
      return 'runningLate';
    case 'ONGOING':
    case 'EXTRA_TIME':
      return 'ongoing';
    case 'COMPLETE':
      return 'complete';
    case 'CANCELLED':
    default:
      return null;
  }
};

type RideTimerType = DriverTripBookingTimerType;
type RideTimerConfig = ReturnType<typeof getRideTimerConfig>;

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
    case 'EXTRA TIME':
      return { banner: 'bg-[#0A8F2A]', badge: 'bg-[#12B76A]' };
    case 'COMPLETE':
      return { banner: 'bg-[#667185]', badge: 'bg-[#667185]' };
    case 'CANCELLED':
      return { banner: 'bg-[#DC2626]', badge: 'bg-[#D92D20]' };
    default:
      return { banner: 'bg-[#DC2626]', badge: 'bg-[#EAB308]' };
  }
};

const getBookingRentalBadgeStyle = (label: string) => {
  if (isUnaccommodatedHourBookingLabel(label)) {
    return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' };
  }

  switch (label.toUpperCase()) {
    case 'AIRPORT':
      return { bg: 'bg-[#CFFAFE]', text: 'text-[#0891B2]' };
    case 'STANDARD':
      return { bg: 'bg-[#E0EAFF]', text: 'text-[#3538CD]' };
    case 'FULL DAY RENTAL':
      return { bg: 'bg-[#F4EBFF]', text: 'text-[#6941C6]' };
    default:
      return { bg: 'bg-[#F4F3FF]', text: 'text-[#5925DC]' };
  }
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

const compact = (value?: string | null) => value?.trim() || undefined;

const parseApiDate = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const formatDateLabel = (value?: string | null) => {
  const date = parseApiDate(value);

  return date ? dateFormatter.format(date) : undefined;
};

const formatScheduleLabel = (startValue?: string | null, endValue?: string | null) => {
  const startDate = parseApiDate(startValue);
  const endDate = parseApiDate(endValue);

  if (!startDate || !endDate) {
    return undefined;
  }

  return `${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`;
};

const formatDurationLabel = (duration?: number | null) => {
  if (duration === undefined || duration === null) {
    return undefined;
  }

  return `${duration} hr${duration === 1 ? '' : 's'}`;
};

const getPositiveSecondsBetween = (startDate?: Date, endDate?: Date) => {
  if (!startDate || !endDate) {
    return undefined;
  }

  const seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

  return seconds > 0 ? seconds : undefined;
};

const getTripDurationSeconds = (duration?: number | null) => {
  if (duration === undefined || duration === null || !Number.isFinite(duration) || duration <= 0) {
    return undefined;
  }

  return Math.round(duration * 60 * 60);
};

const getRideTimerFromTripDetails = ({
  bookingTypeName,
  endDateTime,
  fallbackConfig,
  fallbackRemainingSeconds,
  nowMs,
  startDateTime,
  tripDuration,
}: {
  bookingTypeName?: string | null;
  endDateTime?: string | null;
  fallbackConfig: RideTimerConfig;
  fallbackRemainingSeconds?: number;
  nowMs: number;
  startDateTime?: string | null;
  tripDuration?: number | null;
}) => {
  const startDate = parseApiDate(startDateTime);
  const endDate = parseApiDate(endDateTime);
  const totalSeconds =
    getPositiveSecondsBetween(startDate, endDate) ??
    getTripDurationSeconds(tripDuration) ??
    fallbackConfig.totalSeconds;
  const secondsUntilEnd = endDate
    ? Math.max(0, Math.floor((endDate.getTime() - nowMs) / 1000))
    : undefined;
  const remainingSeconds = Math.min(
    totalSeconds,
    secondsUntilEnd ?? fallbackRemainingSeconds ?? fallbackConfig.defaultRemainingSeconds,
  );

  return {
    label: compact(bookingTypeName) ?? fallbackConfig.label,
    remainingSeconds,
    totalSeconds,
  };
};

const getLocationAddress = (location?: DriverTripLocation | null) =>
  compact(location?.location);

const getTripItinerary = (tripDetails?: DriverTripDetails) => {
  const pickupAddress = getLocationAddress(tripDetails?.pickupLocation);
  const dropOffAddress = getLocationAddress(tripDetails?.dropOffLocation);
  const itinerary = [
    pickupAddress ? `Pickup at ${pickupAddress}` : undefined,
    dropOffAddress ? `Drop off at ${dropOffAddress}` : undefined,
  ].filter((item): item is string => Boolean(item));

  return itinerary.length > 0 ? itinerary : undefined;
};

export default function TripDetailScreen() {
  const { id, stage, rideType, remainingSeconds } = useLocalSearchParams<{
    id?: string;
    stage?: string;
    rideType?: string;
    remainingSeconds?: string;
  }>();
  const tripId = getStringParam(id);
  const driverTripQuery = useDriverTrip(tripId);
  const transitionDriverTripStatus = useTransitionDriverTripStatus();
  const driverTripDetails = driverTripQuery.data?.data;
  const selectedTrip = FLAT_TRIPS_DATA.find((trip) => trip.id === tripId);
  const backendTripStatus = driverTripDetails?.driverTripStatus;
  const fallbackStatus = selectedTrip ? getStatusFromBadges(selectedTrip.badges) : MOCK_TRIP_DETAILS.status;
  const fallbackStage = getStageFromParam(stage) ?? getStageFromStatus(fallbackStatus);
  const selectedStage = backendTripStatus
    ? getStageFromDriverTripStatus(backendTripStatus)
    : fallbackStage;
  const stagedTripDetails = selectedStage ? MOCK_TRIP_DETAILS_BY_STAGE[selectedStage] : MOCK_TRIP_DETAILS;
  const selectedStatus = backendTripStatus
    ? getDriverTripStatusLabel(backendTripStatus)
    : selectedStage
      ? stagedTripDetails.status
      : fallbackStatus;
  const pickupAddress = getLocationAddress(driverTripDetails?.pickupLocation);
  const dropOffAddress = getLocationAddress(driverTripDetails?.dropOffLocation);
  const bookingTypeName = getDriverTripBookingBadgeLabel(driverTripDetails?.bookingTypeName);
  const trip = {
    ...stagedTripDetails,
    id: compact(driverTripDetails?.tripCustomId) ??
      driverTripDetails?.id ??
      selectedTrip?.tripId ??
      stagedTripDetails.id,
    status: selectedStatus,
    bannerMessage: selectedStage ? stagedTripDetails.bannerMessage : getBannerMessage(selectedStatus),
    client: {
      ...stagedTripDetails.client,
      name: compact(driverTripDetails?.customerName) ??
        selectedTrip?.clientName ??
        stagedTripDetails.client.name,
      phone: compact(driverTripDetails?.customerPhoneNumber) ??
        stagedTripDetails.client.phone,
    },
    locations: {
      ...stagedTripDetails.locations,
      pickup: pickupAddress ??
        selectedTrip?.location ??
        stagedTripDetails.locations.pickup,
      dropoff: dropOffAddress ?? stagedTripDetails.locations.dropoff,
    },
    vehicle: {
      ...stagedTripDetails.vehicle,
      model: compact(driverTripDetails?.vehicleName) ??
        selectedTrip?.vehicle.split('•')[0]?.trim() ??
        stagedTripDetails.vehicle.model,
      plate: compact(driverTripDetails?.vehicleIdentifier) ??
        selectedTrip?.vehicle.split('•')[1]?.trim() ??
        stagedTripDetails.vehicle.plate,
    },
    booking: {
      ...stagedTripDetails.booking,
      type: compact(driverTripDetails?.driverOwnerType) ??
        stagedTripDetails.booking.type,
      rentalType: bookingTypeName ?? stagedTripDetails.booking.rentalType,
      date: formatDateLabel(driverTripDetails?.startDateTime) ??
        stagedTripDetails.booking.date,
      duration: formatDurationLabel(driverTripDetails?.tripDuration) ??
        stagedTripDetails.booking.duration,
      schedule: formatScheduleLabel(
        driverTripDetails?.startDateTime,
        driverTripDetails?.endDateTime,
      ) ?? stagedTripDetails.booking.schedule,
    },
    itinerary: getTripItinerary(driverTripDetails) ?? stagedTripDetails.itinerary,
  };
  const statusStyle = getStatusStyle(trip.status);
  const rentalTypeStyle = getBookingRentalBadgeStyle(trip.booking.rentalType);
  const routeTripId = tripId?.trim() ?? '';
  const timerType = getRideTimerType(rideType, trip.booking.rentalType);
  const timerConfig = getRideTimerConfig(timerType);
  const parsedRemainingSeconds = Number(getStringParam(remainingSeconds));
  const routeRemainingSeconds = Number.isFinite(parsedRemainingSeconds) && parsedRemainingSeconds >= 0
    ? parsedRemainingSeconds
    : undefined;
  const isRideTimerVisible = trip.status === 'ONGOING' || trip.status === 'EXTRA TIME';

  const [timerNowMs, setTimerNowMs] = useState(() => Date.now());
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  const [isPickupTooltipVisible, setIsPickupTooltipVisible] = useState(false);
  const [isEndRideConfirmVisible, setIsEndRideConfirmVisible] = useState(false);
  const rideTimer = getRideTimerFromTripDetails({
    bookingTypeName: driverTripDetails?.bookingTypeName,
    endDateTime: driverTripDetails?.endDateTime,
    fallbackConfig: timerConfig,
    fallbackRemainingSeconds: routeRemainingSeconds,
    nowMs: timerNowMs,
    startDateTime: driverTripDetails?.startDateTime,
    tripDuration: driverTripDetails?.tripDuration,
  });
  const tripDetailsErrorMessage = getApiErrorMessage(driverTripQuery.error);
  const navigateToTrips = useCallback(() => {
    router.replace('/trips');
  }, []);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          navigateToTrips();
          return true;
        },
      );

      return () => subscription.remove();
    }, [navigateToTrips]),
  );

  useEffect(() => {
    if (!isRideTimerVisible) {
      return undefined;
    }

    setTimerNowMs(Date.now());
    const intervalId = setInterval(() => {
      setTimerNowMs(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRideTimerVisible]);

  const handleStatusTransition = async ({
    nextStage,
    nextStatus,
  }: {
    nextStage: string;
    nextStatus: 'AWAITING_PICKUP' | 'ONGOING';
  }) => {
    if (!routeTripId) {
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
        driverTripStatus: nextStatus,
        tripId: routeTripId,
      });

      router.replace(`/trip/${encodeURIComponent(routeTripId)}?stage=${nextStage}`);
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Status update failed',
        text2: getApiErrorMessage(error) ?? 'Please try again.',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const SectionDivider = () => <View className="h-[1px] bg-[#E4E7EC] w-full my-3" />;

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="font-inter font-semibold text-[13px] text-[#1F2937] tracking-wider uppercase mb-4">
      {title}
    </Text>
  );

  const renderBackHeader = () => (
    <View className="px-4 pt-2 pb-4 z-10">
      <TouchableOpacity
        onPress={navigateToTrips}
        className="flex-row items-center ml-[-8px]"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="chevron-left" size={24} color="#101928" />
        <Text className="text-[#101928] font-inter text-base ml-1">
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getActionConfig = () => {
    switch (trip.status) {
      case 'CHECKED IN':
        return {
          title: transitionDriverTripStatus.isPending ? 'Updating...' : 'Proceed to Pickup',
          disabled: transitionDriverTripStatus.isPending,
          showPickupTooltip: false,
          destructive: false,
          onPress: () => {
            void handleStatusTransition({
              nextStage: 'awaiting-pickup',
              nextStatus: 'AWAITING_PICKUP',
            });
          },
        };
      case 'AWAITING PICKUP':
        return {
          title: transitionDriverTripStatus.isPending ? 'Updating...' : 'Start Ride',
          disabled: transitionDriverTripStatus.isPending,
          showPickupTooltip: false,
          destructive: false,
          onPress: () => {
            void handleStatusTransition({
              nextStage: 'ongoing',
              nextStatus: 'ONGOING',
            });
          },
        };
      case 'RUNNING LATE':
        return {
          title: transitionDriverTripStatus.isPending ? 'Updating...' : 'Start Ride',
          disabled: transitionDriverTripStatus.isPending,
          showPickupTooltip: false,
          destructive: false,
          onPress: () => {
            void handleStatusTransition({
              nextStage: 'ongoing',
              nextStatus: 'ONGOING',
            });
          },
        };
      case 'ONGOING':
      case 'EXTRA TIME':
        return {
          title: 'End Ride',
          disabled: false,
          showPickupTooltip: false,
          destructive: true,
          onPress: () => setIsEndRideConfirmVisible(true),
        };
      case 'COMPLETE':
      case 'CANCELLED':
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

  if (!tripId) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]">
        <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
        {renderBackHeader()}
        <EmptyState
          title="Trip unavailable"
          description="Missing trip ID. Please go back and select a trip again."
        />
      </SafeAreaView>
    );
  }

  if (driverTripQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]">
        <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
        {renderBackHeader()}
        <EmptyState
          title="Loading trip"
          description="Fetching trip details."
        />
      </SafeAreaView>
    );
  }

  if (driverTripQuery.isError || !driverTripDetails) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]">
        <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
        {renderBackHeader()}
        <EmptyState
          title="Unable to load trip"
          description={tripDetailsErrorMessage ?? "Please check your connection and try again."}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      {renderBackHeader()}

      {trip.status !== 'COMPLETE' && (
        <View className={`${statusStyle.banner} px-4 py-3 w-full`}>
          <Text className="text-white font-inter font-medium text-center text-[14px]">
            {trip.bannerMessage}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} bounces={true}>
        {isRideTimerVisible && (
          <View className="items-center mb-6">
            <TimerRing
              remainingSeconds={rideTimer.remainingSeconds}
              totalSeconds={rideTimer.totalSeconds}
            />
            <Text className="font-inter text-[#667185] text-[13px] mt-4 mb-1">
              Time remaining
            </Text>
            <Text className="font-inter font-bold text-[#1D2739] text-[17px]">
              {rideTimer.label}
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
          onMapPress={() => openMapForCoordinates({
            address: trip.locations.pickup,
            lat: driverTripDetails.pickupLocation?.lat,
            lng: driverTripDetails.pickupLocation?.lng,
          })}
        />

        <SectionDivider />
        
        <LocationItem
          title="Drop-Off Location" 
          address={trip.locations.dropoff} 
          onMapPress={() => openMapForCoordinates({
            address: trip.locations.dropoff,
            lat: driverTripDetails.dropOffLocation?.lat,
            lng: driverTripDetails.dropOffLocation?.lng,
          })}
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
          <View className={`${rentalTypeStyle.bg} px-2.5 py-1 rounded-full ml-2`}>
            <Text className={`${rentalTypeStyle.text} font-inter font-semibold text-[10px] tracking-wide uppercase`}>
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
