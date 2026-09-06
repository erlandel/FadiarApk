import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { CheckoutStepper } from '@/components/checkout/checkoutStepper';
import { CartCard } from '@/components/cart/cartCard';
import { Button } from '@/components/primitives/button';
import { useCartStore } from '@/store/cartStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useBuyerDetailsStore } from '@/store/buyerDetailsStore';
import { useConfirmOrder } from '@/hooks/orders/useConfirmOrder';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/format';

export default function Cart3Screen() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const { formData } = useCheckoutStore();
  const { buyerDetails } = useBuyerDetailsStore();
  const { confirmOrder, isLoading } = useConfirmOrder();
  const person = useAuthStore((s) => s.auth?.person);
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  const beneficiaryName = formData.delivery
    ? `${formData.firstName} ${formData.lastName1} ${formData.lastName2}`.trim()
    : `${person?.name ?? ''} ${person?.lastname1 ?? ''} ${person?.lastname2 ?? ''}`.trim();
  const beneficiaryPhone = formData.delivery ? formData.phone : person?.cellphone1;

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-4 pt-4">
          <Breadcrumbs
            items={[
              { label: 'Inicio', href: '/(tabs)' },
              { label: 'Carrito de Compras', href: '/(checkout)/cart1' },
              { label: 'Confirmación' },
            ]}
          />
          <Text className="mt-2 text-3xl font-bold text-primary">Confirmación</Text>

          <View className="mt-4">
            <CheckoutStepper currentStep={2} />
          </View>

          <View className="mt-8 gap-8">
            <View>
              <Text className="mb-2 text-xl font-bold text-primary">PRODUCTOS</Text>
              <View className="gap-3">
                {items.map((item) => (
                  <CartCard
                    key={item.productId}
                    title={item.title}
                    brand={item.brand}
                    price={item.price}
                    temporalPrice={item.temporal_price}
                    image={item.image}
                    quantity={item.quantity}
                    currency={item.currency?.currency}
                    productId={item.productId}
                    readonly
                  />
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 text-xl font-bold text-primary">DATOS DE ENTREGA</Text>
              <View className="rounded-xl border border-gray-100 bg-surface p-4">
                <Row label="Método de entrega" value={formData.delivery ? 'Domicilio' : 'Recogida en tienda'} />
                <Row label="Nombre" value={beneficiaryName} />
                {beneficiaryPhone ? <Row label="Teléfono" value={beneficiaryPhone} /> : null}
                {formData.delivery ? (
                  <>
                    <Row label="Municipio" value={formData.municipality} />
                    <Row label="Dirección" value={formData.address} />
                    {formData.note ? <Row label="Nota" value={formData.note} /> : null}
                  </>
                ) : (
                  formData.stores?.map((store, i) => (
                    <Row key={i} label="Tienda" value={`${store.name}${store.direccion ? ` - ${store.direccion}` : ''}`} />
                  ))
                )}
              </View>
            </View>

            <View>
              <Text className="mb-2 text-xl font-bold text-primary">DATOS DE PAGO</Text>
              <View className="rounded-xl border border-gray-100 bg-surface p-4">
                <Row label="Método de pago" value={buyerDetails.paymentMethod} />
              </View>
            </View>

            <View>
              <Text className="mb-2 text-xl font-bold text-primary">IMPORTE</Text>
              <View className="rounded-xl bg-surface">
                <View className="flex-row justify-between border-t border-gray-200 bg-[#E2E6EA] p-4">
                  <Text className="text-xl font-bold text-primary">Total</Text>
                  <Text className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</Text>
                </View>
              </View>
            </View>

            <View className="mb-8 flex-row gap-3">
              <Button title="Atrás" variant="outline" className="flex-1" onPress={() => router.back()} />
              <Button title={isLoading ? 'Confirmando...' : 'Confirmar'} className="flex-1" loading={isLoading} onPress={() => confirmOrder()} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between border-b border-gray-100 py-2">
      <Text className="text-base text-muted">{label}:</Text>
      <Text className="max-w-[60%] text-right text-base font-semibold text-primary">{value}</Text>
    </View>
  );
}