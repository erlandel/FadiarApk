import { Modal as RNModal, Pressable, Text, View } from 'react-native';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';

export interface CancelOrderModalProps {
  visible: boolean;
  orderNumber: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function CancelOrderModal({
  visible,
  orderNumber,
  onClose,
  onConfirm,
  isLoading = false,
}: CancelOrderModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <Pressable
          onPress={onClose}
          className="absolute inset-0"
          accessibilityLabel="Cerrar modal"
        />
        <View className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
          <View className="bg-surface flex-row items-center justify-between border-b border-gray-200 px-5 py-4">
            <Text className="text-primary text-xl font-bold">Cancelar pedido</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar">
              <Icon name="X" size={22} color={colors.muted} strokeWidth={3} />
            </Pressable>
          </View>

          <View className="p-6">
            <Text className="text-text text-center text-lg">
              ¿Desea cancelar la orden <Text className="text-primary font-bold">{orderNumber}</Text>
              ?
            </Text>

            <View className="mt-6 flex-row justify-between gap-3">
              <Pressable
                onPress={onClose}
                disabled={isLoading}
                className="flex-1 items-center rounded-xl border border-gray-300 bg-white px-4 py-3 active:bg-gray-50">
                <Text className="text-text text-sm font-semibold">Volver</Text>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                disabled={isLoading}
                className="bg-error flex-1 items-center rounded-xl px-4 py-3 active:bg-red-700 disabled:opacity-70">
                <Text className="text-sm font-semibold text-white">
                  {isLoading ? 'Cancelando...' : 'Sí, cancelar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

export default CancelOrderModal;
