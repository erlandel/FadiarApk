import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustandStorage';

const BUYER_STORAGE_NAME = 'buyer-details-storage';

export const PAYMENT_METHODS = {
  delivery: ['Pago al momento de la entrega', 'Zelle'],
  pickup: ['Recogida en tienda', 'Zelle'],
} as const;

export type BuyerDetailsData = {
  paymentMethod: string;
};

type BuyerDetailsState = {
  buyerDetails: BuyerDetailsData;
  setPaymentMethod: (method: string) => void;
  clearBuyerDetails: () => void;
};

const defaultBuyerDetails: BuyerDetailsData = {
  paymentMethod: 'Pago al momento de la entrega',
};

export const useBuyerDetailsStore = create<BuyerDetailsState>()(
  persist(
    (set) => ({
      buyerDetails: defaultBuyerDetails,
      setPaymentMethod: (method) =>
        set((state) => ({
          buyerDetails: { ...state.buyerDetails, paymentMethod: method },
        })),
      clearBuyerDetails: () => set({ buyerDetails: defaultBuyerDetails }),
    }),
    {
      name: BUYER_STORAGE_NAME,
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      partialize: (state) => ({ buyerDetails: state.buyerDetails }),
    },
  ),
);

export default useBuyerDetailsStore;