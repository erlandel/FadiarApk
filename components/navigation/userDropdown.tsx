import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/data/services/auth.service';
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
  if (name === 'NextUilExit')
    return <CustomIcon name="NextUilExit" width={20} height={20} color={colors.muted} />;
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
    await logout(auth?.refresh_token);
    toastSuccess('Sesión cerrada con éxito');
    router.replace('/(tabs)');
  };

  const items: Item[] = auth?.access_token
    ? [
        {
          label: 'Mi perfil',
          icon: 'UserCircle',
          onPress: () => {
            setIsOpen(false);
            router.push('/(tabs)/profile' as any);
          },
        },
        {
          label: 'Mis pedidos',
          icon: 'NextUilExit',
          onPress: () => {
            setIsOpen(false);
            router.push('/(tabs)/orders' as any);
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
            router.push('/(auth)/login');
          },
        },
        {
          label: 'Registrarse',
          icon: 'MdiRegister',
          onPress: () => {
            setIsOpen(false);
            router.push('/(auth)/register');
          },
        },
      ];

  return (
    <View className="relative z-50" style={{ zIndex: 100, elevation: 100 }}>
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
              zIndex: 0,
            }}
          />
          <View
            className="absolute top-10 right-0 z-50 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg"
            style={{ zIndex: 1, elevation: 8 }}>
            {items.map((item) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                className="active:bg-surface flex-row items-center gap-2 rounded-lg p-3">
                <ItemIcon name={item.icon} />
                <Text
                  className={
                    item.destructive
                      ? 'text-error text-sm font-medium'
                      : 'text-muted text-sm font-medium'
                  }>
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
