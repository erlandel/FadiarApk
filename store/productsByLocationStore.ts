import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustandStorage';

const LOCATION_STORAGE_NAME = 'products-by-location-storage';

type ProductsByLocationState = {
  province: string;
  provinceId: string | null;
  municipality: string;
  municipalityId: string | null;
  isOpen: boolean;
  products: any[];
  tiendas: any[];
  currencys: any;
  globalProducts: any[];
  lastFetchedMunicipalityId: string | null;
  provincesVersion: string | null;
  setLocation: (
    province: string,
    provinceId: string | null,
    municipality: string,
    municipalityId: string | null,
  ) => void;
  clearLocation: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setProductsData: (data: {
    products: any[];
    tiendas: any[];
    currencys: any;
    municipalityId: string | null;
  }) => void;
  setGlobalProducts: (products: any[]) => void;
  setProvincesVersion: (version: string | null) => void;
};

export const useProductsByLocationStore = create<ProductsByLocationState>()(
  persist(
    (set) => ({
      province: '',
      provinceId: null,
      municipality: '',
      municipalityId: null,
      isOpen: false,
      products: [],
      tiendas: [],
      currencys: null,
      globalProducts: [],
      lastFetchedMunicipalityId: null,
      provincesVersion: null,

      setLocation: (province, provinceId, municipality, municipalityId) =>
        set({ province, provinceId, municipality, municipalityId }),

      clearLocation: () =>
        set({
          province: '',
          provinceId: null,
          municipality: '',
          municipalityId: null,
          products: [],
          tiendas: [],
          currencys: null,
          globalProducts: [],
          lastFetchedMunicipalityId: null,
          provincesVersion: null,
        }),

      setIsOpen: (isOpen) => set({ isOpen }),

      setProductsData: ({ products, tiendas, currencys, municipalityId }) =>
        set({ products, tiendas, currencys, lastFetchedMunicipalityId: municipalityId }),

      setGlobalProducts: (globalProducts) => set({ globalProducts }),

      setProvincesVersion: (provincesVersion) => set({ provincesVersion }),
    }),
    {
      name: LOCATION_STORAGE_NAME,
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      partialize: (state) => ({
        province: state.province,
        provinceId: state.provinceId,
        municipality: state.municipality,
        municipalityId: state.municipalityId,
        provincesVersion: state.provincesVersion,
      }),
    },
  ),
);

export default useProductsByLocationStore;