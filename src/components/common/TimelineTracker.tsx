// src/components/common/TimelineTracker.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface TimelineStep {
  id: string;
  title: string;
  state: 'completed' | 'current' | 'upcoming';
}

interface TimelineTrackerProps {
  steps: TimelineStep[];
}

export const TimelineTracker: React.FC<TimelineTrackerProps> = ({ steps }) => {
  return (
    <View className="ml-1">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <View key={step.id} className="flex-row relative">
            {/* Vertical connecting line */}
            {!isLast && (
              <View className="absolute left-[7px] top-[24px] bottom-[-8px] w-[1px] bg-[#E4E7EC]" />
            )}

            {/* Timeline Icon */}
            <View className="w-10 items-start justify-start pt-1 z-10">
              {step.state === 'completed' && (
                <Ionicons name="checkmark-circle-outline" size={18} color="#12B76A" />
              )}
              {step.state === 'current' && (
                <View className="w-4 h-4 rounded-full border-2 border-[#475367] ml-[1px]" />
              )}
              {step.state === 'upcoming' && (
                <View className="w-4 h-4 rounded-full border border-[#D0D5DD] ml-[1px]" />
              )}
            </View>

            {/* Timeline Text */}
            <View className="flex-1 pb-4 flex-row justify-between items-center">
              <Text className={`font-inter text-[15px] ${
                step.state === 'completed' ? 'text-[#12B76A]' : 
                step.state === 'current' ? 'text-[#101928] font-medium' : 'text-[#667185]'
              }`}>
                {step.title}
              </Text>
              
              {step.state === 'current' && (
                <View className="bg-[#98A2B3] px-2.5 py-1 rounded-full">
                  <Text className="text-white font-inter text-[11px] font-medium">Current</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};