import { create } from 'zustand';

type FiltersState = {
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  shouldScrollToProducts: boolean;
  setShouldScrollToProducts: (value: boolean) => void;
};

export const useFiltersStore = create<FiltersState>((set) => ({
  isFilterOpen: false,
  setIsFilterOpen: (isOpen) => set({ isFilterOpen: isOpen }),
  selectedCategories: [],
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  shouldScrollToProducts: false,
  setShouldScrollToProducts: (value) => set({ shouldScrollToProducts: value }),
  toggleCategory: (category) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(category)
        ? state.selectedCategories.filter((c) => c !== category)
        : [...state.selectedCategories, category],
    })),
}));

export default useFiltersStore;