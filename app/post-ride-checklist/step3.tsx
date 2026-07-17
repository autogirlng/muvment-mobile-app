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

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { CustomBack } from '../../src/components/common/CustomBack';
import { PhotoUploadCard } from '../../src/components/common/PhotoUploadCard';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { getApiErrorMessage } from '../../src/api/errors';
import { useSubmitInteriorChecklist } from '../../src/api/hooks/usePreRideChecklist';
import type { InteriorUploadImage } from '../../src/api/types';
import { MOCK_POST_RIDE_CHECKLIST } from '../../src/data/mockData';
import {
  createEmptyChecklistPhoto,
  isChecklistPhotoUploaded,
  toChecklistUploadedPhoto,
} from '../../src/utils/checklistPhotos';
import { uploadChecklistPhoto } from '../../src/utils/cloudinaryUpload';
import { capturePhoto } from '../../src/utils/deviceActions';

type RequiredInteriorPhotoId =
  | 'boot'
  | 'dashboard'
  | 'driverSide'
  | 'passengerSide'
  | 'rearSeats';

const interiorImageTypes: Record<RequiredInteriorPhotoId, InteriorUploadImage> = {
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

export default function PostRideChecklistStep3Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId?.trim() ?? '';
  const submitInteriorChecklist = useSubmitInteriorChecklist();
  const [photos, setPhotos] = useState({
    boot: createEmptyChecklistPhoto(),
    dashboard: createEmptyChecklistPhoto(),
    driverSide: createEmptyChecklistPhoto(),
    passengerSide: createEmptyChecklistPhoto(),
    rearSeats: createEmptyChecklistPhoto(),
  });
  const [odometer, setOdometer] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');
  const photoRequirements = MOCK_POST_RIDE_CHECKLIST.interiorPhotos.required;
  const [dashboardRequirement, ...interiorRequirements] = photoRequirements;

  const handleDashboardPick = async () => {
    await handleImagePick('dashboard');
  };

  const handleImagePick = async (field: RequiredInteriorPhotoId) => {
    if (photos[field].status === 'uploading') {
      return;
    }

    const photoUri = await capturePhoto();

    if (!photoUri) return;

    const uploadType = interiorImageTypes[field];

    setPhotos((currentPhotos) => ({
      ...currentPhotos,
      [field]: {
        localUri: photoUri,
        status: 'uploading',
      },
    }));

    try {
      const uploadResult = await uploadChecklistPhoto(
        photoUri,
        `post-interior-${uploadType}`,
      );

      setPhotos((currentPhotos) => ({
        ...currentPhotos,
        [field]: {
          ...uploadResult,
          localUri: photoUri,
          status: 'uploaded',
        },
      }));
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? 'Unable to upload this photo.';

      setPhotos((currentPhotos) => ({
        ...currentPhotos,
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

  };

  const handleRemovePhoto = (field: RequiredInteriorPhotoId) => {
    setPhotos((currentPhotos) => ({
      ...currentPhotos,
      [field]: createEmptyChecklistPhoto(),
    }));
  };

  const photoList = Object.values(photos);
  const odometerKM = parseNumericInput(odometer);
  const fuelLevelInPercentage = parseNumericInput(fuelLevel);
  const hasValidMetadata =
    odometerKM !== undefined &&
    odometerKM >= 0 &&
    fuelLevelInPercentage !== undefined &&
    fuelLevelInPercentage >= 0 &&
    fuelLevelInPercentage <= 100;
  const hasPendingUpload = photoList.some((photo) => photo.status === 'uploading');
  const hasFailedUpload = photoList.some((photo) => photo.status === 'failed');
  const isNextEnabled =
    photoList.every(isChecklistPhotoUploaded) &&
    Boolean(activeTripId) &&
    hasValidMetadata &&
    !hasPendingUpload &&
    !hasFailedUpload &&
    !submitInteriorChecklist.isPending;

  const handleNext = async () => {
    if (!activeTripId) {
      Toast.show({
        type: 'errorToast',
        text1: 'Trip unavailable',
        text2: 'Please go back and select the trip again.',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    if (!isNextEnabled || odometerKM === undefined || fuelLevelInPercentage === undefined) {
      return;
    }

    try {
      await submitInteriorChecklist.mutateAsync({
        payload: {
          checklistType: 'POST_TRIP',
          metadata: {
            fuelLevelInPercentage,
            odometerKM,
          },
          uploadPhotos: Object.entries(interiorImageTypes).map(([field, interiorUploadImage]) => ({
            ...toChecklistUploadedPhoto(photos[field as RequiredInteriorPhotoId]),
            interiorUploadImage,
          })),
        },
        tripId: activeTripId,
      });

      router.push(`/post-ride-checklist/step4?tripId=${encodeURIComponent(activeTripId)}`);
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
          <StepIndicator currentStep={3} totalSteps={4} />

          <Text className="font-inter font-bold text-[16px] text-[#101928] uppercase tracking-wide mb-4">
            Interior Photos
          </Text>
        </View>

        <View className="bg-[#E32636] px-5 py-3 mb-6 w-full">
          <Text className="text-white font-inter font-medium text-[13px] leading-5">
            Capture the dashboard photo, then enter the odometer and fuel readings.
          </Text>
        </View>

        <View className="px-5">
          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
            Required Photos
          </Text>

          <PhotoUploadCard
            title={dashboardRequirement.title}
            subtitle={photos.dashboard.status === 'uploading' ? 'Uploading...' : dashboardRequirement.subtitle}
            imageUri={photos.dashboard.localUri}
            onPress={handleDashboardPick}
            onRemove={() => handleRemovePhoto('dashboard')}
          />

          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mt-2 mb-4">
            Vehicle Readings
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
            const photoState = photos[photoId];

            return (
              <PhotoUploadCard
                key={photo.id}
                title={photo.title}
                subtitle={photoState.status === 'uploading' ? 'Uploading...' : photo.subtitle}
                imageUri={photoState.localUri}
                onPress={() => handleImagePick(photoId)}
                onRemove={() => handleRemovePhoto(photoId)}
              />
            );
          })}
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
