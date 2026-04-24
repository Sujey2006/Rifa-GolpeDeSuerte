import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

const CLOUDINARY_CLOUD_NAME = 'dyxwdyqcz';
const CLOUDINARY_UPLOAD_PRESET = 'golpe_de_suerte_preset';

export const requestImagePermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso denegado', '"Golpe de Suerte" necesita permisos para acceder a tu galería.');
    return false;
  }
  return true;
};

export const pickImage = async () => {
  try {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Error al elegir imagen:', error);
    return null;
  }
};

export const uploadImageToCloudinary = async (imageUri) => {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Credenciales de Cloudinary no configuradas.');
    }

    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al subir a Cloudinary');
    }

    return data.secure_url;

  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

/**
 * Función de conveniencia que elige y sube la imagen en un solo paso.
 */
export const selectAndUploadImage = async () => {
    try {
        const image = await pickImage();
        if (!image) return null;
        const url = await uploadImageToCloudinary(image.uri);
        return url;
    } catch (error) {
        console.error(error);
        return null;
    }
};
