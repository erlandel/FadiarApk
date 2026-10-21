export type Product = {
  id: string;
  name: string;
  brand: string;
  warranty: string;
  price: string;
  temporal_price?: string;
  img: string;
  count?: number;
  currency?: {
    currency: string;
  };
  categoria?: {
    id: string;
    name: string;
  };
  tiendaId?: string;
  id_tienda?: string;
  isPreSale?: boolean;
  pre_venta?: boolean;
  tiendas?: string[];
  preview_img?: string;
  img_web?: string;
  preview_img_web?: string;
  specs?: { name: string; description: string }[];
};

export type ProductID = {
  id: string;
  name: string;
  brand: string;
  warranty: string;
  price: string;
  temporal_price?: string;
  img: string;
  currency?: {
    currency: string;
  };
  categoria?: {
    id: string;
    name: string;
  };
  description?: string;
  tiendaId?: string;
  count?: number;
  specs?: { name: string; description: string }[];
  pre_venta?: boolean;
  tiendas?: string[];
  preview_img?: string;
  img_web?: string;
  preview_img_web?: string;
  imagenes?: {
    img: string;
    preview_img?: string | null;
  }[];
};

export type Store = {
  id: string;
  name: string;
  direccion?: string;
  active?: boolean;
  productos?: Product[];
  domicilios?: {
    id_municipio: string | number;
    price: number;
  }[];
};

export interface InventoryData {
  products: Product[];
  tiendas: Store[];
  currencys: any;
}

export type ProductCategory = {
  id: string;
  name: string;
  hijos?: ProductCategory[];
};

export type CatalogContext = {
  tiendas: Store[];
  currencys: any;
  maxPrice: number;
};
