import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number | null;
  description?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  category_id?: string | null;
  stock_quantity?: number | null;
  images?: { id: string; url: string; is_primary?: boolean }[];
}

export interface DBCartItem {
  product: DBProduct;
  variantId: string | null;
  quantity: number;
  size: string;
  color: string;
  priceAtAdd: number;
  discountedPrice?: number;
}

interface CartStore {
  items: DBCartItem[];
  isOpen: boolean;
  addItem: (product: DBProduct, variantId: string | null, size: string, color: string, price: number, discountedPrice?: number, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variantId, size, color, price, discountedPrice, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(
          (item) =>
            item.product.id === product.id &&
            item.size === size &&
            item.color === color
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id &&
              item.size === size &&
              item.color === color
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ 
            items: [...items, { 
              product, 
              variantId, 
              size, 
              color, 
              quantity, 
              priceAtAdd: price,
              discountedPrice 
            }] 
          });
        }
      },

      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.size === size &&
                item.color === color
              )
          ),
        });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.product.id === productId &&
            item.size === size &&
            item.color === color
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => {
            const price = item.discountedPrice ?? item.priceAtAdd;
            return total + price * item.quantity;
          },
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'blaqroth-cart',
    }
  )
);
