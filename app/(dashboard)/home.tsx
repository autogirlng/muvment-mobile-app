import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';

import { StatCard } from '../../src/components/common/StatCard';
import { TripCard } from '../../src/components/common/TripCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { AppStatusBar } from '../../src/components/common/AppStatusBar';

// Import the flat data array from your central mock data file
import { FLAT_TRIPS_DATA } from '../../src/data/mockData';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  // Grab only the first 3 trips for the Home dashboard preview
  const recentTrips = FLAT_TRIPS_DATA.slice(0, 3);

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <AppStatusBar style="light" backgroundColor="#1D2739" />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }} bounces={false}>
        
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
                Nobert Adebayo
              </Text>
              <Text className="text-[#F7F9FC] font-inter text-base">
                {currentDate}
              </Text>
            </View>

            <View className="flex-row items-center gap-x-3 mt-1">
              <TouchableOpacity 
                onPress={() => router.push('/Notification')}
                className="w-10 h-10 rounded-full items-center justify-center relative bg-[#FAFAFA] border border-[#D0D5DD]">
                <Feather name="bell" size={20} color="#1E3A5F" />
                <View className="absolute top-0 right-0 w-3 h-3 bg-[#0673FF] rounded-full" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push('/profile')}
                className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
              >
                <Image 
                  source={{ uri: 'https://i.pravatar.cc/150?img=47' }} 
                  className="w-full h-full"
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View className="px-6 -mt-14 flex-row gap-x-3 mb-6">
          <StatCard 
            title="Assigned Trips" 
            value={FLAT_TRIPS_DATA.length.toString()} // Dynamically tied to data length
            bgColorClass="bg-white"
            icon={<Ionicons name="car-outline" size={20} color="#475367" />}
          />
          <StatCard 
            title="Pending Requests" 
            value="2" 
            bgColorClass="bg-[#FFEDC6]"
            icon={<Ionicons name="card-outline" size={20} color="#475367" />}
          />
        </View>

        {/* Conditional Rendering: Populated Trips List or Empty State */}
        {recentTrips.length > 0 ? (
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
