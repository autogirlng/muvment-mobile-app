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
import { useSubmitExteriorChecklist } from '../../src/api/hooks/usePreRideChecklist';
import type { ExteriorUploadImage } from '../../src/api/types';
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

type RequiredExteriorPhotoKey = 'back' | 'front' | 'left' | 'right';

const requiredExteriorImageTypes: Record<
  RequiredExteriorPhotoKey,
  ExteriorUploadImage
> = {
  back: 'BACK',
  front: 'FRONT',
  left: 'LEFT_SIDE',
  right: 'RIGHT_SIDE',
};

export default function ChecklistStep2Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId?.trim() ?? '';
  const submitExteriorChecklist = useSubmitExteriorChecklist();

  // State for required photos
  const [requiredPhotos, setRequiredPhotos] = useState({
    back: createEmptyChecklistPhoto(),
    front: createEmptyChecklistPhoto(),
    left: createEmptyChecklistPhoto(),
    right: createEmptyChecklistPhoto(),
  });

  // State for optional damage photos (Array up to 3)
  const [damagePhotos, setDamagePhotos] = useState<ChecklistPhotoState[]>([]);

  const uploadRequiredPhoto = async (field: RequiredExteriorPhotoKey) => {
    if (requiredPhotos[field].status === 'uploading') {
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

    const currentPhoto = requiredPhotos[field];
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

    const uploadType = requiredExteriorImageTypes[field];

    setRequiredPhotos(prev => ({
      ...prev,
      [field]: {
        localUri: photoUri,
        status: 'uploading',
      },
    }));

    try {
      const uploadResult = await uploadChecklistPhoto(
        photoUri,
        `exterior-${uploadType}`,
        activeTripId,
      );

      setRequiredPhotos(prev => ({
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

      setRequiredPhotos(prev => ({
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

  const handleRemoveRequired = async (field: RequiredExteriorPhotoKey) => {
    const currentPhoto = requiredPhotos[field];

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

    setRequiredPhotos(prev => ({ ...prev, [field]: createEmptyChecklistPhoto() }));
  };

  const handleAddDamagePhoto = async () => {
    if (damagePhotos.length >= 3) {
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

    const photoUri = await capturePhoto();

    if (!photoUri) {
      return;
    }

    const nextIndex = damagePhotos.length;

    setDamagePhotos(prev => [
      ...prev,
      {
        localUri: photoUri,
        status: 'uploading',
      },
    ]);

    try {
      const uploadResult = await uploadChecklistPhoto(
        photoUri,
        `exterior-damage-${nextIndex + 1}`,
        activeTripId,
      );

      setDamagePhotos(prev => prev.map((photo, index) => (
        index === nextIndex
          ? {
              ...uploadResult,
              localUri: photoUri,
              status: 'uploaded',
            }
          : photo
      )));
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? CHECKLIST_UPLOAD_FAILED_MESSAGE;

      setDamagePhotos(prev => prev.map((photo, index) => (
        index === nextIndex
          ? {
              errorMessage: message,
              localUri: photoUri,
              status: 'failed',
            }
          : photo
      )));

      Toast.show({
        type: 'errorToast',
        text1: 'Upload failed',
        text2: message,
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const handleRetakeDamagePhoto = async (indexToUpdate: number) => {
    if (damagePhotos[indexToUpdate]?.status === 'uploading') {
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

    const currentPhoto = damagePhotos[indexToUpdate];
    const previousFileUrl = currentPhoto && isChecklistPhotoUploaded(currentPhoto)
      ? currentPhoto.fileUrl
      : undefined;
    const photoUri =
      currentPhoto?.status === 'failed' && currentPhoto.localUri
        ? currentPhoto.localUri
        : await capturePhoto();

    if (!photoUri) {
      return;
    }

    setDamagePhotos(prev => prev.map((photo, index) => (
      index === indexToUpdate
        ? {
            localUri: photoUri,
            status: 'uploading',
          }
        : photo
    )));

    try {
      const uploadResult = await uploadChecklistPhoto(
        photoUri,
        `exterior-damage-${indexToUpdate + 1}`,
        activeTripId,
      );

      setDamagePhotos(prev => prev.map((photo, index) => (
        index === indexToUpdate
          ? {
              ...uploadResult,
              localUri: photoUri,
              status: 'uploaded',
            }
          : photo
      )));

      void deleteChecklistPhotoBestEffort(previousFileUrl);
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? CHECKLIST_UPLOAD_FAILED_MESSAGE;

      setDamagePhotos(prev => prev.map((photo, index) => (
        index === indexToUpdate
          ? {
              errorMessage: message,
              localUri: photoUri,
              status: 'failed',
            }
          : photo
      )));

      Toast.show({
        type: 'errorToast',
        text1: 'Upload failed',
        text2: message,
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const handleRemoveDamagePhoto = async (indexToRemove: number) => {
    const currentPhoto = damagePhotos[indexToRemove];

    if (currentPhoto && isChecklistPhotoUploaded(currentPhoto)) {
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

    setDamagePhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
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

  // Ensure all 4 required photos are present before enabling the "Next" button
  const requiredPhotoList = Object.values(requiredPhotos);
  const allRequiredUploaded = requiredPhotoList.every(isChecklistPhotoUploaded);
  const hasPendingUpload = [...requiredPhotoList, ...damagePhotos].some(
    photo => photo.status === 'uploading',
  );
  const hasFailedUpload = [...requiredPhotoList, ...damagePhotos].some(
    photo => photo.status === 'failed',
  );
  const isNextEnabled =
    allRequiredUploaded &&
    Boolean(activeTripId) &&
    !hasPendingUpload &&
    !hasFailedUpload &&
    !submitExteriorChecklist.isPending;

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
      await submitExteriorChecklist.mutateAsync({
        payload: {
          checklistType: 'PRE_TRIP',
          uploadPhotos: [
            ...Object.entries(requiredExteriorImageTypes).map(([field, exteriorUploadImage]) => ({
              ...toChecklistUploadedPhoto(
                requiredPhotos[field as RequiredExteriorPhotoKey],
              ),
              exteriorUploadImage,
            })),
            ...damagePhotos
              .filter(isChecklistPhotoUploaded)
              .map(photo => ({
                ...toChecklistUploadedPhoto(photo),
                exteriorUploadImage: 'DAMAGE' as const,
              })),
          ],
        },
        tripId: activeTripId,
      });

      router.push(`/checklist/step3?tripId=${encodeURIComponent(activeTripId)}`);
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Exterior checklist failed',
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
          <StepIndicator currentStep={2} totalSteps={6} />
          
          <Text className="font-inter font-bold text-[16px] text-[#101928] uppercase tracking-wide mb-4">
            Exterior Photos
          </Text>
        </View>

        {/* Red Instruction Banner */}
        <View className="bg-[#E32636] px-5 py-3 mb-6 w-full">
          <Text className="text-white font-inter font-medium text-[13px] leading-5">
            Capture clear photos of all sides of the vehicle. Ensure good lighting and the entire side is visible.
          </Text>
        </View>

        <View className="px-5">
          <Text className="font-inter font-semibold text-[13px] text-[#101928] mb-4">
            Required Photos
          </Text>

          <PhotoUploadCard
            title="Right Side"
            subtitle={getPhotoSubtitle(requiredPhotos.right, 'Right Side: Full side including wheels')}
            imageUri={requiredPhotos.right.localUri}
            onPress={() => uploadRequiredPhoto('right')}
            onRemove={() => handleRemoveRequired('right')}
          />
          <PhotoUploadCard
            title="Left Side"
            subtitle={getPhotoSubtitle(requiredPhotos.left, 'Left Side: Full side including wheels')}
            imageUri={requiredPhotos.left.localUri}
            onPress={() => uploadRequiredPhoto('left')}
            onRemove={() => handleRemoveRequired('left')}
          />
          <PhotoUploadCard
            title="Front"
            subtitle={getPhotoSubtitle(requiredPhotos.front, 'Front: Clear view of grille and bumper')}
            imageUri={requiredPhotos.front.localUri}
            onPress={() => uploadRequiredPhoto('front')}
            onRemove={() => handleRemoveRequired('front')}
          />
          <PhotoUploadCard
            title="Back"
            subtitle={getPhotoSubtitle(requiredPhotos.back, 'Back: Including taillights, bumper & plate')}
            imageUri={requiredPhotos.back.localUri}
            onPress={() => uploadRequiredPhoto('back')}
            onRemove={() => handleRemoveRequired('back')}
          />

          {/* Optional Damage Photos Section */}
          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase mt-4 mb-4">
            Damage Photos (Optional, Up to 3)
          </Text>

          {/* Render uploaded damage photos */}
          {damagePhotos.map((photo, index) => (
            <PhotoUploadCard
              key={`damage-${index}`}
              title="Additional (Optional)"
              subtitle={getPhotoSubtitle(photo, 'Up to 3 damage close-ups')}
              imageUri={photo.localUri}
              onPress={() => handleRetakeDamagePhoto(index)}
              onRemove={() => handleRemoveDamagePhoto(index)}
            />
          ))}

          {/* Render the empty "Add Damage" card if under the limit */}
          {damagePhotos.length < 3 && (
            <PhotoUploadCard
              title="Add Damage"
              onPress={handleAddDamagePhoto}
            />
          )}

        </View>
      </ScrollView>

      <ChecklistFooter
        title={submitExteriorChecklist.isPending ? 'Saving...' : 'Next'}
        activeOpacity={0.8}
        disabled={!isNextEnabled}
        onPress={handleNext}
      />
      </View>

    </SafeAreaView>
  );
}
