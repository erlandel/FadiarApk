import { useEffect, useRef, useState } from 'react';
import { BlurTargetView } from 'expo-blur';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { FloatingScrollView } from '@/components/floatingActions/floatingScrollView';
import { LoadingDots } from '@/components/loading/loadingDots';
import { ProtectedScreen } from '@/components/navigation/protectedScreen';
import { OrderCard } from '@/components/orders/orderCard';
import { CancelOrderModal } from '@/components/orders/cancelOrderModal';
import { OrderInformationModal } from '@/components/orders/orderInformationModal';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';
import { useGetOrders } from '@/hooks/orders/useGetOrders';
import { useCancelOrder } from '@/hooks/orders/useCancelOrder';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { toastWarning } from '@/messages/toast';
import type { Order } from '@/types/order';

const ITEMS_PER_PAGE = 10;

export default function OrdersScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const blurTarget = useRef<View>(null);
  const [infoTarget, setInfoTarget] = useState<{
    orderId: string;
    delivery: boolean;
  } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{
    id: string;
    number: string;
  } | null>(null);

  const { orders, hasMore, isLoading, isFetching, isError, currentPage, setCurrentPage, refetch } =
    useGetOrders(ITEMS_PER_PAGE);
  const { cancelOrder, isLoading: isCancelling, variables: cancellingOrderId } = useCancelOrder();

  const showDeliveryOverlay = useCheckoutStore((state) => state.formData.showDeliveryOverlay);
  const overlayDelivery = useCheckoutStore((state) => state.formData.overlayDelivery);
  const checkoutDelivery = useCheckoutStore((state) => state.formData.delivery);
  const checkoutOrderId = useCheckoutStore((state) => state.formData.orderId);
  const updateFormData = useCheckoutStore((state) => state.updateFormData);

  const shouldClearCartAfterOrder = useAuthStore((state) => state.shouldClearCartAfterOrder);
  const resetShouldClearCartAfterOrder = useAuthStore(
    (state) => state.resetShouldClearCartAfterOrder
  );

  useEffect(() => {
    if (!shouldClearCartAfterOrder) return;
    useCartStore.getState().clearCart();
    resetShouldClearCartAfterOrder();
  }, [resetShouldClearCartAfterOrder, shouldClearCartAfterOrder]);

  const handlePageChange = (page: number) => {
    if (page < 1 || (page > currentPage && !hasMore) || isFetching) return;
    setCurrentPage(page);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleInfo = (order: Order) => {
    setInfoTarget({
      orderId: order.codigo || order.id,
      delivery: Boolean(order.direccion?.trim()),
    });
  };

  const handleCancelRequest = (order: Order) => {
    if (order.status?.toLowerCase() === 'cancelado') {
      toastWarning(`El pedido ${formatOrderNumber(order.codigo || order.id)} ya fue cancelado`);
      return;
    }

    setCancelTarget({
      id: order.id,
      number: formatOrderNumber(order.codigo || order.id),
    });
  };

  const confirmCancelOrder = () => {
    if (!cancelTarget) return;

    const orderId = cancelTarget.id;
    cancelOrder(orderId, {
      onSuccess: () => setCancelTarget(null),
    });
  };

  return (
    <ProtectedScreen>
      <View className="flex-1 bg-white">
        <BlurTargetView ref={blurTarget} style={{ flex: 1 }}>
        <FloatingScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => void refetch()}
              tintColor={colors.accent}
            />
          }>
          <View className="mx-4 pt-8">
            <Text className="text-primary text-3xl font-bold">Mis Pedidos</Text>

            {isLoading ? (
              <View className="items-center py-8">
                <LoadingDots text="Cargando pedidos" />
              </View>
            ) : isError ? (
              <View className="items-center py-12">
                <Text className="text-muted text-center text-base">
                  No se pudieron cargar tus pedidos.
                </Text>
                <Pressable
                  onPress={() => void refetch()}
                  className="bg-primary mt-4 rounded-xl px-5 py-3 active:opacity-80">
                  <Text className="font-semibold text-white">Reintentar</Text>
                </Pressable>
              </View>
            ) : orders.length === 0 ? (
              <Text className="text-muted py-10 text-center text-sm">
                No se encontraron pedidos.
              </Text>
            ) : (
              <View className="mt-4 gap-4">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onInfo={handleInfo}
                    onCancel={handleCancelRequest}
                    isCancelling={isCancelling && cancellingOrderId === order.id}
                  />
                ))}
              </View>
            )}

            {!isLoading && !isError ? (
              <View className="mt-5 flex-row items-center justify-center gap-5">
                <Pressable
                  onPress={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isFetching}
                  className="disabled:opacity-30">
                  <Icon name="ArrowLeft" size={38} color={colors.primary} />
                </Pressable>
                <Text className="text-primary text-2xl font-bold">{currentPage}</Text>
                <Pressable
                  onPress={() => handlePageChange(currentPage + 1)}
                  disabled={!hasMore || isFetching}
                  className="disabled:opacity-30">
                  <Icon name="ArrowRight" size={38} color={colors.primary} />
                </Pressable>
              </View>
            ) : null}
          </View>
        </FloatingScrollView>
        </BlurTargetView>

        <OrderInformationModal
          visible={Boolean(infoTarget || showDeliveryOverlay)}
          orderId={infoTarget?.orderId || checkoutOrderId || ''}
          delivery={infoTarget?.delivery ?? overlayDelivery ?? checkoutDelivery}
          onClose={() => {
            setInfoTarget(null);
            updateFormData({ showDeliveryOverlay: false, overlayDelivery: false, orderId: '' });
          }}
          onContinueShopping={() => {
            setInfoTarget(null);
            updateFormData({ showDeliveryOverlay: false, overlayDelivery: false, orderId: '' });
          }}
        />
        <CancelOrderModal
          blurTarget={blurTarget}
          visible={Boolean(cancelTarget)}
          orderNumber={cancelTarget?.number || ''}
          onClose={() => setCancelTarget(null)}
          onConfirm={confirmCancelOrder}
          isLoading={isCancelling && cancellingOrderId === cancelTarget?.id}
        />
      </View>
    </ProtectedScreen>
  );
}

function formatOrderNumber(value: string | number) {
  const text = String(value);
  return text.startsWith('#') ? text : `#${text}`;
}
