import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { CustomBack } from '../../src/components/common/CustomBack';
import { EmptyState } from '../../src/components/common/EmptyState';
import { PhotoUploadCard } from '../../src/components/common/PhotoUploadCard';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { getApiErrorMessage } from '../../src/api/errors';
import { useSubmitExteriorChecklist } from '../../src/api/hooks/usePreRideChecklist';
import type { ExteriorUploadImage } from '../../src/api/types';
import { MOCK_POST_RIDE_CHECKLIST } from '../../src/data/mockData';
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

type RequiredExteriorPhotoId = 'back' | 'front' | 'leftSide' | 'rightSide';

const requiredExteriorImageTypes: Record<
  RequiredExteriorPhotoId,
  ExteriorUploadImage
> = {
  back: 'BACK',
  front: 'FRONT',
  leftSide: 'LEFT_SIDE',
  rightSide: 'RIGHT_SIDE',
};

export default function PostRideChecklistStep2Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId?.trim() ?? '';
  const submitExteriorChecklist = useSubmitExteriorChecklist();
  const [requiredPhotos, setRequiredPhotos] = useState({
    back: createEmptyChecklistPhoto(),
    front: createEmptyChecklistPhoto(),
    leftSide: createEmptyChecklistPhoto(),
    rightSide: createEmptyChecklistPhoto(),
  });
  const [damagePhotos, setDamagePhotos] = useState<ChecklistPhotoState[]>([]);
  const photoRequirements = MOCK_POST_RIDE_CHECKLIST.exteriorPhotos.required;
  const damageConfig = MOCK_POST_RIDE_CHECKLIST.exteriorPhotos.optionalDamage;

  const uploadRequiredPhoto = async (field: RequiredExteriorPhotoId) => {
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

    setRequiredPhotos((currentPhotos) => ({
      ...currentPhotos,
      [field]: {
        localUri: photoUri,
        status: 'uploading',
      },
    }));

    try {
      const uploadResult = await uploadChecklistPhoto(
        photoUri,
        `post-exterior-${uploadType}`,
        activeTripId,
      );

      setRequiredPhotos((currentPhotos) => ({
        ...currentPhotos,
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

      setRequiredPhotos((currentPhotos) => ({
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
    }
  };

  const handleRemoveRequired = async (field: RequiredExteriorPhotoId) => {
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

    setRequiredPhotos((currentPhotos) => ({
      ...currentPhotos,
      [field]: createEmptyChecklistPhoto(),
    }));
  };

  const handleAddDamagePhoto = async () => {
    if (damagePhotos.length >= damageConfig.maxPhotos) {
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

    setDamagePhotos((currentPhotos) => [
      ...currentPhotos,
      {
        localUri: photoUri,
        status: 'uploading',
      },
    ]);

    try {
      const uploadResult = await uploadChecklistPhoto(
        photoUri,
        `post-exterior-damage-${nextIndex + 1}`,
        activeTripId,
      );

      setDamagePhotos((currentPhotos) => currentPhotos.map((photo, index) => (
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

      setDamagePhotos((currentPhotos) => currentPhotos.map((photo, index) => (
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

    setDamagePhotos((currentPhotos) => currentPhotos.map((photo, index) => (
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
        `post-exterior-damage-${indexToUpdate + 1}`,
        activeTripId,
      );

      setDamagePhotos((currentPhotos) => currentPhotos.map((photo, index) => (
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

      setDamagePhotos((currentPhotos) => currentPhotos.map((photo, index) => (
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

    setDamagePhotos((currentPhotos) => (
      currentPhotos.filter((_, index) => index !== indexToRemove)
    ));
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

  const requiredPhotoList = Object.values(requiredPhotos);
  const allRequiredUploaded = requiredPhotoList.every(isChecklistPhotoUploaded);
  const hasPendingUpload = [...requiredPhotoList, ...damagePhotos].some(
    (photo) => photo.status === 'uploading',
  );
  const hasFailedUpload = [...requiredPhotoList, ...damagePhotos].some(
    (photo) => photo.status === 'failed',
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
          checklistType: 'POST_TRIP',
          uploadPhotos: [
            ...Object.entries(requiredExteriorImageTypes).map(([field, exteriorUploadImage]) => ({
              ...toChecklistUploadedPhoto(
                requiredPhotos[field as RequiredExteriorPhotoId],
              ),
              exteriorUploadImage,
            })),
            ...damagePhotos
              .filter(isChecklistPhotoUploaded)
              .map((photo) => ({
                ...toChecklistUploadedPhoto(photo),
                exteriorUploadImage: 'DAMAGE' as const,
              })),
          ],
        },
        tripId: activeTripId,
      });

      router.push(`/post-ride-checklist/step3?tripId=${encodeURIComponent(activeTripId)}`);
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

  if (!activeTripId) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
        <View className="px-4 pt-2 pb-2 z-10">
          <CustomBack color="#101928" />
        </View>
        <EmptyState
          title="Trip unavailable"
          description="Missing trip ID. Please go back and select a trip again."
        />
      </SafeAreaView>
    );
  }

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
          <StepIndicator currentStep={2} totalSteps={4} />

          <Text className="font-inter font-bold text-[16px] text-[#101928] uppercase tracking-wide mb-4">
            Exterior Photos
          </Text>
        </View>

        <View className="bg-[#E32636] px-5 py-3 mb-6 w-full">
          <Text className="text-white font-inter font-medium text-[13px] leading-5">
            Capture clear photos of all sides of the vehicle. Ensure good lighting and the entire side is visible.
          </Text>
        </View>

        <View className="px-5">
          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
            Required Photos
          </Text>

          {photoRequirements.map((photo) => {
            const photoId = photo.id as RequiredExteriorPhotoId;
            const photoState = requiredPhotos[photoId];

            return (
              <PhotoUploadCard
                key={photo.id}
                title={photo.title}
                subtitle={getPhotoSubtitle(photoState, photo.subtitle)}
                imageUri={photoState.localUri}
                onPress={() => uploadRequiredPhoto(photoId)}
                onRemove={() => handleRemoveRequired(photoId)}
              />
            );
          })}

          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase mt-4 mb-4">
            Damage Photos (Optional, Up to 3)
          </Text>

          {damagePhotos.map((photo, index) => (
            <PhotoUploadCard
              key={`damage-${index}`}
              title={damageConfig.title}
              subtitle={getPhotoSubtitle(photo, damageConfig.subtitle)}
              imageUri={photo.localUri}
              onPress={() => handleRetakeDamagePhoto(index)}
              onRemove={() => handleRemoveDamagePhoto(index)}
            />
          ))}

          {damagePhotos.length < damageConfig.maxPhotos && (
            <PhotoUploadCard
              title={damageConfig.title}
              subtitle={damageConfig.subtitle}
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
