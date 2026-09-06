import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ModalProductsByLocation } from 'components/modal/modalProductsByLocation';

export default function LocationModalScreen() {
  const router = useRouter();

  const close = () => router.back();

  return (
    <View className="flex-1">
      <View className="absolute inset-0 bg-black opacity-60" />
      <Pressable className="absolute inset-0" onPress={close} />

      <View className="w-full items-center px-4 pt-16">
        <ModalProductsByLocation onClose={close} />
      </View>
    </View>
  );
}