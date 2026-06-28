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
import { LinearGradient } from 'expo-linear-gradient';

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
            <View className="bg-white rounded-t-[32px] pt-8 pb-12 px-6 items-center shadow-lg">
              
              <Text className="text-[#101928] font-inter font-semibold text-[17px] mb-8">
                Select a call option to continue
              </Text>

              <View className="flex-row justify-center space-x-8 w-full px-4">
                
                {/* Normal Call Option */}
                <View className="items-center mx-4">
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={handleNormalCall}
                    className="w-15 h-15 rounded-[20px] overflow-hidden shadow-sm"
                  >
                    <LinearGradient
                      colors={['#516C9F', '#1D2739']}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      className="w-full h-full items-center justify-center"
                    >
                      <Ionicons name="call" size={32} color="#FFFFFF"/>
                    </LinearGradient>
                  </TouchableOpacity>
                  <Text className="font-inter text-[13px] text-[#667185] mt-3">
                    Normal Call
                  </Text>
                </View>

                {/* WhatsApp Call Option */}
                <View className="items-center mx-4">
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={handleWhatsAppCall}
                    className="w-15 h-15 bg-white border border-[#E4E7EC] rounded-[15px] items-center justify-center shadow-sm"
                  >
                    <FontAwesome name="whatsapp" size={40} color="#25D366" />
                  </TouchableOpacity>
                  <Text className="font-inter text-[13px] text-[#667185] mt-3">
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
