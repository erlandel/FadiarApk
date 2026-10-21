import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { buildImageUrl } from '@/lib/api/config';
import { colors } from '@/lib/theme/colors';
import { Icon } from '@/icons/lucideIcon';
import { CustomIcon } from '@/icons/customIcon';
import { openWhatsAppHelp } from '@/utils/whatsapp';
import { cn } from '@/utils/cn';
import { useOrderNote } from '@/hooks/orders/useOrderNote';
import { useOrderProducts } from '@/hooks/orders/useOrderProducts';
import { thumbHashToPreview } from '@/utils/thumbHash';
import type { Order, OrderProduct } from '@/types/order';

const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
  Confirmado: { bg: '#2BD530', label: 'Confirmado' },
  'En espera': { bg: '#EAB308', label: 'En espera' },
  Cancelado: { bg: '#D52B2E', label: 'Cancelado' },
};

export interface OrderCardProps {
  order: Order;
  onInfo: (order: Order) => void;
  onCancel: (order: Order) => void;
  isCancelling?: boolean;
}

export function OrderCard({ order, onInfo, onCancel, isCancelling = false }: OrderCardProps) {
  const [open, setOpen] = useState(false);
  const orderId = String(order.id);
  const status = STATUS_STYLES[order.status] ?? { bg: colors.muted, label: order.status };
  const isDelivery = Boolean(order.direccion?.trim());

  const productsQuery = useOrderProducts(orderId, open && !order.products?.length);
  const notesQuery = useOrderNote(orderId, open && !order.nota?.length);

  const products = order.products?.length ? order.products : (productsQuery.data ?? []);
  const notes = order.nota?.length ? order.nota : (notesQuery.data ?? []);
  const orderNumber = formatOrderNumber(order.codigo || order.id);

  return (
    <Animated.View
      layout={LinearTransition.duration(250)}
      className={cn(
        'overflow-hidden rounded-3xl border shadow-sm',
        open ? 'border-[#123763] bg-[#082343]' : 'border-snow bg-surface'
      )}>
      <View className={cn('p-6', open ? 'bg-[#082343]' : 'bg-surface')}>
        <View
          className={cn(
            'flex-row items-center justify-between border-b pb-4',
            open ? 'border-white/10' : 'border-[#E1E5EB]'
          )}>
          <View className="flex-1">
            <Text
              className={cn(
                'text-sm font-semibold tracking-wider uppercase',
                open ? 'text-blue-200/80' : 'text-muted'
              )}>
              Detalle del pedido
            </Text>
            <View className="mt-0.5 flex-row items-baseline gap-2">
              <Text className={cn('text-md font-medium', open ? 'text-slate-300' : 'text-muted')}>
                Pedido
              </Text>
              <Text
                className={cn(
                  'text-xl font-bold tracking-tight',
                  open ? 'text-white' : 'text-primary'
                )}>
                {orderNumber}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setOpen((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={open ? 'Cerrar pedido' : 'Abrir pedido'}
            className={cn(
              'h-9 w-9 items-center justify-center rounded-full border',
              open ? 'border-white/10 bg-white/10' : 'border-[#CBD5E1] bg-white'
            )}>
            <Icon
              name={open ? 'X' : 'Plus'}
              size={18}
              color={open ? colors.white : colors.primary}
            />
          </Pressable>
        </View>

        <View className="gap-3 py-4">
          <InfoRow label="Fecha" value={order.date || '-'} onDark={open} />
          <InfoRow label="Hora" value={order.time || '-'} onDark={open} />
          <InfoRow
            label="Teléfono"
            value={order.client_cell?.startsWith('+') ? order.client_cell : 'no disponible'}
            onDark={open}
          />
          <InfoRow label="Estado" onDark={open}>
            <View style={{ backgroundColor: status.bg }} className="rounded-full px-4 py-1.5">
              <Text className="text-md font-semibold text-white">{status.label}</Text>
            </View>
          </InfoRow>
        </View>

        <View
          className={cn('mt-2 gap-3 border-t pt-4', open ? 'border-white/10' : 'border-[#E1E5EB]')}>
          <ActionRow label="Información" onDark={open}>
            <ActionButton
              onPress={() => onInfo(order)}
              accessibilityLabel="Ver información"
              onDark={open}>
              <CustomIcon
                name="ChatBubbleEllipsis"
                width={22}
                height={22}
                color={open ? colors.white : colors.primary}
              />
            </ActionButton>
          </ActionRow>
          <ActionRow label="Ayuda" onDark={open}>
            <ActionButton
              onPress={() => openWhatsAppHelp(order.codigo || order.id)}
              accessibilityLabel="Solicitar ayuda por WhatsApp"
              onDark={open}>
              <CustomIcon
                name="WhatsApp"
                width={22}
                height={22}
                color={open ? colors.white : colors.primary}
              />
            </ActionButton>
          </ActionRow>
          <ActionRow label="Acciones" onDark={open}>
            <ActionButton
              onPress={() => onCancel(order)}
              accessibilityLabel="Cancelar pedido"
              onDark={open}
              destructive>
              {isCancelling ? (
                <ActivityIndicator color={open ? '#FDA4AF' : colors.error} />
              ) : (
                <Icon name="Trash2" size={22} color={open ? '#FDA4AF' : colors.error} />
              )}
            </ActionButton>
          </ActionRow>
        </View>
      </View>

      {open ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          className="bg-surface rounded-b-3xl px-5 py-6">
          <View className="border-snow gap-3 border-b pb-4">
            <DetailRow
              label="Método de entrega"
              value={isDelivery ? 'Domicilio' : 'Recogida en tienda'}
            />
            <DetailRow label="Método de pago" value={order.tipo_pago || '-'} />
            <DetailRow label="Provincia" value={order.provincia_completa?.provincia || '-'} />
            <DetailRow label="Municipio" value={order.municipio_completo?.municipio || '-'} />
            <DetailRow label="Tienda" value={order.tienda?.name || '-'} />
            <DetailRow label="Dirección de la tienda" value={order.tienda?.direccion || '-'} />
            <DetailRow label="Nombre" value={order.client_name || 'No disponible'} />
            <DetailRow label="Apellidos" value={order.client_last_names || 'No disponible'} />
            {isDelivery ? <DetailRow label="Dirección" value={order.direccion || '-'} /> : null}

            {notesQuery.isFetching || notes.length > 0 ? (
              <View className="mt-2 gap-2">
                <Text className="text-primary text-lg font-bold tracking-wider">
                  Nota del pedido
                </Text>
                {notesQuery.isFetching ? (
                  <Text className="text-text text-lg font-bold italic">Cargando nota...</Text>
                ) : (
                  notes.map((note, index) => (
                    <Text
                      key={`${note.id}-${index}`}
                      className="text-text text-lg font-bold italic">
                      {index + 1}. {note.message}
                    </Text>
                  ))
                )}
              </View>
            ) : null}
          </View>

          {productsQuery.isFetching ? (
            <View className="items-center py-6">
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : products.length > 0 ? (
            <View style={{ marginTop: 8 }}>
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                contentContainerStyle={{ paddingTop: 0 }}
                style={{ maxHeight: 400 }}>
                <View className="gap-3">
                  {products.map((product, index) => (
                    <OrderProductCard key={`${product.name}-${index}`} product={product} />
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : (
            <Text className="text-muted mt-4 py-2 text-center text-lg">
              No hay productos para mostrar
            </Text>
          )}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function InfoRow({
  label,
  value,
  onDark,
  children,
}: {
  label: string;
  value?: string;
  onDark: boolean;
  children?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center">
      <Text
        className={cn('text-md w-[43%] font-medium', onDark ? 'text-[#CBD5E1]' : 'text-[#64748B]')}>
        {label}
      </Text>
      <View className="flex-1 items-end">
        {children ?? (
          <Text
            className={cn(
              'text-md text-right font-semibold',
              onDark ? 'text-[#F1F5F9]' : 'text-[#334155]'
            )}>
            {value}
          </Text>
        )}
      </View>
    </View>
  );
}

function ActionRow({
  label,
  onDark,
  children,
}: {
  label: string;
  onDark: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className={cn('text-md font-medium', onDark ? 'text-[#CBD5E1]' : 'text-[#64748B]')}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function ActionButton({
  onPress,
  accessibilityLabel,
  onDark,
  destructive = false,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  onDark: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'h-10 w-10 items-center justify-center rounded-xl border shadow-sm active:opacity-80',
        destructive
          ? onDark
            ? 'border-red-500/20 bg-red-500/10'
            : 'border-red-200 bg-red-50'
          : onDark
            ? 'border-white/10 bg-white/10'
            : 'border-[#D1D5DB] bg-white'
      )}>
      {children}
    </Pressable>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <View className="flex-row items-start justify-between gap-3">
      <Text className="text-primary w-[43%] shrink-0 text-lg font-bold tracking-wider">
        {label}
      </Text>
      <Text className="text-text flex-1 text-right text-lg font-bold">{value || '-'}</Text>
    </View>
  );
}

function OrderProductCard({ product }: { product: OrderProduct }) {
  const [imageSourceIndex, setImageSourceIndex] = useState(0);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const imageSources = getOrderImageSources(product);
  const imageUri = imageSources[imageSourceIndex] ?? null;
  const salePrice =
    product.temporal_price && Number(product.temporal_price) !== 0
      ? product.temporal_price
      : product.price;

  return (
    <View className="bg-surface flex-row rounded-xl border border-gray-200 p-3">
      <View className="h-32 w-28 shrink-0 overflow-hidden rounded-xl bg-white">
        {imageUri && !imageUnavailable ? (
          <Image
            source={{ uri: imageUri }}
            className="h-full w-full"
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={150}
            onError={() => {
              if (imageSourceIndex < imageSources.length - 1) {
                setImageSourceIndex((index) => index + 1);
                setImageUnavailable(false);
              } else {
                setImageUnavailable(true);
              }
            }}
          />
        ) : (
          <View className="h-full w-full items-center justify-center px-2">
            <Icon name="Image" size={42} color={colors.muted} />
            <Text className="text-muted mt-1 text-center text-xs">Imagen no disponible</Text>
          </View>
        )}
      </View>
      <View className="ml-3 min-w-0 flex-1 justify-center">
        <Text numberOfLines={2} className="text-primary text-lg font-bold">
          {product.name}
        </Text>
        <Text numberOfLines={1} className="text-primary text-lg">
          {product.brand}
        </Text>
        <Text className="text-muted text-lg">Cantidad: {product.count}</Text>
        <Text className="text-primary text-lg font-bold">
          $ {salePrice} {product.currency?.currency ?? 'USD'}
        </Text>
      </View>
    </View>
  );
}

function getOrderImageSources(product: OrderProduct): string[] {
  const paths = [
    product.img,
    product.image,
    product.image_url,
    product.img_web,
    product.preview_img_web,
  ].filter((path): path is string => Boolean(path && path.trim()));
  const imageSources = paths.flatMap(buildOrderImageCandidates);
  const preview = thumbHashToPreview(product.preview_img);

  if (preview) {
    imageSources.push(preview);
  } else if (product.preview_img?.trim()) {
    imageSources.push(...buildOrderImageCandidates(product.preview_img));
  }

  return Array.from(new Set(imageSources));
}

function buildOrderImageCandidates(path: string): string[] {
  const url = buildImageUrl(path, 480);
  const withoutApiPrefix = url.replace('/api/', '/');
  return withoutApiPrefix === url ? [url] : [url, withoutApiPrefix];
}

function formatOrderNumber(value: string | number) {
  const text = String(value);
  return text.startsWith('#') ? text : `#${text}`;
}
