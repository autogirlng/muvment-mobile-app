// app/checklist/step3.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView,
  TextInput
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { CustomBack } from '../../src/components/common/CustomBack';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { PhotoUploadCard } from '../../src/components/common/PhotoUploadCard';
import { getApiErrorMessage } from '../../src/api/errors';
import { useSubmitInteriorChecklist } from '../../src/api/hooks/usePreRideChecklist';
import type { InteriorUploadImage } from '../../src/api/types';
import {
  createEmptyChecklistPhoto,
  isChecklistPhotoUploaded,
  toChecklistUploadedPhoto,
} from '../../src/utils/checklistPhotos';
import { uploadChecklistPhoto } from '../../src/utils/cloudinaryUpload';
import { capturePhoto } from '../../src/utils/deviceActions';

type InteriorPhotoKey =
  | 'boot'
  | 'dashboard'
  | 'driverSide'
  | 'passengerSide'
  | 'rearSeats';

const interiorImageTypes: Record<InteriorPhotoKey, InteriorUploadImage> = {
  boot: 'BOOT',
  dashboard: 'DASHBOARD',
  driverSide: 'DRIVER_SIDE',
  passengerSide: 'PASSENGER',
  rearSeats: 'REAR_SEATS',
};

const parseNumericInput = (value: string) => {
  const parsedValue = Number(value.replace(/[,%\s]/g, ''));

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

export default function ChecklistStep3Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId ?? '1';
  const submitInteriorChecklist = useSubmitInteriorChecklist();

  // Track all required interior photos
  const [photos, setPhotos] = useState({
    boot: createEmptyChecklistPhoto(),
    dashboard: createEmptyChecklistPhoto(),
    driverSide: createEmptyChecklistPhoto(),
    passengerSide: createEmptyChecklistPhoto(),
    rearSeats: createEmptyChecklistPhoto(),
  });

  // Track the extracted values
  const [odometer, setOdometer] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');

  const handleDashboardPick = async () => {
    await handleImagePick('dashboard');
  };

  const handleImagePick = async (field: InteriorPhotoKey) => {
    if (photos[field].status === 'uploading') {
      return;
    }

    const photoUri = await capturePhoto();

    if (!photoUri) return;

    const uploadType = interiorImageTypes[field];

    setPhotos(prev => ({
      ...prev,
      [field]: {
        localUri: photoUri,
        status: 'uploading',
      },
    }));

    try {
      const uploadResult = await uploadChecklistPhoto(
        photoUri,
        `interior-${uploadType}`,
      );

      setPhotos(prev => ({
        ...prev,
        [field]: {
          ...uploadResult,
          localUri: photoUri,
          status: 'uploaded',
        },
      }));
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? 'Unable to upload this photo.';

      setPhotos(prev => ({
        ...prev,
        [field]: {
          errorMessage: message,
          localUri: photoUri,
          status: 'failed',
        },
      }));

      Toast.show({
        type: 'errorToast',
        text1: 'Upload failed',
        text2: message,
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    if (field === 'dashboard') {
      // Simulate a brief API loading delay for the AI extraction
      setOdometer('45,287');
      setFuelLevel('30');
      Toast.show({
        type: 'successToast',
        text1: 'Data Extracted',
        text2: 'Odometer and fuel levels captured successfully.',
        position: 'top',
      });
    }
  };

  const handleRemovePhoto = (field: InteriorPhotoKey) => {
    setPhotos(prev => ({ ...prev, [field]: createEmptyChecklistPhoto() }));
    // If they remove the dashboard photo, clear the auto-extracted values
    if (field === 'dashboard') {
      setOdometer('');
      setFuelLevel('');
    }
  };

  // Next is enabled if all photos are provided and the extracted values exist
  const photoList = Object.values(photos);
  const odometerKM = parseNumericInput(odometer);
  const fuelLevelInPercentage = parseNumericInput(fuelLevel);
  const hasValidMetadata =
    odometerKM !== undefined &&
    odometerKM >= 0 &&
    fuelLevelInPercentage !== undefined &&
    fuelLevelInPercentage >= 0 &&
    fuelLevelInPercentage <= 100;
  const hasPendingUpload = photoList.some(photo => photo.status === 'uploading');
  const hasFailedUpload = photoList.some(photo => photo.status === 'failed');
  const isNextEnabled = 
    photoList.every(isChecklistPhotoUploaded) &&
    hasValidMetadata &&
    !hasPendingUpload &&
    !hasFailedUpload &&
    !submitInteriorChecklist.isPending;

  const handleNext = async () => {
    if (!isNextEnabled || odometerKM === undefined || fuelLevelInPercentage === undefined) {
      return;
    }

    try {
      await submitInteriorChecklist.mutateAsync({
        payload: {
          metadata: {
            fuelLevelInPercentage,
            odometerKM,
          },
          uploadPhotos: Object.entries(interiorImageTypes).map(([field, interiorUploadImage]) => ({
            ...toChecklistUploadedPhoto(photos[field as InteriorPhotoKey]),
            interiorUploadImage,
          })),
        },
        tripId: activeTripId,
      });

      router.push(`/checklist/step4?tripId=${encodeURIComponent(activeTripId)}`);
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Interior checklist failed',
        text2: getApiErrorMessage(error) ?? 'Please try again.',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <View className="flex-1" style={{ flex: 1 }}>
      
      {/* Header with Back Button */}
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        
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
            imageUri={photos.dashboard.localUri}
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
            imageUri={photos.driverSide.localUri}
            onPress={() => handleImagePick('driverSide')}
            onRemove={() => handleRemovePhoto('driverSide')}
          />
          
          <PhotoUploadCard
            title="Passenger Side"
            subtitle="Seat, floor, glove box"
            imageUri={photos.passengerSide.localUri}
            onPress={() => handleImagePick('passengerSide')}
            onRemove={() => handleRemovePhoto('passengerSide')}
          />
          
          <PhotoUploadCard
            title="Rear Seats"
            subtitle="Back seat condition, floor"
            imageUri={photos.rearSeats.localUri}
            onPress={() => handleImagePick('rearSeats')}
            onRemove={() => handleRemovePhoto('rearSeats')}
          />
          
          <PhotoUploadCard
            title="Boot/Trunk"
            subtitle="Trunk space, spare tire area"
            imageUri={photos.boot.localUri}
            onPress={() => handleImagePick('boot')}
            onRemove={() => handleRemovePhoto('boot')}
          />

        </View>
      </ScrollView>

      <ChecklistFooter
        title={submitInteriorChecklist.isPending ? 'Saving...' : 'Next'}
        activeOpacity={0.8}
        disabled={!isNextEnabled}
        onPress={handleNext}
      />
      </View>

    </SafeAreaView>
  );
}
