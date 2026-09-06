import { useMemo } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { CheckoutStepper } from '@/components/checkout/checkoutStepper';
import { CartCard } from '@/components/cart/cartCard';
import { Button } from '@/components/primitives/button';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';
import { useCartStore } from '@/store/cartStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';
import { useDeleteFromCart } from '@/hooks/cart/useDeleteFromCart';
import { useUpdateCart } from '@/hooks/cart/useUpdateCart';
import { useLocation } from '@/hooks/location/useLocation';
import { formatPrice } from '@/utils/format';

export default function Cart1Screen() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const { deleteFromCart } = useDeleteFromCart();
  const { updateQuantity } = useUpdateCart();

  const { formData, updateFormData } = useCheckoutStore();
  const { municipalities, handleMunicipalityChange, selectedMunicipality } = useLocation();

  const totalPrice = items.reduce((acc, i) => {
    const p = parseFloat(String(i.price).replace(/[^0-9.]/g, ''));
    return acc + p * i.quantity;
  }, 0);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; items: typeof items }>();
    items.forEach((item) => {
      const id = item.tiendaId || 'unknown';
      if (!map.has(id)) map.set(id, { name: item.tiendaName || 'Tienda', items: [] });
      map.get(id)!.items.push(item);
    });
    return Array.from(map.values());
  }, [items]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-4 pt-4">
          <Breadcrumbs items={[{ label: 'Inicio', href: '/(tabs)' }, { label: 'Carrito de Compras' }]} />

          <Text className="mt-2 text-3xl font-bold text-primary">Carrito</Text>

          <View className="mt-4">
            <CheckoutStepper currentStep={0} />
          </View>

          {items.length === 0 ? (
            <View className="items-center py-20">
              <Text className="text-lg font-semibold text-muted">Tu carrito está vacío</Text>
              <Button title="Ir a productos" variant="outline" className="mt-4 w-52" onPress={() => router.push('/(tabs)/products')} />
            </View>
          ) : (
            <View className="mt-6 gap-6">
              {grouped.map((group) => (
                <View key={group.name}>
                  <Text className="mb-2 text-sm font-bold text-primary">{group.name}</Text>
                  <View className="gap-3">
                    {group.items.map((item) => (
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
                        cartId={item.cartId}
                        expiryTimestamp={item.expiryTimestamp}
                        onUpdateQuantity={(cartId, qty) => qty >= 1 && updateQuantity({ cartId, newCount: qty })}
                        onDelete={(cartId) => deleteFromCart(cartId)}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {items.length > 0 ? (
          <View className="mt-8 bg-white px-4 pb-8">
            <Text className="text-xl font-bold uppercase tracking-wide text-primary">
              Importe
            </Text>

            <View className="mt-4">
              <Pressable
                onPress={() => updateFormData({ delivery: !formData.delivery })}
                className="flex-row items-center gap-2"
              >
                <Icon
                  name={formData.delivery ? 'SquareCheck' : 'Square'}
                  size={22}
                  color={formData.delivery ? colors.primary : colors.muted}
                />
                <Text className="text-base text-gray-500">¿Necesitas entrega a domicilio?</Text>
              </Pressable>
            </View>

            {formData.delivery ? (
              <View className="mt-5 gap-4">
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="mb-1 text-sm font-medium text-gray-600">Nombre</Text>
                    <TextInput
                      value={formData.firstName}
                      onChangeText={(v) => updateFormData({ firstName: v })}
                      placeholder="Nombre"
                      placeholderTextColor="#9CA3AF"
                      className="h-12 rounded-xl border border-gray-100 bg-surface px-3 text-base"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-sm font-medium text-gray-600">Apellidos</Text>
                    <TextInput
                      value={formData.lastName1}
                      onChangeText={(v) => updateFormData({ lastName1: v })}
                      placeholder="Apellidos"
                      placeholderTextColor="#9CA3AF"
                      className="h-12 rounded-xl border border-gray-100 bg-surface px-3 text-base"
                    />
                  </View>
                </View>

                <View>
                  <Text className="mb-1 text-sm font-medium text-gray-600">Municipio</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {municipalities.map((mun) => (
                      <Pressable
                        key={mun.id}
                        onPress={() => handleMunicipalityChange(mun)}
                        className={
                          selectedMunicipality === mun.municipio
                            ? 'rounded-full border border-primary bg-primary px-3 py-1.5'
                            : 'rounded-full border border-gray-200 bg-white px-3 py-1.5'
                        }
                      >
                        <Text className={selectedMunicipality === mun.municipio ? 'text-xs text-white' : 'text-xs text-text'}>
                          {mun.municipio}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="mb-1 text-sm font-medium text-gray-600">Teléfono</Text>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(v) => updateFormData({ phone: v })}
                    placeholder="+53 ..."
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    className="h-12 rounded-xl border border-gray-100 bg-surface px-3 text-base"
                  />
                </View>

                <View>
                  <Text className="mb-1 text-sm font-medium text-gray-600">Dirección</Text>
                  <TextInput
                    value={formData.address}
                    onChangeText={(v) => updateFormData({ address: v })}
                    placeholder="Dirección"
                    placeholderTextColor="#9CA3AF"
                    className="h-12 rounded-xl border border-gray-100 bg-surface px-3 text-base"
                  />
                </View>

                <View>
                  <Text className="mb-1 text-sm font-medium text-gray-600">Nota</Text>
                  <TextInput
                    value={formData.note}
                    onChangeText={(v) => updateFormData({ note: v })}
                    placeholder="Información adicional..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    className="min-h-[80px] rounded-xl border border-gray-100 bg-surface px-3 py-2 text-base"
                  />
                </View>
              </View>
            ) : null}

            <View className="mt-6 rounded-xl bg-surface">
              <View className="flex-row justify-between p-4">
                <Text className="text-base font-medium text-primary">Subtotal</Text>
                <Text className="text-base font-medium text-primary">{formatPrice(totalPrice)}</Text>
              </View>
              <View className="flex-row justify-between border-t border-gray-200 bg-[#E2E6EA] p-4">
                <Text className="text-xl font-bold text-primary">Total a pagar</Text>
                <Text className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</Text>
              </View>
            </View>

            <Button
              title="Confirmar Orden"
              className="mt-6"
              disabled={totalItems === 0}
              onPress={() => {
                updateFormData({ stores: grouped.map((g) => ({ id: g.name, name: g.name, products: g.items })) });
                router.push('/(checkout)/cart2');
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}