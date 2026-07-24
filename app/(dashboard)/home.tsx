import React, { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { StatCard } from '../../src/components/common/StatCard';
import { TripCard } from '../../src/components/common/TripCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { NotificationBellButton } from '../../src/components/notifications/NotificationBellButton';
import { getApiErrorMessage } from '../../src/api/errors';
import {
  useDriverTripStatistics,
  useDriverTrips,
} from '../../src/api/hooks/useTrips';
import { useCurrentUser } from '../../src/api/hooks/useUsers';
import { toDriverTripCardModel } from '../../src/utils/driverTrips';
import {
  getUserDisplayName,
  getUserInitials,
} from '../../src/utils/userProfile';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const currentUserQuery = useCurrentUser();
  const driverTripStatisticsQuery = useDriverTripStatistics();
  const driverTripsQuery = useDriverTrips({
    page: 0,
    size: 3,
  });
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const recentTrips = (driverTripsQuery.data?.data.content ?? [])
    .map((trip) => toDriverTripCardModel(trip));
  const tripStatistics = driverTripStatisticsQuery.data?.data;
  const getStatisticValue = (value?: number) => {
    if (driverTripStatisticsQuery.isLoading) {
      return '...';
    }

    if (driverTripStatisticsQuery.isError) {
      return '--';
    }

    return String(value ?? 0);
  };
  const tripsErrorMessage = getApiErrorMessage(driverTripsQuery.error);
  const currentUser = currentUserQuery.data?.data;
  const driverName = currentUserQuery.isLoading
    ? 'Loading...'
    : getUserDisplayName(currentUser);
  const driverInitials = getUserInitials(currentUser);
  const handleTripsRefresh = useCallback(() => {
    void driverTripsQuery.refetch();
  }, [driverTripsQuery]);

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <AppStatusBar style="light" backgroundColor="#1D2739" />
      
      {/* Curved Gradient Header */}
      <LinearGradient
        colors={['#516C9F', '#1D2739']}
        className="px-6 pb-10"
        style={{
          paddingTop: Math.max(insets.top, 20) + 24,
          paddingHorizontal: 24,
          paddingBottom: 60,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      >
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 pr-4">
            <Text className="text-white font-inter text-lg mb-1">
              {greeting},
            </Text>
            <Text className="text-white font-inter font-bold text-3xl mb-2">
              {driverName}
            </Text>
            <Text className="text-[#F7F9FC] font-inter text-base">
              {currentDate}
            </Text>
          </View>

          <View className="flex-row items-center gap-x-3 mt-1">
            <NotificationBellButton className="bg-[#FAFAFA]" />

            <TouchableOpacity
              onPress={() => router.push('/profile')}
              className="w-10 h-10 rounded-full border-2 border-white bg-[#E0EAFF] items-center justify-center"
            >
              <Text className="font-inter font-bold text-[#1E3A5F] text-sm">
                {driverInitials}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Row */}
      <View className="px-6 -mt-14 flex-row gap-x-3 mb-6">
        <StatCard
          title="Assigned Trips"
          value={getStatisticValue(tripStatistics?.assignedTrips)}
          bgColorClass="bg-white"
          icon={<Ionicons name="car-outline" size={20} color="#475367" />}
        />
        <StatCard
          title="Upcoming Trips"
          value={getStatisticValue(tripStatistics?.upcomingTrips)}
          bgColorClass="bg-[#FFEDC6]"
          icon={<Ionicons name="calendar-outline" size={20} color="#475367" />}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={driverTripsQuery.isRefetching}
            onRefresh={handleTripsRefresh}
            tintColor="#1D2739"
          />
        }
      >

        {/* Conditional Rendering: Populated Trips List or Empty State */}
        {driverTripsQuery.isLoading ? (
          <View className="flex-1 pb-10">
            <EmptyState
              title="Loading trips"
              description="Fetching your assigned trips."
            />
          </View>
        ) : driverTripsQuery.isError ? (
          <View className="flex-1 pb-10">
            <EmptyState
              title="Unable to load trips"
              description={tripsErrorMessage ?? "Please check your connection and try again."}
            />
          </View>
        ) : recentTrips.length > 0 ? (
          <View className="px-6">
            {recentTrips.map((trip) => (
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
        ) : (
          <View className="flex-1 pb-10">
            <EmptyState 
              title="No trips scheduled"
              description="You don't have any upcoming trips. New assignments will appear here once assigned."
            />
          </View>
        )}

      </ScrollView>
    </View>
  );
}
