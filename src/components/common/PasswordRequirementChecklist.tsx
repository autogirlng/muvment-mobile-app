import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export const getPasswordRequirements = (password: string) => ({
  digit: /\d/.test(password),
  length: password.length >= 8,
  lowercase: /[a-z]/.test(password),
  noSpaces: password.length > 0 && !/\s/.test(password),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  uppercase: /[A-Z]/.test(password),
});

export const isPasswordValid = (password: string) =>
  Object.values(getPasswordRequirements(password)).every(Boolean);

const PasswordRequirementItem = ({
  isValid,
  label,
}: {
  isValid: boolean;
  label: string;
}) => (
  <View className="flex-row items-center mt-2">
    <Feather
      name={isValid ? 'check-circle' : 'circle'}
      size={16}
      color={isValid ? '#039855' : '#98A2B3'}
    />
    <Text
      className={`ml-2 font-inter text-sm ${
        isValid ? 'text-[#039855]' : 'text-brand-secondary'
      }`}
    >
      {label}
    </Text>
  </View>
);

interface PasswordRequirementChecklistProps {
  password: string;
}

export const PasswordRequirementChecklist = ({
  password,
}: PasswordRequirementChecklistProps) => {
  const requirements = getPasswordRequirements(password);

  return (
    <View className="mt-2 mb-8">
      <Text className="text-brand-primary font-inter font-medium text-sm mb-1">
        Password must include at least:
      </Text>
      <PasswordRequirementItem label="8 characters long" isValid={requirements.length} />
      <PasswordRequirementItem label="One uppercase character" isValid={requirements.uppercase} />
      <PasswordRequirementItem label="One lowercase character" isValid={requirements.lowercase} />
      <PasswordRequirementItem label="One digit" isValid={requirements.digit} />
      <PasswordRequirementItem label="One special character" isValid={requirements.special} />
      <PasswordRequirementItem label="Must not include spaces" isValid={requirements.noSpaces} />
    </View>
  );
};
