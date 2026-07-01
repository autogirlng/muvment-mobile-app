// app/(dashboard)/trips.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
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
import { GROUPED_TRIPS_DATA } from '../../src/data/mockData';

const DASHBOARD_TAB_BAR_HEIGHT = 85;

type TripSection = (typeof GROUPED_TRIPS_DATA)[number];
type Trip = TripSection['data'][number];
type TripFilter = 'All' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
type DateFilter = 'Today' | 'Yesterday' | 'Last 7 days' | 'This Month' | null;

const getTripStatus = (trip: Trip): TripFilter => {
  const labels = trip.badges.map((badge) => badge.label.toUpperCase());

  if (labels.includes('ONGOING')) return 'Ongoing';
  if (labels.includes('COMPLETE') || labels.includes('COMPLETED')) return 'Completed';
  if (labels.includes('CANCELLED')) return 'Cancelled';

  return 'Upcoming';
};

const matchesDateFilter = (sectionTitle: string, dateFilter: DateFilter, customDate: Date | null) => {
  const normalizedTitle = sectionTitle.toLowerCase();

  if (customDate) {
    const selectedDay = customDate.getDate();
    const selectedMonth = new Intl.DateTimeFormat('en-US', { month: 'short' })
      .format(customDate)
      .toLowerCase();

    return normalizedTitle.includes(String(selectedDay)) && normalizedTitle.includes(selectedMonth);
  }

  if (!dateFilter || dateFilter === 'This Month') return true;
  if (dateFilter === 'Today') return normalizedTitle.includes('today');
  if (dateFilter === 'Yesterday') return normalizedTitle.includes('yesterday');

  return (
    normalizedTitle.includes('today') ||
    normalizedTitle.includes('yesterday') ||
    normalizedTitle.includes('tomorrow') ||
    normalizedTitle.includes('last week')
  );
};

const matchesSearch = (trip: Trip, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return true;

  const searchableText = [
    trip.clientName,
    trip.location,
    trip.vehicle,
    trip.timeRange,
    trip.tripId,
    ...trip.badges.map((badge) => badge.label),
  ].join(' ').toLowerCase();

  return searchableText.includes(normalizedQuery);
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

  const upcomingCount = useMemo(
    () => GROUPED_TRIPS_DATA.reduce((count, section) => (
      count + section.data.filter((trip) => getTripStatus(trip) === 'Upcoming').length
    ), 0),
    []
  );

  const filterTabs: { label: string; value: TripFilter }[] = [
    { label: 'All', value: 'All' },
    { label: `Upcoming (${upcomingCount})`, value: 'Upcoming' },
    { label: 'Ongoing', value: 'Ongoing' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  const dropdownOptions = [
    'All',
    'Ongoing',
    'Completed',
    'Cancelled',
    'Today',
    'Yesterday',
    'Last 7 days',
    'This Month',
    'Custom Date',
  ];

  const visibleSections = useMemo(() => {
    return GROUPED_TRIPS_DATA
      .map((section) => {
        if (!matchesDateFilter(section.title, dateFilter, customDate)) {
          return { ...section, data: [] };
        }

        return {
          ...section,
          data: section.data.filter((trip) => {
            const matchesTab = activeTab === 'All' || getTripStatus(trip) === activeTab;
            return matchesTab && matchesSearch(trip, searchQuery);
          }),
        };
      })
      .filter((section) => section.data.length > 0);
  }, [activeTab, customDate, dateFilter, searchQuery]);

  // Derived state for dynamic search labels
  const isSearching = searchQuery.trim().length > 0;
  const totalFound = useMemo(() => {
    return visibleSections.reduce((acc, section) => acc + section.data.length, 0);
  }, [visibleSections]);

  const handleDropdownSelect = (option: string) => {
    setMenuVisible(false);

    if (option === 'Custom Date') {
      setTimeout(() => setDatePickerVisible(true), 150);
      return;
    }

    if (['All', 'Ongoing', 'Completed', 'Cancelled'].includes(option)) {
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
      {isSearching && (
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

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: listBottomPadding }} bounces={true}>
        {visibleSections.length > 0 ? (
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
