// app/checklist/step6.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { ConfirmationModal } from '../../src/components/common/ConfirmModal';
import { CustomBack } from '../../src/components/common/CustomBack';
import { CustomButton } from '../../src/components/common/CustomButton';
import { NumberedListItem } from '../../src/components/common/NumberedListItem';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { SummaryCard } from '../../src/components/common/SummaryCard';

export default function ChecklistStep6Screen() {
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const handleSubmit = () => {
    setIsConfirmVisible(false);

    // 1. Fire API request to submit the entire checklist payload here
    
    // 2. Show Success Toast
    Toast.show({
      type: 'successToast',
      text1: 'Checklist Submitted',
      text2: 'You are ready to start the trip.',
      position: 'top',
      topOffset: 60,
    });

    // 3. Route back to the home dashboard
    router.replace('/home'); 
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      
      {/* Header with Back Button */}
      <View className="px-4 pt-2 pb-2 z-10">
        <CustomBack color="#101928" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} bounces={true}>
        
        <View className="px-5">
          <StepIndicator currentStep={6} totalSteps={6} />
          
          <Text className="font-inter font-bold text-[16px] text-[#101928] uppercase tracking-wide mb-4">
            Review & Submit
          </Text>
        </View>

        {/* Red Instruction Banner */}
        <View className="bg-[#E32636] px-5 py-3 mb-6 w-full">
          <Text className="text-white font-inter font-medium text-[13px] leading-5">
            Submitting this checklist is irreversible. Please ensure all information is accurate before proceeding.
          </Text>
        </View>

        <View className="px-5">
          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
            Checklist Summary
          </Text>

          <SummaryCard title="Vehicle Info" subtitle="Honda Accord - LAG-567-ABJ" />
          <SummaryCard title="Exterior Photos" subtitle="4 photos captured" />
          <SummaryCard title="Interior Photos" subtitle="5 photos, odometer: 45,287 km | FL:30%" />
          <SummaryCard title="Health Check" subtitle="Oil, coolant, safety equipment verified" />
          <SummaryCard title="Driver Photo" subtitle="Identity verified" />

          <View className="h-[1px] bg-[#E4E7EC] w-full my-6" />

          <Text className="font-inter font-semibold text-[13px] text-[#101928] uppercase tracking-wider mb-4">
            Submission Details:
          </Text>

          <NumberedListItem index={1} text="Timestamp: 2/23/2026, 11:08:42 AM" />
          <NumberedListItem index={2} text="GPS Coordinates: -26.2041, 28.0473" />
          <NumberedListItem index={3} text="Total Completion: 5 min 32 sec" />
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View className="px-5 pb-8 pt-4 bg-[#F8FAFC]">
        <CustomButton
          title="Submit Checklist"
          onPress={() => setIsConfirmVisible(true)}
        />
      </View>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        visible={isConfirmVisible}
        onClose={() => setIsConfirmVisible(false)}
        onConfirm={handleSubmit}
        title="Submit Checklist"
        message="Are you sure you want to Submit Checklist? This action cannot be undone."
        confirmText="Submit"
      />

    </SafeAreaView>
  );
}
