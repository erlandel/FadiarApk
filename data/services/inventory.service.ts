import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { EMISOR } from '@/lib/api/config';
import type { InventoryData, Store } from '@/types/product';

export async function fetchInventory(provinceId?: string | null): Promise<InventoryData> {
  const params: Record<string, string> = {
    emisor: EMISOR,
    productos: 'true',
  };
  if (provinceId) params.provincia = provinceId.toString();

  const { data } = await apiClient.get(ENDPOINTS.inventoryManager, { params });

  const realTiendas = (data.tiendas ?? []).filter((t: any) => t.active);
  const processedTiendas: Store[] = realTiendas.map((t: any) => ({
    ...t,
    productos: (t.productos ?? []).map((p: any) => ({
      ...p,
      id: String(p.id),
      img: p.img ?? p.image,
      tiendaId: t.id,
    })),
  }));

  const products = processedTiendas.flatMap((t) => t.productos ?? []);

  return {
    products,
    tiendas: processedTiendas,
    currencys: data.currencys ?? null,
  };
}

export async function fetchUpcomingProducts(provinceId?: string | null): Promise<any[]> {
  const params: Record<string, string> = {
    emisor: EMISOR,
    pre_venta_only: 'true',
  };
  if (provinceId) params.provincia = provinceId.toString();

  const { data } = await apiClient.get(ENDPOINTS.inventoryManager, { params });

  const realTiendas = (data.tiendas ?? []).filter((t: any) => t.active);
  const processedTiendas = realTiendas.map((t: any) => ({
    ...t,
    productos: (t.productos ?? []).map((p: any) => ({
      ...p,
      id: String(p.id),
      img: p.img ?? p.image,
      tiendaId: t.id,
    })),
  }));

  return processedTiendas.flatMap((t: Store) => t.productos ?? []);
}