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

import { DashboardHeader } from '../../src/components/layout/DashboardHeader';
import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { SearchBar } from '../../src/components/common/SearchBar';
import { DropdownMenu } from '../../src/components/common/SearchBarMenu';
import { DatePickerModal } from '../../src/components/common/DatePicker';
import { PaymentCard } from '../../src/components/common/PaymentCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { SearchNotFound } from '../../src/components/common/SearchNotFound';
import { GROUPED_PAYMENTS_DATA } from '../../src/data/mockData';

type DateFilter = 'Today' | 'Yesterday' | 'Last 7 days' | 'This Month' | null;

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
    normalizedTitle.includes('older')
  );
};

export default function PaymentsScreen() {
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

  // Real-time filtering logic
  const filteredPaymentsData = useMemo(() => {
    const dateFilteredSections = GROUPED_PAYMENTS_DATA.filter((section) => (
      matchesDateFilter(section.section, dateFilter, customDate)
    ));

    if (!searchQuery.trim()) return dateFilteredSections;

    const lowerCaseQuery = searchQuery.toLowerCase();

    return dateFilteredSections.map(section => {
      const matchedPayments = section.data.filter(payment => 
        payment.clientName.toLowerCase().includes(lowerCaseQuery) ||
        payment.tripId.toLowerCase().includes(lowerCaseQuery) ||
        payment.category.toLowerCase().includes(lowerCaseQuery) // Allows searching by "Extra Hours", etc.
      );
      return { ...section, data: matchedPayments };
    }).filter(section => section.data.length > 0); 
  }, [customDate, dateFilter, searchQuery]);

  // Derived state variables
  const isSearching = searchQuery.trim().length > 0;
  const totalFound = filteredPaymentsData.reduce((acc, section) => acc + section.data.length, 0);
  const hasNoPaymentsAtAll = GROUPED_PAYMENTS_DATA.length === 0;
  const hasSearchResults = filteredPaymentsData.length > 0;

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
      <DashboardHeader title="Payment" />

      {/* Search Bar */}
      <SearchBar 
        placeholder="Search by trip ID or Client Name"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onMenuPress={() => setMenuVisible(true)} 
      />

      {/* Dynamic "X Payments Found" text */}
      {isSearching && (
        <View className="px-5 pb-3">
          <Text className="font-inter font-semibold text-[13px] text-[#101928]">
            {totalFound} Payment{totalFound !== 1 ? 's' : ''} Found
          </Text>
        </View>
      )}

      {/* Request Payment Action Button */}
      <View className="px-4 pb-4">
        <TouchableOpacity 
          activeOpacity={0.8}
          className="w-full bg-[#0673FF] h-[52px] rounded-xl flex-row items-center justify-center shadow-sm"
          onPress={() => router.push('/payment/request-payment')}
        >
          <Text className="text-white font-inter font-medium text-base mr-2">
            Request Payment
          </Text>
          <Feather name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area: 3-Way Conditional Render */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} bounces={true}>
        
        {hasNoPaymentsAtAll ? (
          
          <View className="flex-1 justify-center pb-20">
            <EmptyState 
              title="No payments yet"
              description="Your payment history will appear here once trips are completed and invoiced."
              image={require('../../assets/brand/payment-empty.png')}
            />
          </View>

        ) : isSearching && !hasSearchResults ? (
          
          <SearchNotFound searchQuery={searchQuery} />

        ) : (

          filteredPaymentsData.map((section, index) => (
            <View key={index} className="pt-2">
              <Text className="font-inter font-medium text-sm text-[#475367] px-4 mb-3">
                {section.section}
              </Text>
              
              <View className="px-4">
                {section.data.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    category={payment.category}
                    status={payment.status}
                    clientName={payment.clientName}
                    tripId={payment.tripId}
                    date={payment.date}
                    duration={payment.duration}
                    onPress={() => console.log('View payment details:', payment.id)}
                  />
                ))}
              </View>
            </View>
          ))

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
