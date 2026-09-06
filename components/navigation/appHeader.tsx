import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '@/store/cartStore';
import { UserDropdown } from '@/components/navigation/userDropdown';
import { CustomIcon } from '@/icons/customIcon';
import { colors } from '@/lib/theme/colors';

export interface AppHeaderProps {
  onMenuPress: () => void;
}

export function AppHeader({ onMenuPress }: AppHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const totalItems = useCartStore((s) => s.getTotalItems());


  return (
    <View
      className="border-b border-gray-100 bg-white px-4 pb-3"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <View className="flex-row items-center">
        <Pressable onPress={onMenuPress} hitSlop={8} className="mr-3">
          <CustomIcon name="MaterialSymbolsMenu" width={24} height={24} color={colors.black} />
        </Pressable>

        {/* Location button */}
        <Pressable
          onPress={() => router.push('/modal/location')}
          hitSlop={8}
          className="ml-auto mr-4"
        >
          <CustomIcon name="AkarIconsLocation" width={22} height={22} color={colors.primary} />
        </Pressable>

        <UserDropdown />

        <Pressable
          onPress={() => router.push('/(checkout)/cart1')}
          hitSlop={8}
          className="relative ml-4"
        >
          <CustomIcon name="TablerShoppingCart" width={26} height={26} color={colors.black} />
          {totalItems > 0 && (
            <View className="absolute -right-2 -top-1 h-5 w-5 items-center justify-center rounded-full bg-error">
              <Text className="text-[10px] font-bold text-white">
                {totalItems > 99 ? '99+' : totalItems}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

     
    </View>
  );
}

export default AppHeader;
