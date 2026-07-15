// app/(dashboard)/trips.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { DashboardHeader } from '../../src/components/layout/DashboardHeader';
import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { SearchBar } from '../../src/components/common/SearchBar';
import { EmptyState } from '../../src/components/common/EmptyState';
import { SearchNotFound } from '../../src/components/common/SearchNotFound';
import { TripCard } from '../../src/components/common/TripCard';
import { DropdownMenu } from '../../src/components/common/SearchBarMenu';
import { DatePickerModal } from '../../src/components/common/DatePicker';
import { getApiErrorMessage } from '../../src/api/errors';
import { useDriverTrips } from '../../src/api/hooks/useTrips';
import type {
  DriverTrip,
  DriverTripStatus,
} from '../../src/api/types';
import {
  formatApiDate,
  getDriverTripStatus,
  groupDriverTripsForCards,
  isDriverTripActive,
  isDriverTripUpcoming,
} from '../../src/utils/driverTrips';

const DASHBOARD_TAB_BAR_HEIGHT = 85;
const TRIPS_PAGE_SIZE = 50;

type TripFilter = 'All' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
type DateFilter = 'Today' | 'Yesterday' | 'Last 7 days' | 'This Month' | null;

const TRIP_STATUS_BY_TAB: Partial<Record<TripFilter, DriverTripStatus>> = {
  Cancelled: 'CANCELLED',
  Completed: 'COMPLETE',
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getDateRangeParams = (dateFilter: DateFilter, customDate: Date | null) => {
  if (customDate) {
    const selectedDate = formatApiDate(customDate);

    return {
      endDate: selectedDate,
      startDate: selectedDate,
    };
  }

  if (!dateFilter) {
    return {};
  }

  const today = new Date();

  if (dateFilter === 'Today') {
    const selectedDate = formatApiDate(today);

    return {
      endDate: selectedDate,
      startDate: selectedDate,
    };
  }

  if (dateFilter === 'Yesterday') {
    const selectedDate = formatApiDate(addDays(today, -1));

    return {
      endDate: selectedDate,
      startDate: selectedDate,
    };
  }

  if (dateFilter === 'Last 7 days') {
    return {
      endDate: formatApiDate(today),
      startDate: formatApiDate(addDays(today, -6)),
    };
  }

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    endDate: formatApiDate(lastDayOfMonth),
    startDate: formatApiDate(firstDayOfMonth),
  };
};

const matchesActiveTab = (trip: DriverTrip, activeTab: TripFilter) => {
  const tripStatus = getDriverTripStatus(trip);

  if (activeTab === 'All') {
    return true;
  }

  if (activeTab === 'Upcoming') {
    return isDriverTripUpcoming(trip);
  }

  if (activeTab === 'Ongoing') {
    return isDriverTripActive(trip);
  }

  const expectedStatus = TRIP_STATUS_BY_TAB[activeTab];

  return !tripStatus || tripStatus === expectedStatus;
};

const getCountedTabLabel = (
  label: TripFilter,
  count: number | undefined,
  isLoading: boolean,
) => {
  if (isLoading && count === undefined) {
    return label;
  }

  return `${label} (${count ?? 0})`;
};

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const listBottomPadding = DASHBOARD_TAB_BAR_HEIGHT + Math.max(insets.bottom, 16) + 24;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TripFilter>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>(null);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const selectedTripStatus = TRIP_STATUS_BY_TAB[activeTab];
  const dateRangeParams = useMemo(
    () => getDateRangeParams(dateFilter, customDate),
    [customDate, dateFilter],
  );
  const driverTripsQuery = useDriverTrips({
    page: 0,
    search: searchQuery,
    size: TRIPS_PAGE_SIZE,
    tripStatus: selectedTripStatus,
    ...dateRangeParams,
  });
  const driverTrips = driverTripsQuery.data?.data.content ?? [];
  const tripStatistics = driverTripsQuery.data?.data.statistics;

  const filterTabs: { label: string; value: TripFilter }[] = [
    {
      label: getCountedTabLabel(
        'All',
        tripStatistics?.assignedTrips,
        driverTripsQuery.isLoading,
      ),
      value: 'All',
    },
    {
      label: getCountedTabLabel(
        'Upcoming',
        tripStatistics?.upcomingTrips,
        driverTripsQuery.isLoading,
      ),
      value: 'Upcoming',
    },
    {
      label: getCountedTabLabel(
        'Ongoing',
        tripStatistics?.onGoingTrips,
        driverTripsQuery.isLoading,
      ),
      value: 'Ongoing',
    },
    {
      label: getCountedTabLabel(
        'Completed',
        tripStatistics?.completedTrips,
        driverTripsQuery.isLoading,
      ),
      value: 'Completed',
    },
    {
      label: getCountedTabLabel(
        'Cancelled',
        tripStatistics?.cancelledTrips,
        driverTripsQuery.isLoading,
      ),
      value: 'Cancelled',
    },
  ];

  const dropdownOptions = [
    'All',
    'Upcoming',
    'Ongoing',
    'Completed',
    'Cancelled',
    'Today',
    'Yesterday',
    'Last 7 days',
    'This Month',
    'Custom Date',
  ];

  const visibleTrips = useMemo(() => (
    driverTrips.filter((trip) => matchesActiveTab(trip, activeTab))
  ), [activeTab, driverTrips]);

  const fallbackStatus = selectedTripStatus ?? (
    activeTab === 'Upcoming'
      ? 'NOT_STARTED'
      : activeTab === 'Ongoing'
        ? 'ONGOING'
        : undefined
  );

  const visibleSections = useMemo(() => {
    return groupDriverTripsForCards(visibleTrips, fallbackStatus);
  }, [fallbackStatus, visibleTrips]);

  // Derived state for dynamic search labels
  const isSearching = searchQuery.trim().length > 0;
  const totalFound = useMemo(() => {
    return visibleSections.reduce((acc, section) => acc + section.data.length, 0);
  }, [visibleSections]);
  const isLoadingTrips = driverTripsQuery.isLoading;
  const isTripsError = driverTripsQuery.isError;
  const tripsErrorMessage = getApiErrorMessage(driverTripsQuery.error);

  const handleDropdownSelect = (option: string) => {
    setMenuVisible(false);

    if (option === 'Custom Date') {
      setTimeout(() => setDatePickerVisible(true), 150);
      return;
    }

    if (['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].includes(option)) {
      setActiveTab(option as TripFilter);
      setDateFilter(null);
      setCustomDate(null);
      return;
    }

    setDateFilter(option as DateFilter);
    setCustomDate(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <DashboardHeader title="Trips" />

      <SearchBar
        placeholder="Search by trip ID or Client Name"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onMenuPress={() => setMenuVisible(true)}
      />

      {/* Dynamic "X Trips Found" text that only appears when searching */}
      {isSearching && !isLoadingTrips && !isTripsError && (
        <View className="px-5 pb-3">
          <Text className="font-inter font-semibold text-[13px] text-[#101928]">
            {totalFound} Trip{totalFound !== 1 ? 's' : ''} Found
          </Text>
        </View>
      )}

      <View className="border-t border-b border-[#E4E7EC] py-3 bg-[#E4E7EC]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="flex-row"
        >
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => {
                  setActiveTab(tab.value);
                  setDateFilter(null);
                  setCustomDate(null);
                }}
                className={`mr-4 py-1.5 px-4 rounded-full ${
                  isActive ? 'bg-[#1E3A5F]' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`font-inter text-sm ${
                    isActive ? 'text-white font-medium' : 'text-[#475367] font-medium'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: listBottomPadding }}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={driverTripsQuery.isRefetching && !isLoadingTrips}
            onRefresh={driverTripsQuery.refetch}
            tintColor="#1E3A5F"
          />
        }
      >
        {isLoadingTrips ? (
          <EmptyState
            title="Loading trips"
            description="Fetching your assigned trips."
          />
        ) : isTripsError ? (
          <EmptyState
            title="Unable to load trips"
            description={tripsErrorMessage ?? "Please check your connection and try again."}
          />
        ) : visibleSections.length > 0 ? (
          visibleSections.map((section) => (
            <View key={section.title} className="pt-4">
              <Text className="font-inter text-sm text-[#475367] px-4 mb-3">
                {section.title}
              </Text>

              <View className="px-4">
                {section.data.map((trip) => (
                  <TripCard
                    key={trip.id}
                    badges={trip.badges}
                    clientName={trip.clientName}
                    location={trip.location}
                    vehicle={trip.vehicle}
                    timeRange={trip.timeRange}
                    tripId={trip.tripId}
                    onPress={() => router.push(`/trip/${trip.id}`)}
                  />
                ))}
              </View>
            </View>
          ))
        ) : isSearching ? (
          // Renders specific SearchNotFound when querying yields no results
          <SearchNotFound searchQuery={searchQuery} />
        ) : (
          // Renders the generic EmptyState when filters yield zero data
          <EmptyState
            title="No trips found"
            description="Try another status, date, or search term."
          />
        )}
      </ScrollView>

      <DropdownMenu
        visible={isMenuVisible}
        options={dropdownOptions}
        onSelect={handleDropdownSelect}
        onClose={() => setMenuVisible(false)}
        top={insets.top + 130}
        right={20}
      />

      <DatePickerModal
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSelectDate={(date) => {
          setCustomDate(date);
          setDateFilter(null);
          setDatePickerVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
