// app/checklist/step3.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView,
  TextInput
} from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { CustomBack } from '../../src/components/common/CustomBack';
import { CustomButton } from '../../src/components/common/CustomButton';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { PhotoUploadCard } from '../../src/components/common/PhotoUploadCard';

const DUMMY_INTERIOR_IMG = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800';

export default function ChecklistStep3Screen() {
  // Track all required interior photos
  const [photos, setPhotos] = useState({
    dashboard: null as string | null,
    driverSide: null as string | null,
    passengerSide: null as string | null,
    rearSeats: null as string | null,
    boot: null as string | null,
  });

  // Track the extracted values
  const [odometer, setOdometer] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');

  // Simulate picking the dashboard image and auto-extracting the data
  const handleDashboardPick = () => {
    setPhotos(prev => ({ ...prev, dashboard: DUMMY_INTERIOR_IMG }));
    
    // Simulate a brief API loading delay for the AI extraction
    setTimeout(() => {
      setOdometer('45,287');
      setFuelLevel('30%');
      Toast.show({
        type: 'successToast',
        text1: 'Data Extracted',
        text2: 'Odometer and fuel levels captured successfully.',
        position: 'top',
      });
    }, 800);
  };

  const handleImagePick = (field: keyof typeof photos) => {
    setPhotos(prev => ({ ...prev, [field]: DUMMY_INTERIOR_IMG }));
  };

  const handleRemovePhoto = (field: keyof typeof photos) => {
    setPhotos(prev => ({ ...prev, [field]: null }));
    // If they remove the dashboard photo, clear the auto-extracted values
    if (field === 'dashboard') {
      setOdometer('');
      setFuelLevel('');
    }
  };

  // Next is enabled if all photos are provided and the extracted values exist
  const isNextEnabled = 
    Object.values(photos).every(val => val !== null) && 
    odometer.trim().length > 0 && 
    fuelLevel.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      
      {/* Header with Back Button */}
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} bounces={true}>
        
        <View className="px-5">
          <StepIndicator currentStep={3} totalSteps={6} />
          
          <Text className="font-inter font-bold text-[16px] text-[#101928] uppercase tracking-wide mb-4">
            Interior Photos
          </Text>
        </View>

        {/* Red Instruction Banner */}
        <View className="bg-[#E32636] px-5 py-3 mb-6 w-full">
          <Text className="text-white font-inter font-medium text-[13px] leading-5">
            Start with the dashboard photo - we'll automatically extract the odometer and fuel readings.
          </Text>
        </View>

        <View className="px-5">
          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
            Required Photos
          </Text>

          {/* 1. Dashboard Upload */}
          <PhotoUploadCard
            title="Dashboard"
            subtitle="Must show odometer AND fuel gauge clearly"
            imageUri={photos.dashboard}
            onPress={handleDashboardPick}
            onRemove={() => handleRemovePhoto('dashboard')}
          />

          {/* Auto-Extracted Values Section */}
          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mt-2 mb-4">
            Auto-Extracted Values
          </Text>

          <View className="flex-row justify-between mb-6 space-x-3">
            {/* Odometer Input */}
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Feather name="clock" size={14} color="#101928" />
                <Text className="ml-1.5 font-inter font-medium text-[13px] text-[#101928]">
                  Odometer (km)
                </Text>
              </View>
              <TextInput 
                className="h-[48px] border border-[#E4E7EC] rounded-xl px-4 font-inter text-[15px] text-[#101928] bg-white"
                value={odometer}
                onChangeText={setOdometer}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            {/* Fuel Level Input */}
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="gas-station" size={15} color="#101928" />
                <Text className="ml-1.5 font-inter font-medium text-[13px] text-[#101928]">
                  Fuel Level (%)
                </Text>
              </View>
              <TextInput 
                className="h-[48px] border border-[#E4E7EC] rounded-xl px-4 font-inter text-[15px] text-[#101928] bg-white"
                value={fuelLevel}
                onChangeText={setFuelLevel}
                placeholder="0%"
                keyboardType="default"
              />
            </View>
          </View>

          {/* Remaining Interior Photos */}
          <PhotoUploadCard
            title="Driver Side"
            subtitle="Seat, door panel, floor area"
            imageUri={photos.driverSide}
            onPress={() => handleImagePick('driverSide')}
            onRemove={() => handleRemovePhoto('driverSide')}
          />
          
          <PhotoUploadCard
            title="Passenger Side"
            subtitle="Seat, floor, glove box"
            imageUri={photos.passengerSide}
            onPress={() => handleImagePick('passengerSide')}
            onRemove={() => handleRemovePhoto('passengerSide')}
          />
          
          <PhotoUploadCard
            title="Rear Seats"
            subtitle="Back seat condition, floor"
            imageUri={photos.rearSeats}
            onPress={() => handleImagePick('rearSeats')}
            onRemove={() => handleRemovePhoto('rearSeats')}
          />
          
          <PhotoUploadCard
            title="Boot/Trunk"
            subtitle="Trunk space, spare tire area"
            imageUri={photos.boot}
            onPress={() => handleImagePick('boot')}
            onRemove={() => handleRemovePhoto('boot')}
          />

        </View>
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View className="px-5 pb-8 pt-4 bg-[#F8FAFC]">
        <CustomButton
          title="Next"
          activeOpacity={0.8}
          disabled={!isNextEnabled}
          onPress={() => router.push('/checklist/step4')}
        />
      </View>

    </SafeAreaView>
  );
}
