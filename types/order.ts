export type OrderProduct = {
  name: string;
  brand: string;
  price: number;
  temporal_price?: number | string;
  currency?: {
    currency: string;
  };
  img: string;
  count: number;
};

export type OrderNote = {
  id: string;
  id_user: string;
  id_order: string;
  date: string;
  message: string;
};

export type Order = {
  id: string;
  codigo: string;
  date: string;
  time: string;
  client_ci: string;
  client_name?: string;
  client_last_names?: string;
  client_cell: string;
  client_cell2?: string;
  direccion: string;
  tipo_pago: string;
  municipio_completo?: {
    municipio: string;
  };
  provincia_completa?: {
    provincia: string;
  };
  tienda: {
    name: string;
    direccion: string;
  };
  nota?: OrderNote[];
  status: 'En espera' | 'Confirmado' | 'Cancelado' | string;
  products: OrderProduct[];
};

export type Statistic = {
  name: string;
  text: string;
  value: number;
};