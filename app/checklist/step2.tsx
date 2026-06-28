import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView
} from 'react-native';
import { router } from 'expo-router';

import { CustomBack } from '../../src/components/common/CustomBack';
import { CustomButton } from '../../src/components/common/CustomButton';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { PhotoUploadCard } from '../../src/components/common/PhotoUploadCard';

// Dummy car image to simulate a picked photo
const DUMMY_CAR_IMG = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800';

export default function ChecklistStep2Screen() {
  // State for required photos
  const [requiredPhotos, setRequiredPhotos] = useState({
    right: DUMMY_CAR_IMG, // Pre-filled for preview purposes
    left: DUMMY_CAR_IMG,
    front: null as string | null,
    back: null as string | null,
  });

  // State for optional damage photos (Array up to 3)
  const [damagePhotos, setDamagePhotos] = useState<string[]>([DUMMY_CAR_IMG]);

  // Mock function to simulate picking an image
  const handleImagePick = (field: keyof typeof requiredPhotos) => {
    setRequiredPhotos(prev => ({ ...prev, [field]: DUMMY_CAR_IMG }));
  };

  const handleRemoveRequired = (field: keyof typeof requiredPhotos) => {
    setRequiredPhotos(prev => ({ ...prev, [field]: null }));
  };

  const handleAddDamagePhoto = () => {
    if (damagePhotos.length < 3) {
      setDamagePhotos(prev => [...prev, DUMMY_CAR_IMG]);
    }
  };

  const handleRemoveDamagePhoto = (indexToRemove: number) => {
    setDamagePhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Ensure all 4 required photos are present before enabling the "Next" button
  const isNextEnabled = Boolean(requiredPhotos.right && requiredPhotos.left && requiredPhotos.front && requiredPhotos.back);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      
      {/* Header with Back Button */}
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} bounces={true}>
        
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
            subtitle="Right Side: Full side including wheels"
            imageUri={requiredPhotos.right}
            onPress={() => handleImagePick('right')}
            onRemove={() => handleRemoveRequired('right')}
          />
          <PhotoUploadCard
            title="Left Side"
            subtitle="Left Side: Full side including wheels"
            imageUri={requiredPhotos.left}
            onPress={() => handleImagePick('left')}
            onRemove={() => handleRemoveRequired('left')}
          />
          <PhotoUploadCard
            title="Front"
            subtitle="Front: Clear view of grille and bumper"
            imageUri={requiredPhotos.front}
            onPress={() => handleImagePick('front')}
            onRemove={() => handleRemoveRequired('front')}
          />
          <PhotoUploadCard
            title="Back"
            subtitle="Back: Including taillights, bumper & plate"
            imageUri={requiredPhotos.back}
            onPress={() => handleImagePick('back')}
            onRemove={() => handleRemoveRequired('back')}
          />

          {/* Optional Damage Photos Section */}
          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase mt-4 mb-4">
            Damage Photos (Optional, Up to 3)
          </Text>

          {/* Render uploaded damage photos */}
          {damagePhotos.map((uri, index) => (
            <PhotoUploadCard
              key={`damage-${index}`}
              title="Additional (Optional)"
              subtitle="Up to 3 damage close-ups"
              imageUri={uri}
              onPress={() => {}} 
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

      {/* Bottom Sticky Action Button */}
      <View className="px-5 pb-8 pt-4 bg-[#F8FAFC]">
        <CustomButton
          title="Next"
          activeOpacity={0.8}
          disabled={!isNextEnabled}
          onPress={() => router.push('/checklist/step3')}
        />
      </View>

    </SafeAreaView>
  );
}
