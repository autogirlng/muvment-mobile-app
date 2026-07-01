// src/components/common/SuccessState.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const defaultSuccessAnimation = require('../../../assets/Success.json');

interface SuccessStateProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonPress: () => void;
  buttonIconName?: keyof typeof Feather.glyphMap;
  animationSource?: React.ComponentProps<typeof LottieView>['source'] | null;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title,
  description,
  buttonText,
  onButtonPress,
  buttonIconName,
  animationSource = defaultSuccessAnimation
}) => {
  return (
    <View
      className="flex-1 px-6"
      style={{ flex: 1, paddingHorizontal: 24, position: 'relative' }}
    >
      <View
        className="items-center justify-center"
        style={{
          position: 'absolute',
          top: 0,
          right: 24,
          bottom: 0,
          left: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View className="w-28 h-28 mb-2 items-center justify-center" style={{ width: 112, height: 112, marginBottom: 8, alignItems: 'center', justifyContent: 'center' }}>
          {animationSource ? (
            <LottieView
              autoPlay
              loop={false}
              style={{ width: '100%', height: '100%' }}
              source={animationSource}
            />
          ) : (
            <View className="w-[75px] h-[75px] rounded-full bg-[#08B82E] items-center justify-center">
              <Feather name="check" size={42} color="#FFFFFF" />
            </View>
          )}
        </View>

        <Text className="text-lg font-inter font-bold text-[#101928] mb-2 text-center" style={{ color: '#101928', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
          {title}
        </Text>
        
        <Text className="text-[#475367] font-inter text-[13px] text-center leading-5 px-4" style={{ color: '#475367', fontSize: 13, lineHeight: 20, textAlign: 'center', paddingHorizontal: 16 }}>
          {description}
        </Text>
      </View>

      <View
        className="w-full"
        style={{
          position: 'absolute',
          right: 24,
          bottom: 40,
          left: 24,
        }}
      >
        <TouchableOpacity 
          activeOpacity={0.8}
          className="w-full bg-[#0673FF] h-[52px] rounded-xl flex-row items-center justify-center shadow-sm"
          style={{ width: '100%', height: 52, borderRadius: 12, backgroundColor: '#0673FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          onPress={onButtonPress}
        >
          {buttonIconName && (
            <Feather name={buttonIconName} size={20} color="#FFFFFF" />
          )}
          <Text className="text-white font-inter font-medium text-base ml-2" style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '500', marginLeft: 8 }}>
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};
