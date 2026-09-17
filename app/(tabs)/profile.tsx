import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedScreen } from '@/components/navigation/protectedScreen';
import PersonalData from '@/components/profile/personalData';
import { logout } from '@/data/services/auth.service';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';
import { toastSuccess } from '@/messages/toast';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const auth = useAuthStore((state) => state.auth);
  const userName = auth?.person?.name || 'Usuario';

  const handleLogout = async () => {
    await logout(auth?.refresh_token);
    toastSuccess('Sesión cerrada con éxito');
    router.replace('/(tabs)');
  };

  return (
    <ProtectedScreen>
      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View className="mx-4 pt-8 pb-100">
            <View>
              <Text className="text-primary text-3xl font-bold">Mi Perfil</Text>

              <Text className="mt-2 text-lg font-semibold text-[#777777]">
                Hola, {userName} puedes gestionar y configurar tu cuenta.
              </Text>
            </View>

            <View className="mt-10">
              <PersonalData />
            </View>

            <Pressable
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              className="border-error mt-10 flex-row items-center justify-center gap-2 rounded-xl border py-4 active:bg-red-50">
              <Icon name="LogOut" size={20} color={colors.error} />
              <Text className="text-error text-base font-bold">Cerrar sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ProtectedScreen>
  );
}
