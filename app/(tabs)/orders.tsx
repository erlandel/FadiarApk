import { ScrollView, Text, View } from 'react-native';
import { ProtectedScreen } from '@/components/navigation/protectedScreen';

export default function OrdersScreen() {
  return (
    <ProtectedScreen>
      <View className="flex-1 bg-white">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-4 py-6">
            <Text className="text-3xl font-bold text-primary">Mis pedidos</Text>
            <Text className="mt-3 text-base text-muted">
              Aquí podrás ver el historial de tus compras y el estado de cada pedido.
            </Text>
          </View>
        </ScrollView>
      </View>
    </ProtectedScreen>
  );
}
