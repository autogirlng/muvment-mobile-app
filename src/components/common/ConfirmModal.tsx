import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Submit',
  confirmVariant = 'primary'
}) => {
  const confirmButtonClassName = confirmVariant === 'danger' ? 'bg-[#E32636]' : 'bg-[#0673FF]';

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-3xl p-6 w-full items-center shadow-xl">
          
          <Text className="text-[18px] font-inter font-bold text-[#101928] mb-3">
            {title}
          </Text>
          
          <Text className="text-[#475367] font-inter text-[14px] text-center mb-8 leading-5">
            {message}
          </Text>

          <View className="flex-row gap-3 w-full">
            <TouchableOpacity 
              onPress={onClose}
              className="flex-1 h-12 rounded-xl border border-[#E4E7EC] items-center justify-center"
            >
              <Text className="font-inter font-medium text-[#475367]">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onConfirm}
              className={`flex-1 h-12 rounded-xl ${confirmButtonClassName} items-center justify-center`}
            >
              <Text className="font-inter font-medium text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
