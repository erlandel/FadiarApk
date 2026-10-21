import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Order, OrderNote, OrderProduct } from '@/types/order';

export interface OrdersPage {
  orders: Order[];
  hasMore: boolean;
}

function firstText(...values: unknown[]): string | undefined {
  const value = values.find((item) => typeof item === 'string' && item.trim().length > 0);
  return typeof value === 'string' ? value.trim() : undefined;
}

function mapOrderProduct(rawProduct: any): OrderProduct {
  const nestedProduct = rawProduct?.producto ?? rawProduct?.product ?? rawProduct;
  const image = firstText(
    rawProduct?.img,
    rawProduct?.image,
    rawProduct?.image_url,
    rawProduct?.img_web,
    nestedProduct?.img,
    nestedProduct?.image,
    nestedProduct?.image_url,
    nestedProduct?.img_web
  );
  const previewImage = firstText(
    rawProduct?.preview_img,
    rawProduct?.preview_image,
    rawProduct?.preview_img_web,
    nestedProduct?.preview_img,
    nestedProduct?.preview_image,
    nestedProduct?.preview_img_web
  );

  const rawCount =
    rawProduct?.count ?? rawProduct?.quantity ?? rawProduct?.en_carrito ?? nestedProduct?.count;
  const count = Number(rawCount);

  return {
    ...nestedProduct,
    ...rawProduct,
    name: firstText(rawProduct?.name, nestedProduct?.name) ?? 'Producto',
    brand: firstText(rawProduct?.brand, nestedProduct?.brand) ?? '',
    price: rawProduct?.price ?? nestedProduct?.price ?? 0,
    temporal_price: rawProduct?.temporal_price ?? nestedProduct?.temporal_price,
    currency: rawProduct?.currency ?? nestedProduct?.currency,
    img: image ?? null,
    preview_img: previewImage ?? null,
    count: Number.isFinite(count) ? count : 0,
  };
}

function mapOrder(order: any): Order {
  let dateStr = order.date || '';
  let finalDate = dateStr;
  let finalTime = order.time || '';
  if (dateStr.includes(' ')) {
    const parts = dateStr.split(' ');
    finalDate = parts[0];
    finalTime = parts[1];
  } else if (dateStr.includes('T')) {
    const parts = dateStr.split('T');
    finalDate = parts[0];
    finalTime = parts[1].split('.')[0];
  }

  const rawStatus = order.state !== undefined ? order.state : order.status;
  let finalStatus = order.status;
  if (rawStatus === 1 || rawStatus === '1') finalStatus = 'Confirmado';
  else if (rawStatus === 0 || rawStatus === '0') finalStatus = 'En espera';
  else if (rawStatus === -1 || rawStatus === '-1') finalStatus = 'Cancelado';

  let finalCell = order.client_cell;
  const hasDirection = order.direccion && order.direccion.trim() !== '';
  const cell2 = order.client_cell2 || order.cellphone2;
  const hasPlus = order.client_cell && order.client_cell.includes('+');
  if (hasDirection && cell2 && !hasPlus) finalCell = cell2;

  return {
    ...order,
    id: String(order.id),
    codigo: String(order.codigo ?? order.id),
    date: finalDate,
    time: finalTime,
    status: finalStatus,
    client_cell: finalCell,
  };
}

export async function fetchOrders(lastId = '', size = 10, searchText = ''): Promise<OrdersPage> {
  const { data } = await apiClient.post(ENDPOINTS.getOrders, {
    last_id: lastId,
    size: size + 11,
    search_text: searchText,
  });
  const processedData = data.map(mapOrder);
  return { orders: processedData, hasMore: data.length > size + 10 };
}

export async function fetchOrderProducts(orderId: string | number): Promise<OrderProduct[] | null> {
  const { data } = await apiClient.post(ENDPOINTS.getOrderProducts, { id_order: orderId });
  const rawProducts = Array.isArray(data?.products)
    ? data.products
    : Array.isArray(data)
      ? data
      : [];
  return rawProducts.map(mapOrderProduct);
}

export async function fetchOrderNote(orderId: string | number): Promise<OrderNote[] | null> {
  const { data } = await apiClient.post(ENDPOINTS.getOrderNote, { id_order: orderId });
  if (data && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
    return data.messages;
  }
  return null;
}

export async function denyOrder(orderId: string | number): Promise<void> {
  await apiClient.post(ENDPOINTS.denyOrder, { id_order: orderId });
}
