import { ScrollView, Text, View } from 'react-native';
import { ProtectedScreen } from '@/components/navigation/protectedScreen';
import PersonalData from '@/components/profile/personalData';
import useAuthStore from '@/store/authStore';

export default function ProfileScreen() {
  const auth = useAuthStore((state) => state.auth);
  const userName = auth?.person?.name || 'Usuario';

  return (
    <ProtectedScreen>
      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mx-4 pb-10 pt-8">
            <View>
              <Text className="text-3xl font-bold text-primary">
                Mi Perfil
              </Text>

              <Text className="mt-2 text-lg font-semibold text-[#777777]">
                Hola, {userName} puedes gestionar y configurar tu cuenta.
              </Text>
            </View>

            <View className="mt-10">
              <PersonalData />
            </View>
          </View>
        </ScrollView>
      </View>
    </ProtectedScreen>
  );
}
