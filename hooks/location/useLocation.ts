import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProvincesMunicipalities } from '../../data/services/location.service';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';
import type { MunicipalityData, ProvinceData } from '@/types/location';

export function useLocationData() {
  const setProvincesVersion = useProductsByLocationStore((s) => s.setProvincesVersion);

  const query = useQuery({
    queryKey: ['provinces-municipalities'],
    queryFn: async () => {
      const res = await fetchProvincesMunicipalities();
      if (res.version) setProvincesVersion(res.version);
      return res.provincias ?? [];
    },
    staleTime: Infinity,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? 'Error al cargar las provincias' : null,
    refetch: query.refetch,
  };
}

export function useLocation(options?: { useGlobalStore?: boolean }) {
  const useGlobalStore = options?.useGlobalStore ?? true;

  const {
    province: storeProvince,
    provinceId: storeProvinceId,
    municipality: storeMunicipality,
    municipalityId: storeMunicipalityId,
    setLocation,
  } = useProductsByLocationStore();

  const { data: provinces, isLoading } = useLocationData();

  const [selectedProvince, setSelectedProvince] = useState(
    useGlobalStore ? storeProvince || '' : ''
  );
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(
    useGlobalStore ? storeProvinceId || null : null
  );
  const [selectedMunicipality, setSelectedMunicipality] = useState(
    useGlobalStore ? storeMunicipality || '' : ''
  );
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(
    useGlobalStore ? storeMunicipalityId || null : null
  );

  const handleProvinceChange = (prov: ProvinceData) => {
    setSelectedProvince(prov.provincia);
    setSelectedProvinceId(prov.id);
    setSelectedMunicipality('');
    setSelectedMunicipalityId(null);
    if (useGlobalStore) {
      setLocation(prov.provincia, prov.id, '', null);
    }
  };

  const handleMunicipalityChange = (mun: MunicipalityData) => {
    const finalProvince = useGlobalStore ? selectedProvince || storeProvince : selectedProvince;
    let finalProvinceId = useGlobalStore
      ? selectedProvinceId || storeProvinceId
      : selectedProvinceId;
    if (!finalProvinceId && finalProvince) {
      const found = provinces.find((p) => p.provincia === finalProvince);
      if (found) finalProvinceId = found.id;
    }
    setSelectedMunicipality(mun.municipio);
    setSelectedMunicipalityId(mun.id);
    if (useGlobalStore) {
      setLocation(finalProvince, finalProvinceId ?? null, mun.municipio, mun.id);
    }
  };

  const municipalities =
    provinces.find(
      (p) => p.provincia === (useGlobalStore ? selectedProvince || storeProvince : selectedProvince)
    )?.municipios || [];

  return {
    data: provinces,
    provinces,
    municipalities,
    loading: isLoading,
    isLoading,
    selectedProvince: useGlobalStore ? selectedProvince || storeProvince : selectedProvince,
    selectedProvinceId: useGlobalStore ? selectedProvinceId || storeProvinceId : selectedProvinceId,
    selectedMunicipality: useGlobalStore
      ? selectedMunicipality || storeMunicipality
      : selectedMunicipality,
    selectedMunicipalityId: useGlobalStore
      ? selectedMunicipalityId || storeMunicipalityId
      : selectedMunicipalityId,
    handleProvinceChange,
    handleMunicipalityChange,
    setSelectedProvince,
    setSelectedProvinceId,
    setSelectedMunicipality,
    setSelectedMunicipalityId,
  };
}
