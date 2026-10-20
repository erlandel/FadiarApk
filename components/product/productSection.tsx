import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { ProductCardSkeleton } from './productCardSkeleton';
import { getProductCardWidth, ProductCarousel } from './productCarousel';
import type { Product } from '@/types/product';

export interface ProductSectionProps {
  position?: 'vertical' | 'horizontal';
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
  position = 'vertical',
}: ProductSectionProps) {
  const { width } = useWindowDimensions();
  return (
    <View className="mt-12">
      <View className="mb-2 flex-row items-center justify-between px-4">
        <Text className="text-primary text-2xl font-bold">{title}</Text>
      </View>

      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-0 px-4 py-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <View key={i} style={{ width: getProductCardWidth(width, position) }}>
              <ProductCardSkeleton position={position} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ProductCarousel
          position={position}
          products={products}
          speed={20}
          gap={0}
          direction={direction}
        />
      )}
    </View>
  );
}
