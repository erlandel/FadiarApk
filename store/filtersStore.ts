import { create } from 'zustand';
import { normalizeText } from '@/utils/format';

type FiltersState = {
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  selectedCategories: string[];
  selectedCategoryIds: string[];
  selectedBrands: string[];
  selectedPrice: [number, number] | null;
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  setSelectedCategoryIds: (ids: string[]) => void;
  setSelectedBrands: (brands: string[]) => void;
  setSelectedPrice: (price: [number, number] | null) => void;
  clearFilters: () => void;
  shouldScrollToProducts: boolean;
  setShouldScrollToProducts: (value: boolean) => void;
};

export const useFiltersStore = create<FiltersState>((set) => ({
  isFilterOpen: false,
  setIsFilterOpen: (isOpen) => set({ isFilterOpen: isOpen }),
  selectedCategories: [],
  selectedCategoryIds: [],
  selectedBrands: [],
  selectedPrice: null,
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  shouldScrollToProducts: false,
  setShouldScrollToProducts: (value) => set({ shouldScrollToProducts: value }),
  toggleCategory: (category) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.some(
        (selected) => normalizeText(selected) === normalizeText(category)
      )
        ? state.selectedCategories.filter(
            (selected) => normalizeText(selected) !== normalizeText(category)
          )
        : [...state.selectedCategories, category],
    })),
  setSelectedCategoryIds: (selectedCategoryIds) => set({ selectedCategoryIds }),
  setSelectedBrands: (selectedBrands) => set({ selectedBrands }),
  setSelectedPrice: (selectedPrice) => set({ selectedPrice }),
  clearFilters: () =>
    set({
      selectedCategories: [],
      selectedCategoryIds: [],
      selectedBrands: [],
      selectedPrice: null,
    }),
}));

export default useFiltersStore;
