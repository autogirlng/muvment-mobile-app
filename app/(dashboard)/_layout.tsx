import React from 'react';
import { Tabs } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function DashboardLayout() {
  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',   // brand-tab-active
        tabBarInactiveTintColor: '#9CA3AF', // brand-tab-inactive
        tabBarStyle: { 
          height: 85, 
          paddingBottom: 25, 
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#F2F4F7'
        },
        tabBarLabelStyle: { 
          fontFamily: 'Inter', 
          fontSize: 12, 
          marginTop: 4 
        }
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="trips" 
        options={{ 
          title: 'Trips', 
          tabBarIcon: ({ color }) => <Ionicons name="car-outline" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="payment" 
        options={{ 
          title: 'Payments', 
          tabBarIcon: ({ color }) => <Ionicons name="card-outline" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings', 
          tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}
