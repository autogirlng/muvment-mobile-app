import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { CustomBack } from '../../src/components/common/CustomBack';
import { PhotoUploadCard } from '../../src/components/common/PhotoUploadCard';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { MOCK_POST_RIDE_CHECKLIST } from '../../src/data/mockData';
import { capturePhoto } from '../../src/utils/deviceActions';

type RequiredExteriorPhotoId = 'rightSide' | 'leftSide' | 'front' | 'back';

const initialRequiredPhotos: Record<RequiredExteriorPhotoId, string | null> = {
  rightSide: null,
  leftSide: null,
  front: null,
  back: null,
};

export default function PostRideChecklistStep2Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId ?? '1';
  const [requiredPhotos, setRequiredPhotos] = useState(initialRequiredPhotos);
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);
  const photoRequirements = MOCK_POST_RIDE_CHECKLIST.exteriorPhotos.required;
  const damageConfig = MOCK_POST_RIDE_CHECKLIST.exteriorPhotos.optionalDamage;

  const handleImagePick = async (field: RequiredExteriorPhotoId) => {
    const photoUri = await capturePhoto();

    if (photoUri) {
      setRequiredPhotos((currentPhotos) => ({
        ...currentPhotos,
        [field]: photoUri,
      }));
    }
  };

  const handleRemoveRequired = (field: RequiredExteriorPhotoId) => {
    setRequiredPhotos((currentPhotos) => ({
      ...currentPhotos,
      [field]: null,
    }));
  };

  const handleAddDamagePhoto = async () => {
    if (damagePhotos.length < damageConfig.maxPhotos) {
      const photoUri = await capturePhoto();

      if (photoUri) {
        setDamagePhotos((currentPhotos) => [...currentPhotos, photoUri]);
      }
    }
  };

  const handleRetakeDamagePhoto = async (indexToUpdate: number) => {
    const photoUri = await capturePhoto();

    if (photoUri) {
      setDamagePhotos((currentPhotos) => (
        currentPhotos.map((uri, index) => (index === indexToUpdate ? photoUri : uri))
      ));
    }
  };

  const handleRemoveDamagePhoto = (indexToRemove: number) => {
    setDamagePhotos((currentPhotos) => currentPhotos.filter((_, index) => index !== indexToRemove));
  };

  const isNextEnabled = photoRequirements.every((photo) => (
    Boolean(requiredPhotos[photo.id as RequiredExteriorPhotoId])
  ));

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

            return (
              <PhotoUploadCard
                key={photo.id}
                title={photo.title}
                subtitle={photo.subtitle}
                imageUri={requiredPhotos[photoId]}
                onPress={() => handleImagePick(photoId)}
                onRemove={() => handleRemoveRequired(photoId)}
              />
            );
          })}

          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase mt-4 mb-4">
            Damage Photos (Optional, Up to 3)
          </Text>

          {damagePhotos.map((uri, index) => (
            <PhotoUploadCard
              key={`damage-${index}`}
              title={damageConfig.title}
              subtitle={damageConfig.subtitle}
              imageUri={uri}
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
        title="Next"
        activeOpacity={0.8}
        disabled={!isNextEnabled}
        onPress={() => router.push(`/post-ride-checklist/step3?tripId=${encodeURIComponent(activeTripId)}`)}
      />
      </View>
    </SafeAreaView>
  );
}
