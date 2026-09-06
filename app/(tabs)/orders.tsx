import { FlatList, Text, View } from 'react-native';
import { OrderCard } from '@/components/orders/orderCard';
import { ProtectedScreen } from '@/components/navigation/protectedScreen';
import { Button } from '@/components/primitives/button';
import { useGetOrders } from '@/hooks/orders/useGetOrders';
import { useCancelOrder } from '@/hooks/orders/useCancelOrder';
import { useAuthStore } from '@/store/authStore';

function OrdersContent() {
  const { orders, isLoading, refetch } = useGetOrders();
  const { cancelOrder, isLoading: cancelling, variables } = useCancelOrder();
  const auth = useAuthStore((s) => s.auth);

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 py-4">
        <Text className="text-3xl font-bold text-primary">Mis Pedidos</Text>
        {auth?.person.name ? (
          <Text className="text-base font-semibold text-muted">
            Hola {auth.person.name}, aquí puedes ver tus pedidos
          </Text>
        ) : null}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4 pb-3">
            <OrderCard
              order={item}
              onCancel={(id) => cancelOrder(id)}
              isCancelling={cancelling && variables === item.id}
            />
          </View>
        )}
        contentContainerClassName="pb-8"
        ListEmptyComponent={
          isLoading ? (
            <Text className="py-16 text-center text-muted">Cargando pedidos...</Text>
          ) : (
            <View className="items-center py-16">
              <Text className="text-base text-muted">No se encontraron pedidos.</Text>
              <Button title="Recargar" variant="outline" className="mt-4 w-44" onPress={() => refetch()} />
            </View>
          )
        }
      />
    </View>
  );
}

export default function OrdersScreen() {
  return (
    <ProtectedScreen>
      <OrdersContent />
    </ProtectedScreen>
  );
}