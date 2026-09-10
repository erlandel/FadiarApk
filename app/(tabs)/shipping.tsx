import { homeDeliveryPolicy } from '@/data/shippingPolicy';
import Accordion from '@/components/accordion/accordion';
import { ScrollView, View, Text } from 'react-native';

export default function Shipping() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-4 pb-8 pt-4">
             <View className="w-full gap-5">
            <View className="w-full">
              <Text className="text-3xl font-bold leading-tight">
                <Text className="text-primary">Política de Envío</Text>
                {'\n'}
                <Text className="text-[#F5A623]">a Domicilio</Text>
              </Text>
            </View>

            <View className="w-full">
              <Accordion items={homeDeliveryPolicy} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}