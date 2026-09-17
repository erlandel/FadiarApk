import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  View,
  Text,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { MaterialIconThemeDependenciesUpdate } from '@/icons/custom';
import { buildImageUrl } from '@/lib/api/config';
import useAuthStore from '@/store/authStore';
import useImgFileStore from '@/store/imgFileStore';

export default function AvatarPreview() {
  const { auth } = useAuthStore();
  const { pendingAvatar, avatarVersion, setPendingAvatar } =
    useImgFileStore();

  const [isPicking, setIsPicking] = useState(false);

  const avatarSrc = (() => {
    if (pendingAvatar?.uri) {
      return pendingAvatar.uri;
    }
    if (auth?.user?.img) {
      const imageUrl = buildImageUrl(auth.user.img);
      const separator = imageUrl.includes('?') ? '&' : '?';
      return `${imageUrl}${separator}v=${avatarVersion}`;
    }
    return null;
  })();

  const handleSelectImage = async () => {
    try {
      setIsPicking(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso requerido',
          'Necesitas permitir el acceso a tus fotos para seleccionar un avatar.',
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset?.uri) {
        return;
      }

      const avatarFile = {
        uri: asset.uri,
        name:
          asset.fileName ??
          `avatar-${Date.now()}.jpg`,
        type:
          asset.mimeType ??
          'image/jpeg',
      };

      setPendingAvatar(avatarFile);
    } catch (error) {
      console.error(
        'Error al seleccionar avatar:',
        error,
      );
      Alert.alert(
        'Error',
        'No se pudo seleccionar la imagen.',
      );
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <View className="items-center">
      <View>
        <Text className="text-2xl font-bold text-primary text-center">
          Avatar  
        </Text>
      </View>
      <View className="relative mt-1">
        <View className="h-40 w-40 overflow-hidden rounded-full bg-gray-100">
          {avatarSrc ? (
            <Image
              source={{ uri: avatarSrc }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('@/assets/images/avatar.webp')}
              className="h-full w-full"
              resizeMode="cover"
            />
          )}
        </View>

        <Pressable
          onPress={handleSelectImage}
          disabled={isPicking}
          className="absolute bottom-0 right-0 h-11 w-11 items-center justify-center rounded-full bg-[#F5A51D]"
          hitSlop={8}
        >
          {isPicking ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <MaterialIconThemeDependenciesUpdate
              width={22}
              height={22}
              color="#FFFFFF"
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}
