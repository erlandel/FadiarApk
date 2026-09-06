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

export function useLocation() {
  const {
    province: storeProvince,
    provinceId: storeProvinceId,
    municipality: storeMunicipality,
    municipalityId: storeMunicipalityId,
    setLocation,
  } = useProductsByLocationStore();

  const { data: provinces, isLoading } = useLocationData();

  const [selectedProvince, setSelectedProvince] = useState(storeProvince || '');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(storeProvinceId || null);
  const [selectedMunicipality, setSelectedMunicipality] = useState(storeMunicipality || '');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(storeMunicipalityId || null);

  const handleProvinceChange = (prov: ProvinceData) => {
    setSelectedProvince(prov.provincia);
    setSelectedProvinceId(prov.id);
    setSelectedMunicipality('');
    setSelectedMunicipalityId(null);
    setLocation(prov.provincia, prov.id, '', null);
  };

  const handleMunicipalityChange = (mun: MunicipalityData) => {
    const finalProvince = selectedProvince || storeProvince;
    let finalProvinceId = selectedProvinceId || storeProvinceId;
    if (!finalProvinceId && finalProvince) {
      const found = provinces.find((p) => p.provincia === finalProvince);
      if (found) finalProvinceId = found.id;
    }
    setSelectedMunicipality(mun.municipio);
    setSelectedMunicipalityId(mun.id);
    setLocation(finalProvince, finalProvinceId ?? null, mun.municipio, mun.id);
  };

  const municipalities =
    provinces.find((p) => p.provincia === (selectedProvince || storeProvince))?.municipios || [];

  return {
    provinces,
    municipalities,
    isLoading,
    selectedProvince: selectedProvince || storeProvince,
    selectedProvinceId: selectedProvinceId || storeProvinceId,
    selectedMunicipality: selectedMunicipality || storeMunicipality,
    selectedMunicipalityId: selectedMunicipalityId || storeMunicipalityId,
    handleProvinceChange,
    handleMunicipalityChange,
    setSelectedProvince,
    setSelectedMunicipality,
  };
}