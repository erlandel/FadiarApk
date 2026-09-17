import { ScrollView, Text, View } from 'react-native';
import Accordion from '@/components/accordion/accordion';
import { homeDeliveryPolicy } from '@/data/shippingPolicy';

export default function ShippingScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-4 pb-12" showsVerticalScrollIndicator={false}>
        <View className="pt-4">
          <Text className="mt-2 text-3xl font-bold text-primary">
            Política de Envío{' '}
            <Text className="text-accent">a Domicilio</Text>
          </Text>
        </View>

        <View className="mt-8">
          <Accordion items={homeDeliveryPolicy} />
        </View>
      </ScrollView>
    </View>
  );
}
