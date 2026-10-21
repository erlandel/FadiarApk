import { type RefObject } from 'react';
import { Modal as RNModal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Icon } from '@/icons/lucideIcon';
import { ToastRoot } from '@/messages/toastConfig';

export interface CancelOrderModalProps {
  visible: boolean;
  orderNumber: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  blurTarget?: RefObject<View | null>;
}

export function CancelOrderModal({
  visible,
  orderNumber,
  onClose,
  onConfirm,
  isLoading = false,
  blurTarget,
}: CancelOrderModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center px-4">
        <BlurView
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          blurTarget={blurTarget}
          blurMethod="dimezisBlurViewSdk31Plus"
          intensity={15}
          tint="default"
        />
        <Pressable
          onPress={onClose}
          className="absolute inset-0 bg-black/50"
          accessibilityLabel="Cerrar modal"
        />
        <View className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
          <View className="bg-surface flex-row items-center justify-between border-b border-gray-200 px-5 py-4">
            <Text className="text-primary text-xl font-bold">Cancelar pedido</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar" className="rounded-full p-1">
              <Icon name="X" size={20} color="#6B7280" strokeWidth={3} />
            </Pressable>
          </View>

          <View className="p-6">
            <Text className="text-[#444444] text-center text-lg">
              ¿Desea cancelar la orden <Text className="text-primary font-bold">{orderNumber}</Text>
              ?
            </Text>

            <View className="mt-6 flex-row justify-between gap-3">
              <Pressable
                onPress={onClose}
                className="items-center rounded-xl border border-[#D1D5DB] bg-white px-4 py-2 active:bg-gray-50">
                <Text className="text-[#444444] text-xs font-semibold">Volver</Text>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                disabled={isLoading}
                className="bg-error items-center rounded-xl px-4 py-2 active:bg-red-700 disabled:opacity-70">
                <Text className="text-xs font-semibold text-white">
                  {isLoading ? 'Cancelando...' : 'Sí, cancelar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      {visible && <ToastRoot />}
    </RNModal>
  );
}

export default CancelOrderModal;
