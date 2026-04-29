import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShopItem, CartItem } from './types';

interface ShopStore {
  items: ShopItem[];
  cart: CartItem[];
  purchasedItems: string[]; // Array of item IDs
  isLoading: boolean;

  // Actions
  setItems: (items: ShopItem[]) => void;
  addToCart: (item: ShopItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  addPurchasedItem: (itemId: string) => void;
  setLoading: (loading: boolean) => void;
  getCartTotal: () => { knb: number };
  getCartItemCount: () => number;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      items: [],
      cart: [],
      purchasedItems: [],
      isLoading: false,

      setItems: (items) => set({ items }),

      addToCart: (item, quantity = 1) =>
        set((state) => {
          const existingItem = state.cart.find((cartItem) => cartItem.id === item.id);
          if (existingItem) {
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + quantity }
                  : cartItem
              ),
            };
          }
          return {
            cart: [...state.cart, { ...item, quantity }],
          };
        }),

      removeFromCart: (itemId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== itemId),
        })),

      updateCartQuantity: (itemId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
          ),
        })),

      clearCart: () => set({ cart: [] }),

      addPurchasedItem: (itemId) =>
        set((state) => ({
          purchasedItems: [...state.purchasedItems, itemId],
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      getCartTotal: () => {
        const cart = get().cart;
        return cart.reduce(
          (total, item) => {
            const itemTotal = item.price * item.quantity;
            total.knb += itemTotal;
            return total;
          },
          { knb: 0 }
        );
      },

      getCartItemCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'chinese-chess-shop-storage',
      partialize: (state) => ({
        purchasedItems: state.purchasedItems,
        // Don't persist cart - it should be cleared on checkout
      }),
    }
  )
);

