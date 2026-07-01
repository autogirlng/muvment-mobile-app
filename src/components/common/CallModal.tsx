import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TouchableWithoutFeedback,
  Linking,
  Alert
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

interface CallModalProps {
  visible: boolean;
  onClose: () => void;
  phoneNumber: string;
}

export const CallModal: React.FC<CallModalProps> = ({ visible, onClose, phoneNumber }) => {
  
  const handleNormalCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
    onClose();
  };

  const handleWhatsAppCall = async () => {
    // Remove spaces or special characters for the WhatsApp URI
    const formattedNumber = phoneNumber.replace(/[^0-9+]/g, '');
    const url = `whatsapp://send?phone=${formattedNumber}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device.');
      }
    } catch (error) {
      console.error('An error occurred', error);
    }
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Background Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/40 justify-end">
          
          {/* Modal Content container (Prevents touch events from bubbling to overlay) */}
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-[32px] pt-8 pb-10 px-6 items-center shadow-lg">
              
              <Text className="text-[#101928] font-inter font-semibold text-[15px] mb-7">
                Select a call option to continue
              </Text>

              <View className="flex-row justify-center w-full">
                
                {/* Normal Call Option */}
                <View className="items-center mr-16">
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={handleNormalCall}
                    className="w-[62px] h-[62px] rounded-md bg-[#233250] items-center justify-center shadow-sm"
                  >
                    <Ionicons name="call" size={36} color="#FFFFFF"/>
                  </TouchableOpacity>
                  <Text className="font-inter text-[13px] text-[#667185] mt-5">
                    Normal Call
                  </Text>
                </View>

                {/* WhatsApp Call Option */}
                <View className="items-center">
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={handleWhatsAppCall}
                    className="w-[62px] h-[62px] bg-white border border-[#E4E7EC] rounded-md items-center justify-center shadow-sm"
                  >
                    <FontAwesome name="whatsapp" size={40} color="#25D366" />
                  </TouchableOpacity>
                  <Text className="font-inter text-[13px] text-[#667185] mt-5">
                    WhatsApp Call
                  </Text>
                </View>

              </View>
            </View>
          </TouchableWithoutFeedback>

        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
