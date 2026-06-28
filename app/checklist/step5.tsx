import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  ImageBackground
} from 'react-native';
import { router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

import { CustomBack } from '../../src/components/common/CustomBack';
import { CustomButton } from '../../src/components/common/CustomButton';
import { NumberedListItem } from '../../src/components/common/NumberedListItem';
import { StepIndicator } from '../../src/components/common/StepIndicator';

// Dummy selfie image to simulate a captured photo
const DUMMY_SELFIE_IMG = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';

export default function ChecklistStep5Screen() {
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  const requirements = [
    "Face clearly visible and well-lit",
    "Uniform/professional attire visible",
    "No sunglasses or face coverings",
    "Good lighting on your face"
  ];

  const handleOpenCamera = () => {
    // In a real app, this would trigger the device's camera module (e.g., expo-camera or expo-image-picker)
    setSelfieUri(DUMMY_SELFIE_IMG);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      
      {/* Header with Back Button */}
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} bounces={true}>
        
        <View className="px-5">
          <StepIndicator currentStep={5} totalSteps={6} />
          
          <Text className="font-inter font-bold text-[16px] text-[#101928] uppercase tracking-wide mb-4">
            Driver Photo
          </Text>
        </View>

        {/* Red Instruction Banner */}
        <View className="bg-[#E32636] px-5 py-3 mb-6 w-full">
          <Text className="text-white font-inter font-medium text-[13px] leading-5">
            Position your face within the circle
          </Text>
        </View>

        <View className="px-5">
          <Text className="font-inter font-medium text-[14px] text-[#101928] uppercase tracking-wider mb-4">
            Selfie Requirements:
          </Text>

          {/* Requirements List */}
          <View className="space-y-3 mb-8">
            {requirements.map((req, index) => (
              <NumberedListItem key={req} index={index + 1} text={req} size="medium" />
            ))}
          </View>

          {/* Dedicated Camera/Selfie Capture Card */}
          {selfieUri ? (
            // Filled State
            <View className="border-2 border-[#0673FF] rounded-2xl overflow-hidden mb-6 items-center justify-center bg-black relative h-[340px]">
              <ImageBackground source={{ uri: selfieUri }} className="w-full h-full opacity-90" resizeMode="cover">
                
                {/* Visual Face Guide Overlay */}
                <View className="flex-1 items-center justify-center">
                  <View className="w-48 h-48 rounded-full border-2 border-dashed border-white/50" />
                </View>

                {/* Retake Button */}
                <TouchableOpacity 
                  onPress={() => setSelfieUri(null)}
                  className="absolute top-4 right-4 bg-black/40 rounded-full p-2"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>

              </ImageBackground>
            </View>
          ) : (
            // Empty State
            <View className="border border-dashed border-[#D0D5DD] rounded-2xl py-10 items-center justify-center bg-[#FAFBFC] mb-6">
              
              {/* Dashed Face Guide Indicator */}
              <View className="w-40 h-40 rounded-full border border-dashed border-[#D0D5DD] items-center justify-center mb-6 bg-white shadow-sm">
                <Feather name="camera" size={24} color="#475367" />
              </View>
              
              <Text className="font-inter text-[#475367] text-[14px] mb-6 text-center px-4">
                Position your face within the circle
              </Text>
              
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleOpenCamera}
                className="bg-[#0673FF] flex-row items-center justify-center px-6 py-3.5 rounded-xl shadow-sm"
              >
                <Feather name="camera" size={18} color="#FFFFFF" />
                <Text className="text-white font-inter font-medium ml-2 text-sm">
                  Open Camera
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View className="px-5 pb-8 pt-4 bg-[#F8FAFC]">
        <CustomButton
          title="Next"
          activeOpacity={0.8}
          disabled={!selfieUri}
          onPress={() => router.push('/checklist/step6')}
        />
      </View>

    </SafeAreaView>
  );
}
