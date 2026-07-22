// app/checklist/step4.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { CustomBack } from '../../src/components/common/CustomBack';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { PhotoUploadCard } from '../../src/components/common/PhotoUploadCard';
import { getApiErrorMessage } from '../../src/api/errors';
import { useSubmitVehicleHealthChecklist } from '../../src/api/hooks/usePreRideChecklist';
import type { VehicleHealthCheckPhoto } from '../../src/api/types';
import {
  createEmptyChecklistPhoto,
  isChecklistPhotoUploaded,
  toChecklistUploadedPhoto,
  type ChecklistPhotoState,
} from '../../src/utils/checklistPhotos';
import {
  CHECKLIST_UPLOAD_FAILED_MESSAGE,
  deleteChecklistPhoto,
  deleteChecklistPhotoBestEffort,
  uploadChecklistPhoto,
} from '../../src/utils/mediaUpload';
import { capturePhoto } from '../../src/utils/deviceActions';

type VehicleHealthPhotoKey =
  | 'coolantLevel'
  | 'oilLevel'
  | 'safetyEquipment';

const vehicleHealthPhotoTypes: Record<
  VehicleHealthPhotoKey,
  VehicleHealthCheckPhoto
> = {
  coolantLevel: 'COOLANT_LEVEL',
  oilLevel: 'OIL_LEVEL',
  safetyEquipment: 'SAFETY_EQUIPMENT',
};

export default function ChecklistStep4Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId?.trim() ?? '';
  const submitVehicleHealthChecklist = useSubmitVehicleHealthChecklist();

  // Track all required health check photos
  const [photos, setPhotos] = useState({
    coolantLevel: createEmptyChecklistPhoto(),
    oilLevel: createEmptyChecklistPhoto(),
    safetyEquipment: createEmptyChecklistPhoto(),
  });

  const handleImagePick = async (field: VehicleHealthPhotoKey) => {
    if (photos[field].status === 'uploading') {
      return;
    }

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

    const currentPhoto = photos[field];
    const previousFileUrl = isChecklistPhotoUploaded(currentPhoto)
      ? currentPhoto.fileUrl
      : undefined;
    const photoUri =
      currentPhoto.status === 'failed' && currentPhoto.localUri
        ? currentPhoto.localUri
        : await capturePhoto();

    if (!photoUri) {
      return;
    }

    const uploadType = vehicleHealthPhotoTypes[field];

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
        `vehicle-health-${uploadType}`,
        activeTripId,
      );

      setPhotos(prev => ({
        ...prev,
        [field]: {
          ...uploadResult,
          localUri: photoUri,
          status: 'uploaded',
        },
      }));

      void deleteChecklistPhotoBestEffort(previousFileUrl);
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? CHECKLIST_UPLOAD_FAILED_MESSAGE;

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
    }
  };

  const handleRemovePhoto = async (field: VehicleHealthPhotoKey) => {
    const currentPhoto = photos[field];

    if (isChecklistPhotoUploaded(currentPhoto)) {
      try {
        await deleteChecklistPhoto(currentPhoto.fileUrl);
      } catch {
        Toast.show({
          type: 'errorToast',
          text1: 'Remove failed',
          text2: 'Please try removing the photo again.',
          position: 'top',
          topOffset: 60,
        });
        return;
      }
    }

    setPhotos(prev => ({ ...prev, [field]: createEmptyChecklistPhoto() }));
  };

  const getPhotoSubtitle = (
    photo: ChecklistPhotoState,
    fallback: string,
  ) => {
    if (photo.status === 'uploading') {
      return 'Uploading...';
    }

    if (photo.status === 'failed') {
      return photo.errorMessage ?? CHECKLIST_UPLOAD_FAILED_MESSAGE;
    }

    return fallback;
  };

  // Next is enabled only if all three photos are provided
  const photoList = Object.values(photos);
  const hasPendingUpload = photoList.some(photo => photo.status === 'uploading');
  const hasFailedUpload = photoList.some(photo => photo.status === 'failed');
  const isNextEnabled =
    photoList.every(isChecklistPhotoUploaded) &&
    Boolean(activeTripId) &&
    !hasPendingUpload &&
    !hasFailedUpload &&
    !submitVehicleHealthChecklist.isPending;

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

    if (!isNextEnabled) {
      return;
    }

    try {
      await submitVehicleHealthChecklist.mutateAsync({
        payload: {
          uploadPhotos: Object.entries(vehicleHealthPhotoTypes).map(([field, vehicleHealthCheckPhotos]) => ({
            ...toChecklistUploadedPhoto(photos[field as VehicleHealthPhotoKey]),
            vehicleHealthCheckPhotos,
          })),
        },
        tripId: activeTripId,
      });

      router.push(`/checklist/step5?tripId=${encodeURIComponent(activeTripId)}`);
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Vehicle health checklist failed',
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
          <StepIndicator currentStep={4} totalSteps={6} />
          
          <Text className="font-inter font-bold text-[16px] text-[#101928] uppercase tracking-wide mb-4">
            Vehicle Health Check
          </Text>
        </View>

        {/* Red Instruction Banner */}
        <View className="bg-[#E32636] px-5 py-3 mb-6 w-full">
          <Text className="text-white font-inter font-medium text-[13px] leading-5">
            Open the hood and check fluid levels. Ensure engine is cool before opening.
          </Text>
        </View>

        <View className="px-5">
          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
            Required Photos
          </Text>

          <PhotoUploadCard
            title="Oil Level"
            subtitle={getPhotoSubtitle(photos.oilLevel, 'Dipstick showing oil level between min/max')}
            imageUri={photos.oilLevel.localUri}
            onPress={() => handleImagePick('oilLevel')}
            onRemove={() => handleRemovePhoto('oilLevel')}
          />
          
          <PhotoUploadCard
            title="Coolant Level"
            subtitle={getPhotoSubtitle(photos.coolantLevel, 'Reservoir showing fluid level')}
            imageUri={photos.coolantLevel.localUri}
            onPress={() => handleImagePick('coolantLevel')}
            onRemove={() => handleRemovePhoto('coolantLevel')}
          />
          
          <PhotoUploadCard
            title="Safety Equipment"
            subtitle={getPhotoSubtitle(photos.safetyEquipment, 'First Aid Kit, Warning Triangle, Fire Extinguisher')}
            imageUri={photos.safetyEquipment.localUri}
            onPress={() => handleImagePick('safetyEquipment')}
            onRemove={() => handleRemovePhoto('safetyEquipment')}
          />

        </View>
      </ScrollView>

      <ChecklistFooter
        title={submitVehicleHealthChecklist.isPending ? 'Saving...' : 'Next'}
        activeOpacity={0.8}
        disabled={!isNextEnabled}
        onPress={handleNext}
      />
      </View>

    </SafeAreaView>
  );
}
