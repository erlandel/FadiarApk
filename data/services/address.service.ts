import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { useAuthStore } from '@/store/authStore';
import type { Address } from '@/types/location';

function mapAddresses(data: any): Address[] {
  let list: any[] = [];
  if (data && data.listado && Array.isArray(data.listado)) list = data.listado;
  else if (Array.isArray(data)) list = data;

  return list.map((addr: any) => {
    const municipioNombre = addr.to_jsonb || addr.municipio;
    return {
      ...addr,
      municipio: municipioNombre,
      municipioId: addr.id_municipio,
      provincia: addr.provincia,
    };
  });
}

export async function fetchAddresses(): Promise<Address[]> {
  const auth = useAuthStore.getState().auth;
  if (!auth) return [];

  const { data, status } = await apiClient.post(ENDPOINTS.getAddresses, {
    id_user: auth.user.id,
  });
  if (status === 204) return [];
  return mapAddresses(data);
}

export async function addAddress(address: string, municipalityId: string): Promise<void> {
  const auth = useAuthStore.getState().auth;
  await apiClient.post(ENDPOINTS.addAddress, {
    id_user: auth?.user.id,
    municipio: municipalityId,
    direccion: address,
  });
}

export async function editAddress(params: {
  id_direccion: string;
  municipio: string;
  direccion: string;
}): Promise<void> {
  await apiClient.post(ENDPOINTS.editAddress, params);
}

export async function deleteAddress(addressId: string): Promise<void> {
  await apiClient.post(ENDPOINTS.deleteAddress, { id_direccion: addressId });
}