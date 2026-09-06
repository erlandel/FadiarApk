import { ScrollView, Text, View } from 'react-native';
import { ProductCardSkeleton } from './productCardSkeleton';
import { ProductCarousel } from './productCarousel';
import type { Product } from '@/types/product';

export interface ProductSectionProps {
  title: string;
  products?: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  direction?: 'left' | 'right';
}

export function ProductSection({
  title,
  products = [],
  isLoading = false,
  skeletonCount = 5,
  direction = 'left',
}: ProductSectionProps) {
  return (
    <View className="mt-12">
      <View className="flex-row items-center justify-between px-4 mb-2">
        <Text className="text-2xl font-bold text-primary">{title}</Text>
      </View>

      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 px-4 py-4 "
        >
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <View key={i} className="w-55">
              <ProductCardSkeleton />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ProductCarousel
          products={products}
          speed={20}
          gap={15}
          direction={direction}
        />
      )}
    </View>
  );
}