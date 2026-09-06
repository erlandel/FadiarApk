import { ScrollView, Text, View } from 'react-native';
import { ProductSection } from '@/components/product/productSection';
import { useLatestProducts } from '@/hooks/products/useLatestProducts';
import { useBestSelling } from '@/hooks/products/useBestSelling';
import { useNineOffers } from '@/hooks/products/useNineOffers';
import { useUpcomingProducts } from '@/hooks/products/useUpcomingProducts';
import { useInventory } from '@/hooks/products/useInventory';
import { BannerPot } from '@/components/home/bannerPot';
import { SectionMoreProducts } from '@/components/home/sectionMoreProducts';

export default function HomeScreen() {
  const { data: inventory } = useInventory();
  const latest = useLatestProducts(15);
  const bestSelling = useBestSelling(15);
  const nineOffers = useNineOffers(9);
  const upcoming = useUpcomingProducts();

  const inventoryLoading = !inventory;
  const showGlobalNoProducts =
    !inventoryLoading && (!inventory?.products || inventory.products.length === 0);

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner hero */}
        <BannerPot />

        <View className='mt-10'>
          {showGlobalNoProducts ? (
            <View className="items-center py-16">
              <Text className="text-muted text-lg font-semibold">No hay productos disponibles</Text>
              <Text className="text-muted mt-1 text-sm">Selecciona una ubicación válida</Text>
            </View>
          ) : (
            <>
              {latest.isLoading || latest.data?.length ? (
                  <View >
                    <ProductSection
                      title="Últimos productos"
                      products={latest.data}
                      isLoading={latest.isLoading}
                      direction="right"
                    />
                  </View>
              ) : null}

              {nineOffers.isLoading || nineOffers.data?.length ? (
                <View >
                  <ProductSection
                    title="Nuestras Ofertas"
                    products={nineOffers.data}
                    isLoading={nineOffers.isLoading}
                    direction="left"
                  />
                </View>
              ) : null}

              {upcoming.isLoading || upcoming.data?.length ? (
                <ProductSection
                  title="Próximamente"
                  products={upcoming.data?.map((p) => ({ ...p, isPreSale: true }))}
                  isLoading={upcoming.isLoading}
                  direction="right"
                />
              ) : null}

              {bestSelling.isLoading || bestSelling.data?.length ? (
                  <View >
                    <ProductSection
                      title="Tendencias para el hogar"
                      products={bestSelling.data}
                      isLoading={bestSelling.isLoading}
                      direction="right"
                    />
                  </View>
              ) : null}
              <View >
              <SectionMoreProducts />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
