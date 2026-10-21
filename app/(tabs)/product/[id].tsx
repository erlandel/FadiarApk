import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { FloatingScrollView } from '@/components/floatingActions/floatingScrollView';
import { FloatingActions } from '@/components/floatingActions/floatingActions';
import { LoadingSpinner } from '@/components/loading/loadingSpinner';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { buildImageUrl } from '@/lib/api/config';
import { formatPrice } from '@/utils/format';
import { colors } from '@/lib/theme/colors';
import { Button } from '@/components/primitives/button';
import { Icon } from '@/icons/lucideIcon';
import { ProductDetailSkeleton } from '@/components/product/productDetailSkeleton';
import { useProductVisual } from '@/hooks/products/useProductVisual';
import { useRelatedProducts } from '@/hooks/products/useRelatedProducts';
import { ProductCard } from '@/components/product/productCard';
import { DETAIL_CONTROL_HEIGHT, QuantityStepper } from '@/components/product/quantityStepper';
import { useAddToCart } from '@/hooks/cart/useAddToCart';
import { useCartStore } from '@/store/cartStore';
import { ImageViewer } from '@/components/product/imageViewer';
import { buildProductGallery } from '@/utils/productGallery';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id, tiendaId, preSale } = useLocalSearchParams<{
    id: string;
    tiendaId?: string;
    preSale?: string;
  }>();
  const [qty, setQty] = useState(1);
  const [galleryState, setGalleryState] = useState({ id, index: 0, open: false });
  // Reset before committing a different product, including when returning to a previous ID.
  if (galleryState.id !== id) {
    setGalleryState({ id, index: 0, open: false });
  }
  const selectedImageIndex = galleryState.id === id ? galleryState.index : 0;
  const isViewerOpen = galleryState.id === id && galleryState.open;
  const setSelectedImageIndex = (index: number) =>
    setGalleryState({ id, index, open: isViewerOpen });
  const setIsViewerOpen = (open: boolean) =>
    setGalleryState({ id, index: selectedImageIndex, open });
  const { addToCart, loading: addingToCart } = useAddToCart();
  const isInCart = useCartStore((state) =>
    state.items.some((item) => String(item.productId) === String(id))
  );

  const { data: product, isLoading, isError } = useProductVisual(id);
  const {
    data: relatedProducts = [],
    isLoading: relatedLoading,
    isError: relatedError,
    refetch: retryRelated,
  } = useRelatedProducts(
    product?.categoria?.id,
    product?.id,
    tiendaId ?? product?.tiendaId,
    product?.name
  );

  const warrantyMonths = product ? Number(product.warranty ?? 0) / 30 : 0;
  const isPreSale = preSale === 'true' || Boolean(product?.pre_venta);
  const hasDiscount = !!product?.temporal_price && Number(product.temporal_price) > 0;
  const gallery = useMemo(() => (product ? buildProductGallery(product) : []), [product]);
  const selectedImage = gallery[selectedImageIndex] ?? gallery[0];

  const detailHeader = (
    <View className="flex-row items-center gap-2 px-4 py-3">
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Icon name="ArrowLeft" size={32} color={colors.primary} strokeWidth={2.2} />
      </Pressable>
      <Text className="text-primary text-3xl font-bold">Detalles del Producto</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {isLoading ? (
        <FloatingScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
          {detailHeader}
          <ProductDetailSkeleton />
        </FloatingScrollView>
      ) : isError || !product ? (
        <View className="flex-1 items-center justify-center">
          {detailHeader}
          <Text className="text-primary mb-4 text-xl font-bold">Producto no encontrado</Text>
          <Button title="Volver" variant="outline" onPress={() => router.back()} />
          <FloatingActions />
        </View>
      ) : (
        <FloatingScrollView
          key={id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}>
          {detailHeader}
          <Pressable
            className="mx-4 mt-2 h-80 items-center justify-center rounded-2xl bg-white"
            onPress={() => {
              if (gallery.length) setIsViewerOpen(true);
            }}
            accessibilityLabel="Abrir visor de imágenes">
            <Image
              source={{ uri: buildImageUrl(selectedImage?.image ?? product.img, 960) }}
              style={{ height: '100%', width: '100%' }}
              contentFit="contain"
              cachePolicy="memory-disk"
              recyclingKey={`${id}-${selectedImage?.image ?? product.img}`}
            />
            {!isPreSale && product.count === 0 ? (
              <View className="bg-error absolute top-3 right-3 rounded-full px-3 py-1">
                <Text className="text-xs font-bold text-white">Agotado</Text>
              </View>
            ) : null}
          </Pressable>
          {gallery.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-4 pt-3">
              {gallery.map((image, index) => (
                <Pressable
                  key={`${image.image}-${index}`}
                  onPress={() => setSelectedImageIndex(index)}
                  className={
                    index === selectedImageIndex
                      ? 'border-accent h-16 w-16 overflow-hidden rounded-lg border-2'
                      : 'h-16 w-16 overflow-hidden rounded-lg border border-gray-200'
                  }>
                  <Image
                    source={{ uri: buildImageUrl(image.previewImg ?? image.image, 240) }}
                    style={{ height: '100%', width: '100%' }}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          <View className="px-4 py-5">
            <Text className="text-muted mb-3 text-sm">
              {product.categoria?.name || 'Sin categoría'}
            </Text>
            <Text className="text-textHeading text-4xl font-bold">{product.name}</Text>
            <Text className="text-primary text-3xl font-medium">{product.brand}</Text>

            {product.description ? (
              <Text className="text-text mt-3 text-justify text-base">{product.description}</Text>
            ) : null}

            {warrantyMonths > 0 ? (
              <Text className="mt-2 font-semibold text-yellow-500">
                Garantía de {warrantyMonths} meses
              </Text>
            ) : null}

            <View className="mt-3 flex-row items-center gap-3">
              {hasDiscount ? (
                <>
                  <Text className="text-primary text-3xl font-bold">
                    {formatPrice(product.temporal_price!, product.currency?.currency)}
                  </Text>
                  <Text className="text-muted text-lg line-through">
                    {formatPrice(product.price, product.currency?.currency)}
                  </Text>
                </>
              ) : (
                <Text className="text-primary text-3xl font-bold">
                  {formatPrice(product.price, product.currency?.currency)}
                </Text>
              )}
            </View>

            {!isPreSale && (
              <View className="mt-4 w-full flex-row items-center justify-between">
                <QuantityStepper
                  quantity={qty}
                  onDecrease={() => setQty((q) => Math.max(1, q - 1))}
                  onIncrease={() => {
                    if (product.count !== undefined && qty + 1 > product.count) return;
                    setQty((q) => q + 1);
                  }}
                  detail
                  disabled={product.count === 0}
                />

                <Pressable
                  accessibilityLabel={
                    product.count === 0 ? 'Producto agotado' : 'Añadir al carrito'
                  }
                  disabled={product.count === 0 || addingToCart}
                  hitSlop={4}
                  style={{
                    height: DETAIL_CONTROL_HEIGHT,
                    backgroundColor:
                      product.count === 0
                        ? colors.surface
                        : addingToCart || isInCart
                          ? colors.primary
                          : colors.white,
                    borderColor: product.count === 0 ? colors.gray : colors.primary,
                  }}
                  className={`w-[72px] items-center justify-center rounded-[10px] border ${
                    product.count === 0
                      ? 'border-gray-300 bg-gray-100 opacity-50'
                      : addingToCart || isInCart
                        ? 'border-primary bg-primary'
                        : 'border-primary bg-white'
                  }`}
                  onPress={() =>
                    addToCart({
                      productId: product.id,
                      tiendaId: tiendaId ?? product.tiendaId,
                      quantity: qty,
                    })
                  }>
                  {addingToCart ? (
                    <LoadingSpinner size="small" color={colors.white} />
                  ) : (
                    <Icon
                      name="ShoppingCart"
                      size={20}
                      color={
                        product.count === 0
                          ? colors.muted
                          : isInCart
                            ? colors.white
                            : colors.primary
                      }
                    />
                  )}
                </Pressable>
              </View>
            )}

            {product.specs && product.specs.length > 0 ? (
              <View
                className="mt-8 rounded-xl border p-5"
                style={{ backgroundColor: colors.surface, borderColor: colors.gray }}>
                <Text className="text-textHeading mb-3 font-semibold">Propiedades</Text>
                {product.specs.map((spec, i) => (
                  <View
                    key={i}
                    className="flex-row justify-between border-b py-2"
                    style={{ borderColor: colors.gray }}>
                    <Text className="text-text max-w-[50%] text-sm">{spec.name}</Text>
                    <Text className="text-text max-w-[50%] text-right text-sm">
                      {spec.description}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {relatedProducts.length > 0 || relatedLoading || relatedError ? (
              <View className="mt-8">
                <Text className="text-primary mb-3 text-xl font-bold">
                  También te puede interesar
                </Text>
                <Text className="text-accent mb-6 text-2xl font-bold">Productos relacionados</Text>
                {relatedLoading ? (
                  <View accessibilityLabel="Cargando productos relacionados" className="gap-4">
                    {[0, 1].map((index) => (
                      <View
                        key={index}
                        className="h-48 flex-row gap-3 rounded-2xl border border-gray-200 bg-white p-3">
                        <View className="w-28 rounded-xl bg-gray-100" />
                        <View className="flex-1 justify-between py-2">
                          <View className="h-4 rounded bg-gray-100" />
                          <View className="h-4 rounded bg-gray-100" />
                          <View className="h-8 rounded bg-gray-100" />
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
                {relatedError ? (
                  <Button
                    title="Reintentar productos relacionados"
                    variant="outline"
                    onPress={() => {
                      void retryRelated();
                    }}
                  />
                ) : null}
                <View className="gap-4">
                  {relatedProducts.map((related) => (
                    <View key={`${related.tiendaId}-${related.id}`} className="w-full">
                      <ProductCard
                        position="horizontal"
                        productId={related.id}
                        title={related.name}
                        brand={related.brand}
                        category={related.categoria?.name}
                        warranty={related.warranty}
                        price={related.price}
                        temporalPrice={related.temporal_price}
                        image={related.img}
                        count={related.count}
                        currency={related.currency?.currency}
                        tiendaId={related.tiendaId}
                        isPreSale={related.pre_venta}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </FloatingScrollView>
      )}
      <ImageViewer
        images={gallery}
        initialIndex={selectedImageIndex}
        visible={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </View>
  );
}
