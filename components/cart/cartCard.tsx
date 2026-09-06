import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { buildImageUrl } from '@/lib/api/config';
import { colors } from '@/lib/theme/colors';
import { formatCountdown } from '@/utils/format';
import { useClockStore } from '@/store/clockStore';
import { Icon } from '@/icons/lucideIcon';
import { cn } from '@/utils/cn';

export interface CartCardProps {
  title: string;
  brand?: string;
  price: string;
  temporalPrice?: string;
  image: string;
  quantity: number;
  currency?: string;
  cartId?: string | number;
  productId: string;
  tiendaId?: string;
  expiryTimestamp?: number;
  onUpdateQuantity?: (cartId: string | number, qty: number) => void;
  onDelete?: (cartId: string | number) => void;
  readonly?: boolean;
}

export function CartCard({
  title,
  brand,
  price,
  temporalPrice,
  image,
  quantity,
  currency = 'USD',
  cartId,
  productId,
  expiryTimestamp,
  onUpdateQuantity,
  onDelete,
  readonly = false,
}: CartCardProps) {
  const currentTime = useClockStore((s) => s.currentTime);
  const hasDiscount = !!temporalPrice && Number(temporalPrice) > 0 && Number(temporalPrice) !== 0;

  return (
    <View className="flex-row rounded-2xl border border-gray-300 bg-white p-3 shadow-sm">
      <View className="h-[110px] w-24 overflow-hidden rounded-2xl bg-surface">
        <Image source={{ uri: buildImageUrl(image) }} className="h-full w-full" contentFit="contain" />
      </View>

      <View className="ml-3 flex-1">
        <Text numberOfLines={1} className="text-base font-bold text-primary">
          {title}
        </Text>
        {brand ? <Text className="text-base text-primary">{brand}</Text> : null}

        <View className="mt-1 flex-row items-baseline">
          <Text className="text-lg font-bold text-primary">
            $ {hasDiscount ? temporalPrice : price}{' '}
          </Text>
          <Text className="text-sm text-primary">{currency}</Text>
        </View>

        {expiryTimestamp ? (
          <Text
            className={cn(
              'mt-1 text-sm font-semibold',
              expiryTimestamp - currentTime <= 60000 ? 'text-error' : 'text-primary',
            )}
          >
            ⏱ {formatCountdown(expiryTimestamp, currentTime)}
          </Text>
        ) : null}

        <View className="mt-2 flex-row items-center justify-between">
          {readonly ? (
            <Text className="text-sm text-muted">Cantidad: {quantity}</Text>
          ) : (
            <View className="flex-row items-center rounded-lg border border-primary">
              <Pressable
                onPress={() => onUpdateQuantity?.(cartId!, quantity - 1)}
                className="px-3 py-1.5"
              >
                <Text className="text-lg font-bold text-accent">−</Text>
              </Pressable>
              <Text className="border-x border-primary px-3 text-base font-bold text-primary">
                {quantity}
              </Text>
              <Pressable
                onPress={() => onUpdateQuantity?.(cartId!, quantity + 1)}
                className="px-3 py-1.5"
              >
                <Text className="text-lg font-bold text-accent">+</Text>
              </Pressable>
            </View>
          )}

          {!readonly && onDelete ? (
            <Pressable onPress={() => onDelete(cartId!)} hitSlop={8}>
              <Icon name="Trash2" size={22} color={colors.text} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}