import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ProvinceData } from '@/types/location';

export type LocationResponse = {
  provincias?: ProvinceData[];
  version?: string | null;
};

export async function fetchProvincesMunicipalities(): Promise<LocationResponse> {
  const { data } = await apiClient.get(ENDPOINTS.provincesMunicipalities);
  const provinces = Array.isArray(data) ? data : data?.provincias;
  if (!Array.isArray(provinces)) {
    throw new Error('Error al cargar las provincias');
  }
  return { provincias: provinces, version: data?.version ?? null };
}