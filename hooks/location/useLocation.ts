import { useEffect, useMemo, useState } from 'react';
import { LOCATION_DATA_VERSION, PROVINCES_MUNICIPALITIES } from '@/data/provincesMunicipalities';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';
import type { MunicipalityData, ProvinceData } from '@/types/location';

const LOCAL_LOCATION_DATA = PROVINCES_MUNICIPALITIES;

export function useLocationData() {
  const setProvincesVersion = useProductsByLocationStore((state) => state.setProvincesVersion);

  useEffect(() => {
    setProvincesVersion(LOCATION_DATA_VERSION);
  }, [setProvincesVersion]);

  return {
    data: LOCAL_LOCATION_DATA,
    provinces: LOCAL_LOCATION_DATA,
    isLoading: false,
    loading: false,
    error: null,
    refetch: async () => ({ data: LOCAL_LOCATION_DATA }),
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
  const { provinces } = useLocationData();

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

  const [selectionSource, setSelectionSource] = useState<{
    province: string;
    provinceId: string | null;
    municipalityId: string | null;
    useGlobalStore: boolean;
  } | null>(null);

  // Synchronize before children commit, preserving local edits until the saved location changes.
  if (
    selectionSource === null ||
    selectionSource.province !== storeProvince ||
    selectionSource.provinceId !== storeProvinceId ||
    selectionSource.municipalityId !== storeMunicipalityId ||
    selectionSource.useGlobalStore !== useGlobalStore
  ) {
    setSelectionSource({
      province: storeProvince,
      provinceId: storeProvinceId,
      municipalityId: storeMunicipalityId,
      useGlobalStore,
    });
    if (useGlobalStore) {
      const province = provinces.find((item) => item.id === (storeProvinceId || ''));
      const municipality = province?.municipios.find(
        (item) => item.id === (storeMunicipalityId || '')
      );
      setSelectedProvince(province?.provincia ?? storeProvince ?? '');
      setSelectedProvinceId(province?.id ?? storeProvinceId ?? null);
      setSelectedMunicipality(municipality?.municipio ?? '');
      setSelectedMunicipalityId(municipality?.id ?? null);
    }
  }

  useEffect(() => {
    if (!useGlobalStore) return;

    const province = provinces.find((item) => item.id === (storeProvinceId || ''));
    const municipality = province?.municipios.find(
      (item) => item.id === (storeMunicipalityId || '')
    );

    if (storeProvinceId && !province) {
      setLocation('', null, '', null);
      return;
    }
    if (storeMunicipalityId && !municipality && province) {
      setLocation(province.provincia, province.id, '', null);
      return;
    }
  }, [provinces, setLocation, storeMunicipalityId, storeProvince, storeProvinceId, useGlobalStore]);

  const handleProvinceChange = (province: ProvinceData) => {
    setSelectedProvince(province.provincia);
    setSelectedProvinceId(province.id);
    setSelectedMunicipality('');
    setSelectedMunicipalityId(null);
  };

  const handleMunicipalityChange = (municipality: MunicipalityData) => {
    setSelectedMunicipality(municipality.municipio);
    setSelectedMunicipalityId(municipality.id);
  };

  const confirmLocation = () => {
    if (!useGlobalStore || !selectedProvinceId || !selectedMunicipalityId) return false;
    setLocation(selectedProvince, selectedProvinceId, selectedMunicipality, selectedMunicipalityId);
    return true;
  };

  const municipalities = useMemo(
    () => provinces.find((province) => province.id === selectedProvinceId)?.municipios ?? [],
    [provinces, selectedProvinceId]
  );

  return {
    data: provinces,
    provinces,
    municipalities,
    loading: false,
    isLoading: false,
    error: null,
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
    confirmLocation,
    setSelectedProvince,
    setSelectedProvinceId,
    setSelectedMunicipality,
    setSelectedMunicipalityId,
  };
}
