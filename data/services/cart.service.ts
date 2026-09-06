import { apiClient, getAccessToken } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { EMISOR } from '@/lib/api/config';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import type { CartItem } from '@/types/cart';

function mapRawCart(rawCarrito: any[]): CartItem[] {
  const mapped: CartItem[] = [];
  const expiran: boolean = (rawCarrito as any).expiran ?? false;

  rawCarrito.forEach((tienda: any) => {
    const tiendaId = tienda.id;
    const tiendaName = tienda.name;
    const tiendaDireccion = tienda.direccion;
    const productos = tienda.productos || [];
    productos.forEach((item: any) => {
      const p = item.producto;
      if (p && item.aliveUntil > 0) {
        mapped.push({
          cartId: item.id,
          productId: String(p.id),
          title: p.name,
          brand: p.brand,
          category: p.categoria?.name,
          warranty: p.warranty ? String(p.warranty) : undefined,
          price:
            p.temporal_price && Number(p.temporal_price) !== 0
              ? String(p.temporal_price)
              : String(p.price),
          temporal_price: p.temporal_price ? String(p.temporal_price) : undefined,
          image: p.img,
          quantity: item.en_carrito,
          expiryTimestamp:
            expiran && item.aliveUntil ? Date.now() + Number(item.aliveUntil) * 1000 : undefined,
          currency: p.currency,
          tiendaId,
          tiendaName,
          tiendaDireccion,
        });
      }
    });
  });

  return mapped;
}

export async function syncCart(): Promise<boolean> {
  const auth = useAuthStore.getState().auth;
  if (!getAccessToken() || !auth?.user?.id) return false;

  try {
    const { data } = await apiClient.post(ENDPOINTS.getCartProducts, {
      id_user: auth.user.id,
      comisiones: true,
    });

    const rawCarrito = data.carrito || [];
    useCartStore.getState().setRawCart(rawCarrito);
    const mappedItems = mapRawCart(rawCarrito);
    useCartStore.getState().setItems(mappedItems);
    return true;
  } catch {
    return false;
  }
}

export async function addProductToCart(item: {
  productId: string;
  tiendaId?: string;
  quantity: number;
}): Promise<void> {
  await apiClient.post(ENDPOINTS.addProductToCart, {
    id_product: item.productId,
    id_tienda: item.tiendaId,
    count: item.quantity,
    emisor: EMISOR,
  });
  await syncCart();
}

export async function updateCartQuantity(cartId: string | number, newCount: number): Promise<void> {
  await apiClient.post(ENDPOINTS.updateCartQuantity, {
    id_carrito: cartId,
    newCount,
    emisor: EMISOR,
  });
  await syncCart();
}

export async function deleteProductFromCart(cartId: string | number): Promise<void> {
  await apiClient.post(ENDPOINTS.deleteProductFromCart, {
    id_carrito: cartId,
    emisor: EMISOR,
  });
  await syncCart();
}

export async function confirmOrder(payload: Record<string, unknown>): Promise<any> {
  const { data } = await apiClient.post(ENDPOINTS.addOrder, payload);
  return data;
}