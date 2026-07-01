// app/checklist/step4.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { CustomBack } from '../../src/components/common/CustomBack';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { PhotoUploadCard } from '../../src/components/common/PhotoUploadCard';
import { capturePhoto } from '../../src/utils/deviceActions';

export default function ChecklistStep4Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId ?? '1';

  // Track all required health check photos
  const [photos, setPhotos] = useState({
    oilLevel: null as string | null,
    coolantLevel: null as string | null,
    safetyEquipment: null as string | null,
  });

  const handleImagePick = async (field: keyof typeof photos) => {
    const photoUri = await capturePhoto();

    if (photoUri) {
      setPhotos(prev => ({ ...prev, [field]: photoUri }));
    }
  };

  const handleRemovePhoto = (field: keyof typeof photos) => {
    setPhotos(prev => ({ ...prev, [field]: null }));
  };

  // Next is enabled only if all three photos are provided
  const isNextEnabled = Object.values(photos).every(val => val !== null);

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
            subtitle="Dipstick showing oil level between min/max"
            imageUri={photos.oilLevel}
            onPress={() => handleImagePick('oilLevel')}
            onRemove={() => handleRemovePhoto('oilLevel')}
          />
          
          <PhotoUploadCard
            title="Coolant Level"
            subtitle="Reservoir showing fluid level"
            imageUri={photos.coolantLevel}
            onPress={() => handleImagePick('coolantLevel')}
            onRemove={() => handleRemovePhoto('coolantLevel')}
          />
          
          <PhotoUploadCard
            title="Safety Equipment"
            subtitle="First Aid Kit, Warning Triangle, Fire Extinguisher"
            imageUri={photos.safetyEquipment}
            onPress={() => handleImagePick('safetyEquipment')}
            onRemove={() => handleRemovePhoto('safetyEquipment')}
          />

        </View>
      </ScrollView>

      <ChecklistFooter
        title="Next"
        activeOpacity={0.8}
        disabled={!isNextEnabled}
        onPress={() => router.push(`/checklist/step5?tripId=${encodeURIComponent(activeTripId)}`)}
      />
      </View>

    </SafeAreaView>
  );
}
