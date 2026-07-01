import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface DropdownMenuProps {
  visible: boolean;
  options: string[];
  onSelect: (option: string) => void;
  onClose: () => void;
  top?: number;
  right?: number;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  visible,
  options,
  onSelect,
  onClose,
  top = 100, // Fallback positions
  right = 20,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Invisible overlay that closes the modal when tapping outside */}
      <TouchableOpacity 
        style={{ flex: 1 }} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View 
          className="absolute bg-white rounded-2xl shadow-xl border border-[#E4E7EC] py-2 w-48"
          style={{ top, right }}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onSelect(option)}
              className="px-5 py-3"
            >
              <Text className="font-inter text-[#101928] text-[15px]">
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};