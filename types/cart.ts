export type CartItem = {
  cartId?: string;
  productId: string;
  title: string;
  brand: string;
  category?: string;
  warranty?: string;
  price: string;
  temporal_price?: string;
  image: string;
  quantity: number;
  expiryTimestamp?: number;
  currency?: {
    currency: string;
  };
  tiendaId?: string;
  tiendaName?: string;
  tiendaDireccion?: string;
};

export type SelectedStore = {
  id: string;
  name: string;
  direccion?: string;
  products: any[];
  deliveryPrice?: number;
};