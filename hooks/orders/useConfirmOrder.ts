import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { confirmOrder } from '../../data/services/cart.service';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useBuyerDetailsStore } from '@/store/buyerDetailsStore';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';
import { toastError } from '@/messages/toast';

export function useConfirmOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const auth = useAuthStore.getState().auth;
      if (!auth) throw new Error('NO_AUTH');

      const formData = useCheckoutStore.getState().formData;
      const { buyerDetails } = useBuyerDetailsStore.getState();
      const { municipalityId } = useProductsByLocationStore.getState();
      const isDelivery = formData.delivery;
      const person = auth.person;
      const use_user_info = !isDelivery;

      const source = isDelivery
        ? {
            name: formData.firstName,
            last1: formData.lastName1,
            last2: formData.lastName2,
            phone: formData.phone,
            address: formData.address,
            note: formData.note ?? '',
          }
        : {
            name: person.name,
            last1: person.lastname1,
            last2: person.lastname2,
            phone: person.cellphone1,
            address: '',
            note: '',
          };

      const payload = {
        name_cliente: source.name || '',
        last_names: `${source.last1 || ''} ${source.last2 || ''}`.trim(),
        cellphone_cliente: source.phone || '',
        id_municipio: municipalityId,
        direccionExacta: source.address || '',
        emisor: 'web',
        nota: source.note || '',
        paymentMethod: buyerDetails.paymentMethod,
        use_user_info,
      };

      const data = await confirmOrder(payload);
      const orderId = data?.orders?.[0]?.codigo;

      useAuthStore.getState().setShouldClearCartAfterOrder(true);
      useCartStore.getState().clearCart();

      const deliveryChanged = formData.delivery;
      useCheckoutStore.getState().updateFormData({
        stores: [],
        showDeliveryOverlay: true,
        overlayDelivery: deliveryChanged,
        delivery: false,
        orderId: orderId || '',
        note: '',
      });

      return orderId;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.replace('/(tabs)/orders');
    },
    onError: (err: any) => {
      if (err?.message === 'NO_AUTH') {
        router.push('/(auth)/login');
        return;
      }
      const message = err?.response?.data?.error || 'No se pudo confirmar la orden';
      toastError(message);
    },
  });

  return {
    confirmOrder: mutation.mutate,
    isLoading: mutation.isPending,
  };
}