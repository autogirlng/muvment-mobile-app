// app/(dashboard)/review-request.tsx
import React from 'react';
import {
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { TripCard } from '../../src/components/common/TripCard';
import { FLAT_TRIPS_DATA, MOCK_SELECTED_TRIP } from '../../src/data/mockData';

type RequestType = 'Extra Hours' | 'Interstate Trip' | 'Off Day';

const getRequestType = (requestType?: string | string[]): RequestType => {
  const value = Array.isArray(requestType) ? requestType[0] : requestType;

  if (value === 'Interstate Trip' || value === 'Off Day') {
    return value;
  }

  return 'Extra Hours';
};

export default function ReviewRequestScreen() {
  const params = useLocalSearchParams<{
    tripId?: string;
    requestType?: string;
    extraHours?: string;
  }>();

  const selectedTrip = FLAT_TRIPS_DATA.find((trip) => trip.id === params.tripId) ?? MOCK_SELECTED_TRIP;
  const requestType = getRequestType(params.requestType);
  const extraHours = Array.isArray(params.extraHours) ? params.extraHours[0] : params.extraHours;
  
  const cleanedExtraHours = extraHours?.trim() || '0';
  const hasHours = requestType === 'Extra Hours';

  const handleSubmit = () => {
    // 1. Fire API request here
    
    // 2. Show Success Toast
    Toast.show({
      type: 'successToast',
      text1: 'Payment Request Submitted',
      position: 'top',
      topOffset: 60,
    });

    // 3. Route to the success screen
    router.replace('/payment/request-success');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <View className="flex-1" style={{ flex: 1 }}>
        <View className="px-4 pt-2 pb-5" style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="flex-row items-center ml-[-8px]"
            style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -8 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="chevron-left" size={24} color="#101928" />
            <Text className="text-[#101928] font-inter text-base ml-1" style={{ color: '#101928', fontSize: 16, marginLeft: 4 }}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-inter font-medium text-md text-[#101928] uppercase mb-4">
            Review your request before submitting
          </Text>

          <View pointerEvents="none">
            <TripCard
              badges={selectedTrip.badges}
              clientName={selectedTrip.clientName}
              location={selectedTrip.location}
              vehicle={selectedTrip.vehicle}
              timeRange={selectedTrip.timeRange}
              tripId={selectedTrip.tripId}
            />
          </View>

          <View className="h-[1px] bg-[#E4E7EC] w-full mt-2 mb-7" />

          <Text className="font-inter font-medium text-sm text-[#101928] uppercase mb-5">
            Request Details
          </Text>

          <View className="space-y-8 border-b border-[#E4E7EC] mb-10">
            <View>
              <Text className="font-inter font-medium text-[#101928] text-[15px] mb-2">
                Type
              </Text>
              <Text className="font-inter text-[#667185] text-[14px]">
                {requestType}
              </Text>
            </View>

            {hasHours && (
              <View>
                <Text className="font-inter font-medium text-[#101928] text-[15px] mb-2">
                  Hours
                </Text>
                <Text className="font-inter text-[#667185] text-[14px]">
                  {cleanedExtraHours} extra hour{cleanedExtraHours === '1' ? '' : 's'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View className="px-6 pb-12 pt-4 bg-[#F8FAFC]">
          <TouchableOpacity 
            activeOpacity={0.8}
            className="w-full bg-[#0673FF] h-[52px] rounded-xl flex-row items-center justify-center shadow-sm"
            onPress={handleSubmit}
          >
            <Text className="text-white font-inter font-medium text-base mr-2">
              Submit Request
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
