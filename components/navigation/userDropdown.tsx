import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { toastSuccess } from '@/messages/toast';
import { Icon } from '@/icons/lucideIcon';
import { CustomIcon } from '@/icons/customIcon';
import { colors } from '@/lib/theme/colors';

type Item = {
  label: string;
  onPress: () => void;
  icon: 'UserCircle' | 'NextUilExit' | 'UilExit' | 'MdiRegister';
  destructive?: boolean;
};

function ItemIcon({ name }: { name: Item['icon'] }) {
  if (name === 'UserCircle') return <Icon name="CircleUser" size={20} color={colors.muted} />;
  if (name === 'NextUilExit') return <CustomIcon name="NextUilExit" width={20} height={20} color={colors.muted} />;
  if (name === 'UilExit') return <Icon name="LogOut" size={20} color="#EB0C0C" />;
  if (name === 'MdiRegister')
    return <CustomIcon name="MdiRegister" width={20} height={20} color={colors.muted} />;
  return <Icon name="UserRoundPlus" size={20} color={colors.muted} />;
}

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const auth = useAuthStore((s) => s.auth);

  const handleLogout = async () => {
    setIsOpen(false);
    if (auth?.access_token && auth?.refresh_token) {
      try {
        await apiClient.post(ENDPOINTS.logout, {
          refresh_token: auth.refresh_token,
        });
      } catch (error) {
        console.error('Error al cerrar sesión en el servidor:', error);
      }
    }
    useAuthStore.getState().clearAuth();
    useCartStore.getState().clearCart();
    toastSuccess('Sesión cerrada con éxito');
    router.replace('/(auth)/login');
  };

  const items: Item[] = auth?.access_token
    ? [
        {
          label: 'Mi perfil',
          icon: 'UserCircle',
          onPress: () => {
            setIsOpen(false);
            router.push('/(tabs)/profile');
          },
        },
        {
          label: 'Mis pedidos',
          icon: 'NextUilExit',
          onPress: () => {
            setIsOpen(false);
            router.push('/(tabs)/orders');
          },
        },
        {
          label: 'Cerrar sesión',
          icon: 'UilExit',
          destructive: true,
          onPress: handleLogout,
        },
      ]
    : [
        {
          label: 'Iniciar sesión',
          icon: 'NextUilExit',
          onPress: () => {
            setIsOpen(false);
            router.replace('/(auth)/login');
          },
        },
        {
          label: 'Registrarse',
          icon: 'MdiRegister',
          onPress: () => {
            setIsOpen(false);
            router.replace('/(auth)/register');
          },
        },
      ];

  return (
    <View className="relative z-50">
      <Pressable onPress={() => setIsOpen((v) => !v)} hitSlop={8}>
        {auth?.access_token ? (
          <CustomIcon name="HugeiconsUserAi" width={24} height={24} color={colors.black} />
        ) : (
          <Icon name="CircleUser" size={24} color={colors.black} />
        )}
      </Pressable>

      {isOpen ? (
        <>
          <Pressable
            accessibilityLabel="Cerrar menú de usuario"
            onPress={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: -1000,
              left: -1000,
              right: -1000,
              bottom: -1000,
              zIndex: 40,
            }}
          />
          <View className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
            {items.map((item) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                className="flex-row items-center gap-2 rounded-lg p-3 active:bg-surface"
              >
                <ItemIcon name={item.icon} />
                <Text
                  className={
                    item.destructive
                      ? 'text-sm font-medium text-error'
                      : 'text-sm font-medium text-muted'
                  }
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

export default UserDropdown;
