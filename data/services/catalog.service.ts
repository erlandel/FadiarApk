import { apiClient } from '@/lib/api/client';
import { EMISOR } from '@/lib/api/config';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { CatalogContext, Product, ProductCategory, Store } from '@/types/product';

const normalizeProduct = (raw: any, storeId?: string): Product => {
  const stores = (raw.tiendas ?? [])
    .map((store: any) => String(typeof store === 'string' ? store : (store.id ?? '')))
    .filter(Boolean);
  const selectedStore = storeId ?? raw.tiendaId ?? raw.id_tienda ?? stores[0];
  const category = raw.categoria;
  const currency = raw.currency;

  return {
    ...raw,
    id: String(raw.id),
    name: raw.name ?? '',
    brand: raw.brand ?? '',
    warranty: String(raw.warranty ?? '0'),
    price: String(raw.price ?? '0'),
    temporal_price: raw.temporal_price == null ? undefined : String(raw.temporal_price),
    img: raw.img ?? raw.image ?? '',
    preview_img: raw.preview_img ?? undefined,
    img_web: raw.img_web ?? undefined,
    preview_img_web: raw.preview_img_web ?? undefined,
    categoria:
      typeof category === 'string'
        ? { id: '', name: category }
        : category
          ? { id: String(category.id ?? ''), name: category.name ?? '' }
          : undefined,
    currency:
      typeof currency === 'string' ? { currency } : { currency: currency?.currency ?? 'USD' },
    tiendaId: selectedStore,
    id_tienda: selectedStore,
    tiendas: stores,
    pre_venta: Boolean(raw.pre_venta ?? raw.preVenta),
  };
};

export async function fetchCatalogContext(provinceId?: string | null): Promise<CatalogContext> {
  const { data } = await apiClient.get(ENDPOINTS.inventoryManager, {
    params: { emisor: EMISOR, ...(provinceId ? { provincia: provinceId } : {}) },
  });
  const tiendas = (data.tiendas ?? [])
    .filter((store: Store) => store.active !== false)
    .map((store: Store) => ({ ...store, id: String(store.id), productos: undefined }));
  return { tiendas, currencys: data.currencys ?? null, maxPrice: Number(data.precio_maximo ?? 0) };
}

export async function fetchFeaturedProducts(
  provinceId: string,
  counts = {
    latest: 15,
    offers: 9,
    bestSelling: 15,
  }
) {
  const { data } = await apiClient.get(ENDPOINTS.featuredProductsByZone, {
    params: {
      emisor: EMISOR,
      id_provincia: provinceId,
      cantidad_ultimos: counts.latest,
      cantidad_descuentos: counts.offers,
      cantidad_mas_vendidos: counts.bestSelling,
    },
  });
  const products = new Map(
    (data.productos ?? []).map((item: any) => {
      const product = normalizeProduct(item);
      return [product.id, product];
    })
  );
  const select = (ids: any[] = []) =>
    ids.map((id) => products.get(String(id))).filter(Boolean) as Product[];
  return {
    latest: select(data.ultimos),
    offers: select(data.descuentos),
    bestSelling: select(data.mas_vendidos),
  };
}

export type StoreProductsParams = {
  provinceId: string;
  storeId: string;
  categoryIds?: string[];
  brands?: string[];
  price?: [number, number];
  maxPrice?: number;
  searchText?: string;
  cursor?: string;
};

export async function fetchStoreProducts(params: StoreProductsParams) {
  const query: Record<string, string> = {
    emisor: EMISOR,
    id_tienda: params.storeId,
    descendente: 'true',
  };
  if (params.cursor) query.last_id = params.cursor;
  if (params.categoryIds?.length) query.ids_categorias = JSON.stringify(params.categoryIds);
  if (params.brands?.length) query.marcas = JSON.stringify(params.brands);
  if (
    params.price &&
    params.maxPrice &&
    (params.price[0] > 0 || params.price[1] < params.maxPrice)
  ) {
    query.precio_min = String(params.price[0]);
    query.precio_max = String(params.price[1]);
  }
  if (params.searchText?.trim()) query.search_text = params.searchText.trim();
  const { data } = await apiClient.get(ENDPOINTS.storeProducts, { params: query });
  const products = (data.productos ?? []).map((item: any) =>
    normalizeProduct(item, params.storeId)
  );
  return { products, nextCursor: products.length === 10 ? products.at(-1)?.id : undefined };
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  const { data } = await apiClient.get(ENDPOINTS.categoriesTree);
  return Array.isArray(data) ? data : [];
}

export async function fetchBrands(): Promise<string[]> {
  const { data } = await apiClient.get(ENDPOINTS.brands);
  return (data.marcas ?? []).map((item: any) => item.marca?.trim()).filter(Boolean);
}

export async function searchProducts(provinceId: string, searchText: string, cursor?: string) {
  const { data } = await apiClient.get(ENDPOINTS.searchProductsByZone, {
    params: {
      emisor: EMISOR,
      id_provincia: provinceId,
      search_text: searchText.trim(),
      cantidad: 10,
      ...(cursor ? { last_id: cursor } : {}),
      ...(!cursor ? { sugerencias: "['pedidos', 'categoria']", cantidad_sugerencias: 6 } : {}),
    },
  });
  const products = (data.productos ?? []).map((item: any) => normalizeProduct(item));
  const suggested = [...(data.sugeridos?.pedidos ?? []), ...(data.sugeridos?.categoria ?? [])].map(
    (item: any) => normalizeProduct(item)
  );
  return {
    products,
    suggestedProducts: suggested,
    nextCursor: products.length === 10 ? products.at(-1)?.id : undefined,
  };
}

export async function fetchRelatedProducts(
  provinceId: string,
  categoryId: string,
  productId: string,
  storeId?: string,
  productName?: string
): Promise<Product[]> {
  const { data } = await apiClient.get(ENDPOINTS.searchProductsByZone, {
    params: {
      emisor: EMISOR,
      id_provincia: provinceId,
      ids_categorias: JSON.stringify([categoryId]),
      cantidad: 50,
    },
  });
  const available = (data.productos ?? [])
    .filter((item: any) => String(item.id) !== String(productId))
    .filter(
      (item: any) =>
        !storeId ||
        (item.tiendas ?? []).some(
          (store: any) => String(typeof store === 'string' ? store : store.id) === String(storeId)
        )
    )
    .map((item: any) => normalizeProduct(item, storeId));
  const unique = new Map<string, Product>(
    available.map((product: Product) => [product.id, product])
  );
  if (unique.size < 6) {
    try {
      const { data: suggestions } = await apiClient.get(ENDPOINTS.searchProductsByZone, {
        params: {
          emisor: EMISOR,
          id_provincia: provinceId,
          search_text: productName?.trim() ?? '',
          cantidad: 20,
          sugerencias: "['pedidos', 'categoria']",
          cantidad_sugerencias: 6,
        },
      });
      for (const raw of [
        ...(suggestions.sugeridos?.pedidos ?? []),
        ...(suggestions.sugeridos?.categoria ?? []),
      ]) {
        const product = normalizeProduct(raw);
        if (product.id === String(productId) || unique.has(product.id)) continue;
        if (storeId && !product.tiendas?.includes(String(storeId))) continue;
        unique.set(product.id, normalizeProduct(raw, storeId));
      }
    } catch {
      // Keep category matches when complementary suggestions are unavailable.
    }
  }
  return [...unique.values()].slice(0, 6);
}
