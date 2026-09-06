import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { EMISOR } from '@/lib/api/config';
import type { Product, ProductID } from '@/types/product';

export async function fetchLatestProducts(
  count: number,
  municipalityId?: string | null,
  provinceId?: string | null,
): Promise<Product[]> {
  const { data } = await apiClient.post(ENDPOINTS.latestProducts, {
    count,
    municipio: municipalityId,
    id_provincia: provinceId,
    emisor: EMISOR,
  });
  return (data.products ?? []).map((p: any) => ({
    ...p,
    id: String(p.id),
    img: p.img ?? p.image,
  }));
}

export async function fetchBestSelling(
  count: number,
  municipalityId?: string | null,
  provinceId?: string | null,
): Promise<Product[]> {
  const { data } = await apiClient.post(ENDPOINTS.bestSelling, {
    count,
    municipio: municipalityId,
    id_provincia: provinceId,
  });
  const products = Array.isArray(data) ? data : [];
  return products.map((p: any) => ({
    ...p,
    id: String(p.id),
    img: p.img ?? p.image,
  }));
}

export async function fetchProductForVisual(id: string): Promise<ProductID | null> {
  const { data } = await apiClient.post(ENDPOINTS.getProductForVisual, {
    id_product: id,
  });
  const product = data?.product;
  if (!product) return null;
  return {
    ...product,
    id: String(product.id),
    img: product.image || product.img,
    currency: data.currencys?.[0] || { currency: 'USD' },
  } as ProductID;
}