import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { buildImageUrl } from '@/lib/api/config';
import { colors } from '@/lib/theme/colors';
import { Icon } from '@/icons/lucideIcon';
import { CustomIcon } from '@/icons/customIcon';
import { openWhatsAppHelp } from '@/utils/whatsapp';
import { cn } from '@/utils/cn';
import type { Order } from '@/types/order';

const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
  Confirmado: { bg: '#2BD530', label: 'Confirmado' },
  'En espera': { bg: '#EAB308', label: 'En espera' },
  Cancelado: { bg: '#D52B2E', label: 'Cancelado' },
};

export interface OrderCardProps {
  order: Order;
  onCancel: (orderId: string) => void;
  isCancelling?: boolean;
}

export function OrderCard({ order, onCancel, isCancelling = false }: OrderCardProps) {
  const [open, setOpen] = useState(false);
  const status = STATUS_STYLES[order.status] ?? { bg: colors.muted, label: order.status };
  const isDelivery = !!order.direccion && order.direccion.trim() !== '';

  return (
    <View className="overflow-hidden rounded-2xl">
      <View
        className={cn('p-4', open ? 'bg-primary' : 'bg-surface')}
      >
        <Pressable onPress={() => setOpen((v) => !v)} className="mb-2 self-end">
          <Icon
            name={open ? 'X' : 'Plus'}
            size={20}
            color={open ? colors.white : colors.muted}
          />
        </Pressable>

        <View className="flex-row flex-wrap gap-y-3">
          <InfoItem label="Pedido" value={`#${order.codigo}`} onDark={open} />
          <InfoItem label="Fecha" value={order.date} onDark={open} />
          <InfoItem label="Hora" value={order.time} onDark={open} />
          <InfoItem
            label="Teléfono"
            value={order.client_cell?.startsWith('+') ? order.client_cell : 'no disponible'}
            onDark={open}
          />
          <InfoItem label="Estado" onDark={open}>
            <View style={{ backgroundColor: status.bg }} className="rounded-full px-3 py-1">
              <Text className="text-xs font-medium text-white">{status.label}</Text>
            </View>
          </InfoItem>
          <InfoItem label="Información" onDark={open}>
            <Pressable onPress={() => setOpen(true)} hitSlop={8}>
              <Icon name="MessageSquare" size={22} color={open ? colors.white : colors.primary} />
            </Pressable>
          </InfoItem>
          <InfoItem label="Ayuda" onDark={open}>
            <Pressable onPress={() => openWhatsAppHelp(order.codigo)} hitSlop={8}>
              <CustomIcon name="WhatsApp" width={24} height={24} />
            </Pressable>
          </InfoItem>
          <InfoItem label="Acciones" onDark={open}>
            {isCancelling ? (
              <ActivityIndicator color={open ? colors.white : colors.primary} />
            ) : (
              <Pressable onPress={() => onCancel(order.id)} hitSlop={8}>
                <Icon name="Trash2" size={22} color={open ? colors.white : colors.error} />
              </Pressable>
            )}
          </InfoItem>
        </View>
      </View>

      {open ? (
        <View className="bg-white p-4">
          <View className="gap-2 border-b border-gray-100 pb-3">
            <DetailRow label="Método de entrega" value={isDelivery ? 'Domicilio' : 'Recogida en tienda'} />
            <DetailRow label="Método de pago" value={order.tipo_pago} />
            <DetailRow label="Provincia" value={order.provincia_completa?.provincia || '-'} />
            <DetailRow label="Municipio" value={order.municipio_completo?.municipio || '-'} />
            <DetailRow label="Tienda" value={order.tienda?.name} />
            <DetailRow label="Dirección tienda" value={order.tienda?.direccion} />
            <DetailRow label="Nombre" value={order.client_name || 'No disponible'} />
            <DetailRow label="Apellidos" value={order.client_last_names || 'No disponible'} />
            {isDelivery ? <DetailRow label="Dirección" value={order.direccion} /> : null}
            {order.nota && order.nota.length > 0 ? (
              <View className="gap-1">
                <Text className="font-bold text-primary">Nota del pedido:</Text>
                {order.nota.map((n) => (
                  <Text key={n.id} className="italic text-text">{n.message}</Text>
                ))}
              </View>
            ) : null}
          </View>

          {order.products?.length ? (
            <View className="mt-3 gap-3">
              {order.products.map((p, idx) => (
                <View key={idx} className="flex-row rounded-xl border border-gray-100 p-2">
                  <View className="h-20 w-16 rounded-lg bg-surface">
                    <Image source={{ uri: buildImageUrl(p.img) }} className="h-full w-full" contentFit="contain" />
                  </View>
                  <View className="ml-3 flex-1 justify-center">
                    <Text className="font-bold text-primary">{p.name}</Text>
                    <Text className="text-sm text-primary">{p.brand}</Text>
                    <Text className="text-sm text-muted">Cantidad: {p.count}</Text>
                    <Text className="font-bold text-primary">$ {p.price} {p.currency?.currency ?? 'USD'}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function InfoItem({
  label,
  value,
  onDark,
  children,
}: {
  label: string;
  value?: string;
  onDark?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <View className="w-1/2 pr-2">
      <Text className={cn('text-sm', onDark ? 'text-white/80' : 'text-muted')}>{label}</Text>
      {children ?? (
        <Text className={cn('text-right font-bold', onDark ? 'text-white' : 'text-primary')}>
          {value}
        </Text>
      )}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between">
      <Text className="w-[40%] text-sm font-bold text-primary">{label}</Text>
      <Text className="max-w-[58%] text-right text-sm text-text">{value}</Text>
    </View>
  );
}