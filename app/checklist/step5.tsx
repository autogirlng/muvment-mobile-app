import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  ImageBackground
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';
import { ChecklistFooter } from '../../src/components/common/ChecklistFooter';
import { CustomBack } from '../../src/components/common/CustomBack';
import { NumberedListItem } from '../../src/components/common/NumberedListItem';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { getApiErrorMessage } from '../../src/api/errors';
import { useSubmitDriverPhotoChecklist } from '../../src/api/hooks/usePreRideChecklist';
import {
  createEmptyChecklistPhoto,
  isChecklistPhotoUploaded,
  toChecklistUploadedPhoto,
} from '../../src/utils/checklistPhotos';
import { uploadChecklistPhoto } from '../../src/utils/cloudinaryUpload';
import { capturePhoto } from '../../src/utils/deviceActions';

export default function ChecklistStep5Screen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const activeTripId = tripId?.trim() ?? '';
  const submitDriverPhotoChecklist = useSubmitDriverPhotoChecklist();
  const [selfie, setSelfie] = useState(createEmptyChecklistPhoto());

  const requirements = [
    "Face clearly visible and well-lit",
    "Uniform/professional attire visible",
    "No sunglasses or face coverings",
    "Good lighting on your face"
  ];

  const handleOpenCamera = async () => {
    if (selfie.status === 'uploading') {
      return;
    }

    const photoUri = await capturePhoto();

    if (!photoUri) {
      return;
    }

    setSelfie({
      localUri: photoUri,
      status: 'uploading',
    });

    try {
      const uploadResult = await uploadChecklistPhoto(
        photoUri,
        'driver-selfie',
      );

      setSelfie({
        ...uploadResult,
        localUri: photoUri,
        status: 'uploaded',
      });
    } catch (error) {
      const message =
        getApiErrorMessage(error) ?? 'Unable to upload your selfie.';

      setSelfie({
        errorMessage: message,
        localUri: photoUri,
        status: 'failed',
      });

      Toast.show({
        type: 'errorToast',
        text1: 'Upload failed',
        text2: message,
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const isNextEnabled =
    isChecklistPhotoUploaded(selfie) &&
    Boolean(activeTripId) &&
    !submitDriverPhotoChecklist.isPending;

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
      await submitDriverPhotoChecklist.mutateAsync({
        payload: {
          uploadPhotos: [toChecklistUploadedPhoto(selfie)],
        },
        tripId: activeTripId,
      });

      router.push(`/checklist/step6?tripId=${encodeURIComponent(activeTripId)}`);
    } catch (error) {
      Toast.show({
        type: 'errorToast',
        text1: 'Driver photo checklist failed',
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
          {selfie.localUri ? (
            // Filled State
            <View className="border-2 border-[#0673FF] rounded-2xl overflow-hidden mb-6 items-center justify-center bg-black relative h-[340px]">
              <ImageBackground source={{ uri: selfie.localUri }} className="w-full h-full opacity-90" resizeMode="cover">
                
                {/* Visual Face Guide Overlay */}
                <View className="flex-1 items-center justify-center">
                  <View className="w-48 h-48 rounded-full border-2 border-dashed border-white/50" />
                </View>

                {/* Retake Button */}
                <TouchableOpacity 
                  onPress={() => setSelfie(createEmptyChecklistPhoto())}
                  className="absolute top-4 right-4 bg-black/40 rounded-full p-2"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>

                {selfie.status === 'uploading' && (
                  <View className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-xl px-4 py-3">
                    <Text className="text-white font-inter font-medium text-center text-sm">
                      Uploading...
                    </Text>
                  </View>
                )}

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

      <ChecklistFooter
        title={submitDriverPhotoChecklist.isPending ? 'Saving...' : 'Next'}
        activeOpacity={0.8}
        disabled={!isNextEnabled}
        onPress={handleNext}
      />
      </View>

    </SafeAreaView>
  );
}
