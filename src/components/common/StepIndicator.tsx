import React from 'react';
import { View, Text } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  totalSteps = 6 
}) => {
  // Creates an array like [1, 2, 3, 4, 5, 6]
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View className="flex-row items-center justify-between px-2 mb-6 mt-4">
      {steps.map((step) => {
        const isActive = step === currentStep;
        return (
          <View
            key={step}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isActive ? 'bg-[#0673FF]' : 'bg-[#E4E7EC]'
            }`}
          >
            <Text
              className={`font-inter font-medium text-[15px] ${
                isActive ? 'text-white' : 'text-[#98A2B3]'
              }`}
            >
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
};