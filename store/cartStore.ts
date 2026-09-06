import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustandStorage';
import type { CartItem } from '@/types/cart';

const CART_STORAGE_NAME = 'cart-storage';

type CartState = {
  items: CartItem[];
  rawCart: any[];
  addOrUpdateItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  setItems: (items: CartItem[]) => void;
  setRawCart: (rawCart: any[]) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

const parseNum = (value: string) => parseFloat(String(value).replace(/[^0-9.]/g, ''));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      rawCart: [],

      addOrUpdateItem: (item) => {
        const quantity = Math.max(1, item.quantity);
        set((state) => {
          const existingIndex = state.items.findIndex(
            (existing) => existing.productId === item.productId,
          );
          if (existingIndex === -1) {
            return { items: [...state.items, { ...item, quantity }] };
          }
          const updatedItems = [...state.items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + quantity,
          };
          return { items: updatedItems };
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        }));
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      setItems: (items) => set({ items }),
      setRawCart: (rawCart) => set({ rawCart }),

      clearCart: () => set({ items: [], rawCart: [] }),

      getItemQuantity: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        return item?.quantity || 0;
      },

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + (parseNum(item.price) * item.quantity),
          0,
        ),
    }),
    {
      name: CART_STORAGE_NAME,
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
    },
  ),
);

export default useCartStore;