import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { CustomBack } from '../../src/components/common/CustomBack';
import { PhotoUploadCard } from '../../src/components/common/PhotoUploadCard';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { MOCK_POST_RIDE_CHECKLIST } from '../../src/data/mockData';

const DUMMY_EXTERIOR_IMG = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800';

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

  const handleImagePick = (field: RequiredExteriorPhotoId) => {
    setRequiredPhotos((currentPhotos) => ({
      ...currentPhotos,
      [field]: DUMMY_EXTERIOR_IMG,
    }));
  };

  const handleRemoveRequired = (field: RequiredExteriorPhotoId) => {
    setRequiredPhotos((currentPhotos) => ({
      ...currentPhotos,
      [field]: null,
    }));
  };

  const handleAddDamagePhoto = () => {
    if (damagePhotos.length < damageConfig.maxPhotos) {
      setDamagePhotos((currentPhotos) => [...currentPhotos, DUMMY_EXTERIOR_IMG]);
    }
  };

  const handleRemoveDamagePhoto = (indexToRemove: number) => {
    setDamagePhotos((currentPhotos) => currentPhotos.filter((_, index) => index !== indexToRemove));
  };

  const isNextEnabled = photoRequirements.every((photo) => (
    Boolean(requiredPhotos[photo.id as RequiredExteriorPhotoId])
  ));

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }} bounces={true}>
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
              onPress={() => {}}
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
    </SafeAreaView>
  );
}
