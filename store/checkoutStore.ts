import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustandStorage';
import type { SelectedStore } from '@/types/cart';

const FORM_STORAGE_NAME = 'form-storage';

export type CheckoutFormData = {
  phone: string;
  province: string;
  municipality: string;
  delivery: boolean;
  deliveryPrice?: number;
  customerName?: string;
  firstName: string;
  lastName1: string;
  lastName2: string;
  address: string;
  note?: string;
  stores?: SelectedStore[];
  showDeliveryOverlay?: boolean;
  overlayDelivery?: boolean;
  orderId?: string;
};

export type CheckoutState = {
  formData: CheckoutFormData;
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  setFormData: (data: CheckoutFormData) => void;
  clearFormData: () => void;
  resetToDefaults: () => void;
};

export const defaultFormData: CheckoutFormData = {
  phone: '+53 ',
  province: '',
  municipality: '',
  delivery: false,
  deliveryPrice: 0,
  customerName: '',
  firstName: '',
  lastName1: '',
  lastName2: '',
  address: '',
  note: '',
  stores: [],
  showDeliveryOverlay: false,
  overlayDelivery: false,
  orderId: '',
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      formData: defaultFormData,

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      setFormData: (data) => set({ formData: data }),

      clearFormData: () => set({ formData: defaultFormData }),

      resetToDefaults: () => set({ formData: defaultFormData }),
    }),
    {
      name: FORM_STORAGE_NAME,
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      partialize: (state) => ({ formData: state.formData }),
    },
  ),
);

export default useCheckoutStore;