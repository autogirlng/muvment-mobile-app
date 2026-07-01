import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

export const openMapForAddress = async (address: string) => {
  const trimmedAddress = address.trim();

  if (!trimmedAddress) {
    Toast.show({
      type: 'errorToast',
      text1: 'Address unavailable',
      text2: 'There is no location to open in Maps.',
      position: 'top',
      topOffset: 60,
    });
    return;
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedAddress)}`;

  try {
    await Linking.openURL(mapsUrl);
  } catch {
    Toast.show({
      type: 'errorToast',
      text1: 'Could not open Maps',
      text2: 'Please try again or enter the address manually.',
      position: 'top',
      topOffset: 60,
    });
  }
};

export const capturePhoto = async () => {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Toast.show({
        type: 'errorToast',
        text1: 'Camera permission needed',
        text2: 'Allow camera access to capture checklist photos.',
        position: 'top',
        topOffset: 60,
      });
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled) return null;

    return result.assets[0]?.uri ?? null;
  } catch {
    Toast.show({
      type: 'errorToast',
      text1: 'Camera unavailable',
      text2: 'Unable to open the camera right now.',
      position: 'top',
      topOffset: 60,
    });
    return null;
  }
};
