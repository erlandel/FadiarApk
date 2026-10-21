import { useRouter } from 'expo-router';
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Icon, type LucideIconName } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';
import { ToastRoot } from '@/messages/toastConfig';

export interface OrderInformationModalProps {
  visible: boolean;
  onClose: () => void;
  onContinueShopping?: () => void;
  orderId: string;
  delivery: boolean;
}

export function OrderInformationModal({
  visible,
  onClose,
  onContinueShopping,
  orderId,
  delivery,
}: OrderInformationModalProps) {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const formattedOrderId = orderId.startsWith('#') ? orderId : `#${orderId}`;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
      presentationStyle="overFullScreen">
      <View className="flex-1 items-center justify-center px-2" style={styles.modalRoot}>
        <View pointerEvents="none" style={styles.backdrop} />
        <View
          className="w-full max-w-[560px] overflow-hidden rounded-xl bg-blue-50"
          style={styles.messageContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 py-7"
            style={{ maxHeight: height * 0.9 }}>
            <View className="items-center">
              <Text className="text-primary text-center text-3xl font-bold">
                ¡Gracias por su compra!
              </Text>
              <View className="bg-primary mt-3 h-2 w-24 rounded-full" />
            </View>

            <View className="mt-5 gap-5">
              <InformationRow icon="CheckCircle">
                <Text className="text-primary text-lg leading-6">
                  Su pedido ha sido confirmado exitosamente.{`\n`}
                  Número pedido: <Text className="font-bold">{formattedOrderId}.</Text>
                </Text>
              </InformationRow>

              <InformationRow icon="CalendarClock">
                <Text className="text-primary text-lg leading-6">
                  {delivery ? (
                    <>
                      La entrega se realizará en un plazo de 24 a 72 horas{' '}
                      <Text className="font-bold">hábiles</Text>.
                    </>
                  ) : (
                    <>
                      Puede recogerlo en nuestra sede en un plazo de 7 días{' '}
                      <Text className="font-bold">hábiles</Text>.
                    </>
                  )}
                </Text>
              </InformationRow>

              <InformationRow icon={delivery ? 'Smartphone' : 'FileText'}>
                <Text className="text-primary text-lg leading-6">
                  {delivery
                    ? 'Nuestro equipo logístico se comunicará al número telefónico proporcionado para coordinar los detalles.'
                    : 'Deberá presentar su número de pedido al momento de la recogida.'}
                </Text>
              </InformationRow>

              {!delivery ? (
                <Text className="text-primary ml-3 text-lg leading-6">
                  Si necesita más información, nuestro equipo estará disponible para asistirle.
                </Text>
              ) : null}
            </View>

            <Text className="text-primary mt-5 text-center text-lg font-bold uppercase">
              Gracias por confiar en Grupo Fadiar.
            </Text>

            <View className="mt-5 flex-row gap-2">
              <Pressable
                onPress={() => {
                  onContinueShopping?.();
                  router.replace('/(tabs)/products' as any);
                }}
                className="border-primary min-h-14 flex-1 items-center justify-center rounded-xl border px-2 active:opacity-80">
                <Text className="text-primary text-center font-semibold">Seguir comprando</Text>
              </Pressable>
              <Pressable
                onPress={onClose}
                className="bg-primary min-h-14 flex-1 items-center justify-center rounded-xl px-2 active:opacity-80">
                <Text className="text-center font-semibold text-white">Mis pedidos</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
      {visible && <ToastRoot />}
    </RNModal>
  );
}

function InformationRow({ icon, children }: { icon: LucideIconName; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-12 w-10 shrink-0 items-center justify-center">
        <Icon name={icon} size={38} color={colors.primary} />
      </View>
      <View className="flex-1">{children}</View>
    </View>
  );
}

export default OrderInformationModal;

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  messageContainer: {
    zIndex: 1,
    elevation: 1,
  },
});
