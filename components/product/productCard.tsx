import { memo, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { buildImageUrl } from '@/lib/api/config';
import { cn } from '@/utils/cn';
import { parsePrice } from '@/utils/format';
import { colors } from '@/lib/theme/colors';
import { Icon } from '@/icons/lucideIcon';
import { useAddToCart } from '@/hooks/cart/useAddToCart';
import { useCartStore } from '@/store/cartStore';
import { toastWarning } from '@/messages/toast';
import { QuantityStepper } from '@/components/product/quantityStepper';
import { CustomIcon } from '@/icons/customIcon';
import { LoadingSpinner } from '@/components/loading/loadingSpinner';

export interface ProductCardProps {
  productId: string;
  title: string;
  brand?: string;
  category?: string;
  warranty?: string;
  price: string;
  temporalPrice?: string;
  image: string;
  count?: number;
  currency?: string;
  tiendaId?: string;
  quantityProducts?: number;
  isPreSale?: boolean;
  position?: 'vertical' | 'horizontal';
}

function resolveImageUri(path?: string | null): string | null {
  if (!path || !String(path).trim()) return null;
  const value = String(path).trim();
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  return buildImageUrl(value.replace(/^\/+/, ''), 240);
}

function ProductCardComponent({
  productId,
  title,
  brand,
  category,
  warranty,
  price,
  temporalPrice,
  image,
  count,
  currency = 'USD',
  tiendaId,
  quantityProducts,
  isPreSale = false,
  position = 'vertical',
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, loading } = useAddToCart();
  const cartItems = useCartStore((state) => state.items);
  const [quantity, setQuantity] = useState(Math.max(1, quantityProducts ?? 1));
  const isInCart = cartItems.some((item) => String(item.productId) === String(productId));
  const imageUri = resolveImageUri(image);
  const imageSources = imageUri ? [imageUri, imageUri.replace('/api/', '/')] : [];
  const [imageSourceIndex, setImageSourceIndex] = useState(0);

  // Keep the selected quantity within the available stock when the card receives a new quantity.
  useEffect(() => {
    if (quantityProducts && quantityProducts > 0) {
      const initialQuantity =
        count !== undefined ? Math.min(quantityProducts, count) : quantityProducts;
      // This effect synchronizes a controlled quantity prop with the card's local quantity.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuantity(Math.max(1, initialQuantity));
    }
  }, [quantityProducts, count]);

  const soldOut = !isPreSale && count === 0;
  const hasDiscount =
    !!temporalPrice && Number(temporalPrice) > 0 && Number(temporalPrice) < Number(price);
  const warrantyNumber = +(warranty ?? '0');

  const goToDetail = () =>
    router.push({
      pathname: '/product/[id]',
      params: { id: productId, tiendaId, preSale: String(isPreSale) },
    });

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (count !== undefined && next > count) {
        if (count === 0) {
          toastWarning('No hay unidades disponibles');
        } else {
          toastWarning(`Solo quedan ${count} unidades disponibles`);
        }
        return prev;
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!productId) return;
    addToCart({ productId, tiendaId, quantity });
  };

  const renderImage = (className: string) =>
    imageUri ? (
      <Image
        source={{ uri: imageSources[imageSourceIndex] ?? imageUri }}
        style={{ width: '100%', height: '100%', backgroundColor: '#F5F7FA' }}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
        onError={(error) => {
          if (imageSourceIndex < imageSources.length - 1) {
            setImageSourceIndex((current) => current + 1);
          } else {
            console.error('Error loading product image:', imageUri, error);
          }
        }}
      />
    ) : (
      <View className={cn(className, 'items-center justify-center')}>
        <Icon name="Image" size={40} color={colors.muted} />
      </View>
    );

  const renderSoldOutRibbon = () =>
    soldOut ? (
      <View className="absolute top-2 -right-11 z-10 w-32 rotate-45 bg-red-600 py-1 shadow-md">
        <Text className="text-center text-[10px] font-bold text-white">Agotado</Text>
      </View>
    ) : null;

  const renderProntoPill = () =>
    isPreSale ? (
      <View className="bg-accent absolute top-2 right-2 z-10 rounded-full px-2 py-0.5">
        <Text className="text-[10px] font-bold text-white">Pronto</Text>
      </View>
    ) : null;

  // Bloque de precio: paridad web (temporal xl 20px bold / anterior 16px tachado)
  const renderPrice = (compact = false) =>
    hasDiscount ? (
      <View className="min-w-0 flex-row flex-wrap items-baseline justify-between gap-x-1 gap-y-1">
        <Text
          className={
            compact
              ? 'text-primary shrink-0 text-base font-bold'
              : 'text-primary shrink-0 text-xl font-bold'
          }>
          ${parsePrice(temporalPrice!).toFixed(2)}{' '}
          <Text className="text-primary text-base font-normal">{currency}</Text>
        </Text>
        <Text className="text-muted min-w-0 shrink truncate text-base line-through">
          ${parsePrice(price).toFixed(2)} {currency}
        </Text>
      </View>
    ) : (
      <View className="flex-row flex-wrap items-baseline gap-2">
        <Text
          className={
            compact ? 'text-primary text-base font-bold' : 'text-primary text-xl font-bold'
          }>
          ${parsePrice(price).toFixed(2)}{' '}
          <Text className="text-primary text-base font-normal">{currency}</Text>
        </Text>
      </View>
    );

  const renderWarranty = () =>
    warrantyNumber > 0 ? (
      <Text className="text-accent text-sm font-medium">
        Garantía de {warrantyNumber / 30} meses
      </Text>
    ) : (
      <View className="h-6" />
    );

  // Stepper + botón carrito con los estados de la web
  const renderActions = (compact = false, horizontal = false) =>
    isPreSale ? null : (
      <View className="flex-row items-center justify-between gap-3 font-bold">
        <QuantityStepper
          quantity={quantity}
          onDecrease={() => adjustQuantity(-1)}
          onIncrease={() => adjustQuantity(1)}
          compact={compact}
          horizontal={horizontal}
          disabled={soldOut}
        />

        <Pressable
          onPress={handleAddToCart}
          disabled={soldOut || loading}
          accessibilityLabel="Añadir al carrito"
          accessibilityState={{ busy: loading, disabled: soldOut || loading }}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: soldOut
              ? colors.surface
              : loading || isInCart
                ? colors.primary
                : colors.white,
            borderColor: soldOut ? colors.gray : colors.primary,
          }}
          className={cn(
            'rounded-xl border',
            horizontal ? 'h-[40px] w-[56px]' : compact ? 'px-3 py-2' : 'px-4 py-2',
            soldOut
              ? 'border-gray-300 bg-gray-100 opacity-50'
              : loading || isInCart
                ? 'border-primary bg-primary'
                : 'border-primary bg-white'
          )}>
          {loading ? (
            <View className="h-5 w-5 items-center justify-center">
              <LoadingSpinner />
            </View>
          ) : (
            <CustomIcon
              name="TablerShoppingCart"
              size={20}
              color={soldOut ? colors.muted : loading || isInCart ? colors.white : colors.primary}
            />
          )}
        </Pressable>
      </View>
    );

  // Card horizontal: misma estructura que la web (h-48 / max-w-115 / imagen w-30)
  if (position === 'horizontal') {
    return (
      <Pressable
        onPress={goToDetail}
        className="min-h-48 w-full max-w-115 flex-row gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
        <View className="relative h-44 w-30 shrink-0 overflow-hidden rounded-2xl bg-gray-50">
          {renderSoldOutRibbon()}
          {renderImage('h-full w-full')}
        </View>

        <View className="min-w-0 flex-1 flex-col justify-between">
          <View>
            {category ? (
              <Text numberOfLines={1} className="text-muted text-sm">
                {category}
              </Text>
            ) : null}
            <Text numberOfLines={2} className="text-primary mb-1 text-base font-bold">
              {title}
            </Text>
          </View>

          <View className="flex-col justify-end gap-1">
            {brand ? (
              <Text numberOfLines={1} className="text-primary text-sm">
                {brand}
              </Text>
            ) : null}
            {renderWarranty()}
            {renderPrice(true)}
            <View className="mt-1 w-full">{renderActions(true, true)}</View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Card vertical: medidas literales de la web (h-120 = 480px / max-w-55 = 220px / imagen 190px)
  return (
    <Pressable
      onPress={goToDetail}
      className="h-120 w-full max-w-57 flex-col justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <View className="relative h-47.5 w-full shrink-0 overflow-hidden rounded-2xl bg-gray-50">
        {renderSoldOutRibbon()}
        {renderProntoPill()}
        {renderImage('h-full w-full')}
      </View>

      <View className="min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        {category ? (
          <Text numberOfLines={1} className="text-muted text-sm">
            {category}
          </Text>
        ) : null}
        <Text numberOfLines={2} className="text-primary text-lg font-semibold">
          {title}
        </Text>
      </View>

      <View className="flex-col gap-3">
        {brand ? (
          <Text numberOfLines={1} className="text-primary text-base">
            {brand}
          </Text>
        ) : null}
        {renderWarranty()}
        {renderPrice()}
        {renderActions()}
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);
