import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';
import { useFiltersStore } from '@/store/filtersStore';

const fanImage = require('@/assets/images/fan.webp');
const fridgeImage = require('@/assets/images/Fridge1.webp');

function PromoButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="mt-4 flex-row items-center gap-2 self-start rounded-lg bg-primary px-4 py-2.5 active:opacity-80"
    >
      <Text className="font-semibold text-white">Ver más</Text>
      <Icon name="ArrowRight" size={18} color={colors.white} />
    </Pressable>
  );
}

export function SectionMoreProducts() {
  const router = useRouter();
  const setSelectedCategories = useFiltersStore((state) => state.setSelectedCategories);
  const setShouldScrollToProducts = useFiltersStore(
    (state) => state.setShouldScrollToProducts,
  );

  const openCategory = (category: string) => {
    setSelectedCategories([category]);
    setShouldScrollToProducts(true);
    router.push('/products');
  };

  return (
    <View className="mt-12 px-4 pb-8">
      <Text className=" text-2xl font-bold text-primary">Elige tu solución ideal</Text>

      <View >
        <View className="flex-row items-center overflow-hidden rounded-2xl  px-3 py-4">
          <View className="z-10 w-[43%]">
            <Text className="text-xl font-bold text-text">Ventiladores</Text>
            <Text className="mt-1 text-xs leading-5 text-text">
              Frescura y confort para cada ambiente, con modelos eficientes que se adaptan a cualquier espacio.
            </Text>
            <PromoButton onPress={() => openCategory('ventiladores')} />
          </View>
          <Image source={fanImage} resizeMode="contain" className="h-40 flex-1" />
        </View>

        <View className="flex-row items-center overflow-hidden rounded-2xl  px-3">
          <View className="z-10 w-[40%]">
            <Text className="text-xl font-bold text-text">Refrigeradores y Neveras</Text>
            <Text className="mt-1 text-xs leading-5 text-text">
              Conserva tus alimentos con la frescura y eficiencia que el hogar necesita, cada día.
            </Text>
            <PromoButton onPress={() => openCategory('refrigeradores y neveras')} />
          </View>
          <Image source={fridgeImage} resizeMode="contain" className="h-50 mt-8 flex-1" />
        </View>
      </View>
    </View>
  );
}