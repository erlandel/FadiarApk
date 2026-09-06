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
  specs?: Array<{ name: string; description: string }>;
};

export type Store = {
  id: string;
  name: string;
  direccion?: string;
  active?: boolean;
  productos?: Product[];
  domicilios?: Array<{
    id_municipio: string | number;
    price: number;
  }>;
};

export interface InventoryData {
  products: Product[];
  tiendas: Store[];
  currencys: any;
}