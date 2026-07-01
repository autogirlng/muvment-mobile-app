import React, { useRef, useState } from 'react';
import { View, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';

interface CustomOTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export const CustomOTPInput: React.FC<CustomOTPInputProps> = ({ length = 6, value, onChange }) => {
  // Create an array of refs to control focus programmatically
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);

  // Convert the single string value into an array of characters for the individual boxes
  const otpArray = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChangeText = (text: string, index: number) => {
    // Only accept the last character if the user pastes or types quickly
    const char = text.length > 0 ? text[text.length - 1] : '';
    
    const newOtpArray = [...otpArray];
    newOtpArray[index] = char;
    
    const newOtpString = newOtpArray.join('');
    onChange(newOtpString);

    // Auto-advance to the next input if a number was typed
    if (char !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    // Auto-focus the previous input if backspace is pressed on an empty box
    if (e.nativeEvent.key === 'Backspace' && otpArray[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      
      // Clear the previous input as well
      const newOtpArray = [...otpArray];
      newOtpArray[index - 1] = '';
      onChange(newOtpArray.join(''));
    }
  };

  return (
    <View className="flex-row justify-between w-full mt-2 mb-6">
      {otpArray.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          className={`w-12 h-12 rounded-xl border text-center text-xl font-inter font-medium text-brand-primary
            ${focusedIndex === index 
              ? 'border-brand-link bg-white' // Active state
              : digit 
                ? 'border-brand-primary bg-white' // Filled state
                : 'border-brand-border bg-white' // Empty state
            }
          `}
          keyboardType="number-pad"
          maxLength={1} // Keep it strictly 1 character per box
          value={digit}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          selectTextOnFocus // Highlights the number when focused so typing replaces it instantly
        />
      ))}
    </View>
  );
};
