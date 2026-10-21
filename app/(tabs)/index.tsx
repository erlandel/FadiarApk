import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { FloatingScrollView as ScrollView } from '@/components/floatingActions/floatingScrollView';
import { ProductSection } from '@/components/product/productSection';
import { useFeaturedProducts } from '@/hooks/products/useFeaturedProducts';
import { useUpcomingProducts } from '@/hooks/products/useUpcomingProducts';
import { BannerPot } from '@/components/banner/bannerPot';
import { SectionMoreProducts } from '@/components/home/sectionMoreProducts';
import { usePathname } from 'expo-router';

export default function HomeScreen() {
  const pathname = usePathname();
  const isFocused = pathname === '/' || pathname === '/index' || pathname === '/(tabs)';
  const {
    data: featured,
    isLoading: featuredLoading,
    isError,
  } = useFeaturedProducts({ enabled: isFocused });
  const upcoming = useUpcomingProducts({ enabled: isFocused });
  const upcomingProducts = useMemo(
    () => upcoming.data?.map((product) => ({ ...product, isPreSale: true })),
    [upcoming.data]
  );

  const showGlobalNoProducts =
    !featuredLoading &&
    !isError &&
    !featured?.latest.length &&
    !featured?.offers.length &&
    !featured?.bestSelling.length;

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner hero */}
        <BannerPot />

        <View className="mt-10">
          {showGlobalNoProducts ? (
            <View className="items-center py-16">
              <Text className="text-muted text-lg font-semibold">No hay productos disponibles</Text>
              <Text className="text-muted mt-1 text-sm">Selecciona una ubicación válida</Text>
            </View>
          ) : (
            <>
              {featuredLoading || featured?.latest.length ? (
                <View>
                  <ProductSection
                    title="Últimos productos"
                    products={featured?.latest}
                    isLoading={featuredLoading}
                    direction="right"
                  />
                </View>
              ) : null}

              {featuredLoading || featured?.offers.length ? (
                <View>
                  <ProductSection
                    title="Nuestras Ofertas"
                    products={featured?.offers}
                    isLoading={featuredLoading}
                    direction="left"
                  />
                </View>
              ) : null}

              {upcoming.isLoading || upcoming.data?.length ? (
                <ProductSection
                  title="Próximamente"
                  products={upcomingProducts}
                  isLoading={upcoming.isLoading}
                  direction="right"
                />
              ) : null}

              {featuredLoading || featured?.bestSelling.length ? (
                <View>
                  <ProductSection
                    title="Tendencias para el hogar"
                    position="vertical"
                    products={featured?.bestSelling}
                    isLoading={featuredLoading}
                    direction="right"
                  />
                </View>
              ) : null}
              <View>
                <SectionMoreProducts />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
