import React, { useState } from 'react';
import {
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  ScrollView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { AppStatusBar } from '../../src/components/common/AppStatusBar';

type RequestType = 'Extra Hours' | 'Interstate Trip' | 'Off Day';

// Internal helper component for the radio buttons
const RadioOption = ({ 
  title, 
  description, 
  selected, 
  onPress 
}: { 
  title: string, 
  description: string, 
  selected: boolean, 
  onPress: () => void 
}) => (
  <TouchableOpacity 
    activeOpacity={0.7}
    onPress={onPress}
    className={`flex-row items-center border rounded-lg px-2 py-3 mb-4 bg-white ${
      selected ? 'border-[#0673FF] bg-[#F5F9FF]' : 'border-[#E4E7EC]'
    }`}
  >
    {/* Custom Radio Button Circle */}
    <View
      className={`w-5 h-5 rounded-full border items-center justify-center mr-3 ${
        selected ? 'border-[#0673FF]' : 'border-[#D0D5DD]'
      }`}
    >
      {selected && <View className="w-3 h-3 bg-[#0673FF] rounded-full" />}
    </View>

    {/* Text Content */}
    <View className="flex-1">
      <Text className="font-inter font-medium text-base text-[#101928]">
        {title}
      </Text>
      <Text className="font-inter text-sm text-[#667185] mt-0.5 leading-5">
        {description}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function RequestTypeScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  // Track which radio button is active (defaulting to the first one)
  const [requestType, setRequestType] = useState<RequestType>('Extra Hours');
  const [extraHours, setExtraHours] = useState('');

  const handleContinue = () => {
    const cleanedExtraHours = extraHours.trim();
    const parsedExtraHours = Number(cleanedExtraHours);

    if (requestType === 'Extra Hours' && (!cleanedExtraHours || parsedExtraHours <= 0)) {
      Toast.show({
        type: 'errorToast',
        text1: 'Enter extra hours',
        text2: 'Add a valid number of hours before continuing.',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    router.push({
      pathname: '/payment/review-request',
      params: {
        tripId,
        requestType,
        extraHours: requestType === 'Extra Hours' ? String(parsedExtraHours) : undefined,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <AppStatusBar style="dark" backgroundColor="#F8FAFC" />
      <View className="flex-1" style={{ flex: 1 }}>
        <View className="px-4 pt-2 pb-5" style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center ml-[-8px]"
            style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -8 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="chevron-left" size={24} color="#101928" />
            <Text className="text-[#101928] font-inter text-base ml-1" style={{ color: '#101928', fontSize: 16, marginLeft: 4 }}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 }}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          
          <Text className="font-inter font-medium text-sm text-[#101928] uppercase mb-4">
            Choose Request Type
          </Text>

          {/* Radio Options List */}
          <RadioOption 
            title="Extra Hours"
            description="Additional work hours beyond your regular shift"
            selected={requestType === 'Extra Hours'}
            onPress={() => setRequestType('Extra Hours')}
          />
          
          <RadioOption 
            title="Interstate Trip"
            description="Travel across state lines during this trip"
            selected={requestType === 'Interstate Trip'}
            onPress={() => setRequestType('Interstate Trip')}
          />
          
          <RadioOption 
            title="Off Day"
            description="Working on your scheduled off day"
            selected={requestType === 'Off Day'}
            onPress={() => setRequestType('Off Day')}
          />

          {/* Horizontal Divider */}
          <View className="h-[1px] bg-[#E4E7EC] w-full mt-2 mb-7" />

          {/* Dynamic Input Field: Only shows if "Extra Hours" is selected */}
          {requestType === 'Extra Hours' && (
            <View>
              <Text className="font-inter font-medium text-[#101928] text-sm mb-2">
                Number of Extra Hours
              </Text>
              <TextInput 
                className="h-[52px] border border-[#D0D5DD] rounded-xl px-4 font-inter text-base text-[#101928] bg-white"
                placeholder="2hrs"
                placeholderTextColor="#98A2B3"
                value={extraHours}
                onChangeText={(value) => setExtraHours(value.replace(/[^0-9]/g, ''))}
                keyboardType="numeric" // Opens the number pad automatically
              />
            </View>
          )}

        </ScrollView>

        <View className="px-6 pb-12 pt-4 bg-[#F8FAFC]">
          <TouchableOpacity 
            activeOpacity={0.8}
            className="w-full bg-[#0673FF] h-[52px] rounded-xl flex-row items-center justify-center shadow-sm"
            onPress={handleContinue}
          >
            <Text className="text-white font-inter font-medium text-base mr-2">
              Continue
            </Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
