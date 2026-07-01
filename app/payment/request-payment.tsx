// app/(dashboard)/request-payment.tsx
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { SearchBar } from '../../src/components/common/SearchBar';
import { DropdownMenu } from '../../src/components/common/SearchBarMenu';
import { DatePickerModal } from '../../src/components/common/DatePicker';
import { TripCard } from '../../src/components/common/TripCard';
import { GROUPED_TRIPS_DATA } from '../../src/data/mockData';

type TripSection = (typeof GROUPED_TRIPS_DATA)[number];
type Trip = TripSection['data'][number];
type DateFilter = 'Today' | 'Yesterday' | 'Last 7 days' | 'This Month' | null;

const isCompletedTrip = (trip: Trip) => (
  trip.badges.some((badge) => {
    const label = badge.label.toUpperCase();
    return label === 'COMPLETE' || label === 'COMPLETED';
  })
);

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

  return (
    trip.clientName.toLowerCase().includes(normalizedQuery) ||
    trip.tripId.toLowerCase().includes(normalizedQuery)
  );
};

export default function RequestPaymentScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>(null);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const dropdownOptions = [
    'All',
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
          data: section.data.filter((trip) => (
            isCompletedTrip(trip) && matchesSearch(trip, searchQuery)
          )),
        };
      })
      .filter((section) => section.data.length > 0);
  }, [customDate, dateFilter, searchQuery]);

  const filteredCompletedTrips = visibleSections.flatMap((section) => section.data);

  const handleDropdownSelect = (option: string) => {
    setMenuVisible(false);

    if (option === 'Custom Date') {
      setTimeout(() => setDatePickerVisible(true), 150);
      return;
    }

    if (option === 'All') {
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
      
      {/* Simple Header with Back Button */}
      <View className="px-4 pt-2 pb-4">
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

      {/* Search Bar */}
      <SearchBar 
        placeholder="Search by trip ID or Client Name"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onMenuPress={() => setMenuVisible(true)} 
      />

      {/* Subheading */}
      <View className="px-6 pt-4 pb-4">
        <Text className="font-inter font-semibold text-[13px] text-[#475367] uppercase tracking-wider leading-5">
          Choose a completed trip to request payment
        </Text>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24, paddingHorizontal: 24 }} bounces={true}>
        {visibleSections.length > 0 ? (
          visibleSections.map((section) => (
            <View key={section.title}>
              <Text className="font-inter text-sm text-[#475367] mb-3">
                {section.title}
              </Text>

              {section.data.map((trip) => (
                <TripCard
                  key={trip.id}
                  badges={trip.badges}
                  clientName={trip.clientName}
                  location={trip.location}
                  vehicle={trip.vehicle}
                  timeRange={trip.timeRange}
                  tripId={trip.tripId}
                  onPress={() => {
                    router.push({
                      pathname: '/payment/request-type',
                      params: { tripId: trip.id },
                    });
                  }}
                />
              ))}
            </View>
          ))
        ) : (
          <View className="mt-10 items-center px-4">
             <Text className="text-center text-[#475367] font-inter text-base">
              No completed trips match your search.
            </Text>
          </View>
        )}
      </ScrollView>

      <DropdownMenu
        visible={isMenuVisible}
        options={dropdownOptions}
        onSelect={handleDropdownSelect}
        onClose={() => setMenuVisible(false)}
        top={insets.top + 104}
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
