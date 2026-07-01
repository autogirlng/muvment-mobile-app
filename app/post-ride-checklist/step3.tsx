import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { CustomBack } from '../../src/components/common/CustomBack';
import { PhotoUploadCard } from '../../src/components/common/PhotoUploadCard';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { MOCK_POST_RIDE_CHECKLIST } from '../../src/data/mockData';

const DUMMY_INTERIOR_IMG = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800';

type RequiredInteriorPhotoId = 'dashboard' | 'driverSide' | 'passengerSide' | 'rearSeats' | 'boot';

const initialInteriorPhotos: Record<RequiredInteriorPhotoId, string | null> = {
  dashboard: null,
  driverSide: null,
  passengerSide: null,
  rearSeats: null,
  boot: null,
};

export default function PostRideChecklistStep3Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId ?? '1';
  const [photos, setPhotos] = useState(initialInteriorPhotos);
  const [odometer, setOdometer] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');
  const photoRequirements = MOCK_POST_RIDE_CHECKLIST.interiorPhotos.required;
  const [dashboardRequirement, ...interiorRequirements] = photoRequirements;
  const extractedValues = MOCK_POST_RIDE_CHECKLIST.interiorPhotos.extractedValues;

  const handleDashboardPick = () => {
    setPhotos((currentPhotos) => ({
      ...currentPhotos,
      dashboard: DUMMY_INTERIOR_IMG,
    }));

    setTimeout(() => {
      setOdometer(extractedValues.odometer);
      setFuelLevel(extractedValues.fuelLevel);
      Toast.show({
        type: 'successToast',
        text1: 'Data Extracted',
        text2: 'Odometer and fuel levels captured successfully.',
        position: 'top',
      });
    }, 800);
  };

  const handleImagePick = (field: RequiredInteriorPhotoId) => {
    setPhotos((currentPhotos) => ({
      ...currentPhotos,
      [field]: DUMMY_INTERIOR_IMG,
    }));
  };

  const handleRemovePhoto = (field: RequiredInteriorPhotoId) => {
    setPhotos((currentPhotos) => ({
      ...currentPhotos,
      [field]: null,
    }));

    if (field === 'dashboard') {
      setOdometer('');
      setFuelLevel('');
    }
  };

  const isNextEnabled =
    photoRequirements.every((photo) => Boolean(photos[photo.id as RequiredInteriorPhotoId])) &&
    odometer.trim().length > 0 &&
    fuelLevel.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }} bounces={true}>
        <View className="px-5">
          <StepIndicator currentStep={3} totalSteps={4} />

          <Text className="font-inter font-bold text-[16px] text-[#101928] uppercase tracking-wide mb-4">
            Interior Photos
          </Text>
        </View>

        <View className="bg-[#E32636] px-5 py-3 mb-6 w-full">
          <Text className="text-white font-inter font-medium text-[13px] leading-5">
            Start with the dashboard photo - we'll automatically extract the odometer and fuel readings.
          </Text>
        </View>

        <View className="px-5">
          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
            Required Photos
          </Text>

          <PhotoUploadCard
            title={dashboardRequirement.title}
            subtitle={dashboardRequirement.subtitle}
            imageUri={photos.dashboard}
            onPress={handleDashboardPick}
            onRemove={() => handleRemovePhoto('dashboard')}
          />

          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mt-2 mb-4">
            Auto-Extracted Values
          </Text>

          <View className="flex-row justify-between mb-6 gap-3">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Feather name="clock" size={14} color="#101928" />
                <Text className="ml-1.5 font-inter font-medium text-[13px] text-[#101928]">
                  Odometer (km)
                </Text>
              </View>
              <TextInput
                className="h-[56px] border border-[#E4E7EC] rounded-xl px-4 font-inter text-[15px] text-[#101928] bg-white"
                value={odometer}
                onChangeText={setOdometer}
                placeholder="0"
                placeholderTextColor="#98A2B3"
                keyboardType="numeric"
              />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="gas-station" size={15} color="#101928" />
                <Text className="ml-1.5 font-inter font-medium text-[13px] text-[#101928]">
                  Fuel Level (%)
                </Text>
              </View>
              <TextInput
                className="h-[56px] border border-[#E4E7EC] rounded-xl px-4 font-inter text-[15px] text-[#101928] bg-white"
                value={fuelLevel}
                onChangeText={setFuelLevel}
                placeholder="0%"
                placeholderTextColor="#98A2B3"
                keyboardType="default"
              />
            </View>
          </View>

          {interiorRequirements.map((photo) => {
            const photoId = photo.id as RequiredInteriorPhotoId;

            return (
              <PhotoUploadCard
                key={photo.id}
                title={photo.title}
                subtitle={photo.subtitle}
                imageUri={photos[photoId]}
                onPress={() => handleImagePick(photoId)}
                onRemove={() => handleRemovePhoto(photoId)}
              />
            );
          })}
        </View>
      </ScrollView>

      <ChecklistFooter
        title="Next"
        activeOpacity={0.8}
        disabled={!isNextEnabled}
        onPress={() => router.push(`/post-ride-checklist/step4?tripId=${encodeURIComponent(activeTripId)}`)}
      />
    </SafeAreaView>
  );
}
