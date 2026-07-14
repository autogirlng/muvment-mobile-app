import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';

export const toastConfig: ToastConfig = {
  successToast: ({ text1, text2 }) => (
    <View className="w-11/12 bg-white rounded-lg shadow-sm border border-gray-100 flex-row items-center overflow-hidden py-3 mt-2 elevation-2">
      <View className="w-1.5 h-full bg-[#12B76A]" />
      <View className="flex-1 flex-row items-center justify-between px-4">
        <View className="flex-row items-center flex-1">
          <View className="w-6 h-6 rounded-full bg-[#D1FADF] items-center justify-center mr-3">
            <Feather name="check" size={14} color="#039855" />
          </View>
          <View className="flex-1 pr-2">
            <Text className="font-inter font-medium text-brand-primary text-sm">
              {text1}
            </Text>
            {text2 && (
              <Text className="font-inter text-[#475367] text-sm mt-0.5">
                {text2}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => Toast.hide()} className="p-1">
          <Feather name="x" size={16} color="#101928" />
        </TouchableOpacity>
      </View>
    </View>
  ),

  // Error toast implementation
  errorToast: ({ text1, text2 }) => (
    <View className="w-11/12 bg-white rounded-lg shadow-sm border border-gray-100 flex-row items-center overflow-hidden py-3 mt-2 elevation-2">
      <View className="w-1.5 h-full absolute left-0 bg-[#D92D20]" />
      <View className="flex-1 flex-row items-start justify-between px-4 ml-1.5">
        <View className="flex-row items-start flex-1">
          <View className="w-6 h-6 rounded-full bg-[#FEE4E2] items-center justify-center mr-3 mt-0.5">
            <Feather name="alert-circle" size={14} color="#D92D20" />
          </View>
          <View className="flex-1 pr-2">
            <Text className="font-inter font-semibold text-brand-primary text-sm">
              {text1}
            </Text>
            {text2 && (
              <Text className="font-inter text-[#475367] text-sm mt-0.5">
                {text2}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => Toast.hide()} className="p-1">
          <Feather name="x" size={16} color="#101928" />
        </TouchableOpacity>
      </View>
    </View>
  ),
};
