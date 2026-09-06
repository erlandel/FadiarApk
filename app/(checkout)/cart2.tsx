import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { CheckoutStepper } from '@/components/checkout/checkoutStepper';
import { Button } from '@/components/primitives/button';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';
import { useBuyerDetailsStore, PAYMENT_METHODS } from '@/store/buyerDetailsStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';

const PAYMENT_OPTIONS = [
  { id: 'delivery', title: 'Pago al momento de la entrega', desc: 'Efectivo o Transferencia', icon: 'Banknote' },
  { id: 'pickup', title: 'Recogida en tienda', desc: 'Pago directo en el local', icon: 'Store' },
  { id: 'zelle', title: 'Zelle', desc: 'Pago mediante transferencia bancaria', icon: 'Smartphone' },
];

export default function Cart2Screen() {
  const router = useRouter();
  const { buyerDetails, setPaymentMethod } = useBuyerDetailsStore();
  const { formData } = useCheckoutStore();
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  const availableMethods = formData.delivery ? PAYMENT_METHODS.delivery : PAYMENT_METHODS.pickup;

  const visibleOptions = PAYMENT_OPTIONS.filter((o) => {
    if (formData.delivery) return o.id !== 'pickup';
    return o.id === 'pickup' || o.id === 'zelle';
  });

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-4 pt-4">
          <Breadcrumbs
            items={[
              { label: 'Inicio', href: '/(tabs)' },
              { label: 'Carrito de Compras', href: '/(checkout)/cart1' },
              { label: 'Formas de Pago' },
            ]}
          />
          <Text className="mt-2 text-3xl font-bold text-primary">Formas de Pago</Text>

          <View className="mt-4">
            <CheckoutStepper currentStep={1} />
          </View>

          <View className="mt-8">
            <Text className="text-2xl font-bold text-primary">Formas de Pago</Text>
            <View className="mt-4 gap-4">
              {visibleOptions.map((option) => {
                const selected = buyerDetails.paymentMethod === option.title;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setPaymentMethod(option.title)}
                    className="flex-row items-center justify-between rounded-2xl border p-4"
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                        <Icon name={option.icon as any} size={26} color={colors.primary} />
                      </View>
                      <View>
                        <Text className="text-lg font-bold text-primary">{option.title}</Text>
                        <Text className="text-sm text-muted">{option.desc}</Text>
                      </View>
                    </View>
                    <Icon
                      name={selected ? 'CircleCheck' : 'Circle'}
                      size={24}
                      color={selected ? colors.primary : colors.border}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mt-8">
            <Text className="text-xl font-bold text-primary">IMPORTE</Text>
            <View className="mt-4 rounded-xl bg-surface">
              {formData.delivery ? (
                <View className="flex-row justify-between p-4">
                  <Text className="text-base text-primary">Subtotal:</Text>
                  <Text className="text-xl font-medium text-primary">{formatPrice(totalPrice)}</Text>
                </View>
              ) : null}
              <View className="flex-row justify-between border-t border-gray-200 bg-[#E2E6EA] p-4">
                <Text className="text-xl font-bold text-primary">Total</Text>
                <Text className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</Text>
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <Button title="Atrás" variant="outline" className="flex-1" onPress={() => router.back()} />
              <Button title="Continuar" className="flex-1" onPress={() => router.push('/(checkout)/cart3')} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}