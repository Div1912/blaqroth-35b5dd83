import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

interface WishlistStore {
  items: string[]; // product IDs
  isLoading: boolean;
  addItem: (productId: string, userId?: string) => Promise<void>;
  removeItem: (productId: string, userId?: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  syncWithServer: (userId: string) => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: async (productId: string, userId?: string) => {
        const items = get().items;
        if (!items.includes(productId)) {
          set({ items: [...items, productId] });
          
          if (userId) {
            try {
              await supabase.from('wishlists').insert({
                customer_id: userId,
                product_id: productId,
              });
            } catch (error) {
              console.error('Failed to sync wishlist:', error);
            }
          }
        }
      },

      removeItem: async (productId: string, userId?: string) => {
        set({ items: get().items.filter((id) => id !== productId) });
        
        if (userId) {
          try {
            await supabase
              .from('wishlists')
              .delete()
              .eq('customer_id', userId)
              .eq('product_id', productId);
          } catch (error) {
            console.error('Failed to remove from wishlist:', error);
          }
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.includes(productId);
      },

      syncWithServer: async (userId: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('wishlists')
            .select('product_id')
            .eq('customer_id', userId);

          if (!error && data) {
            const serverItems = data.map((item) => item.product_id);
            const localItems = get().items;
            
            // Merge local and server items
            const mergedItems = [...new Set([...localItems, ...serverItems])];
            set({ items: mergedItems });
            
            // Sync local items to server
            for (const productId of localItems) {
              if (!serverItems.includes(productId)) {
                try {
                  await supabase.from('wishlists').insert({
                    customer_id: userId,
                    product_id: productId,
                  });
                } catch {
                  // Ignore conflicts
                }
              }
            }
          }
        } catch (error) {
          console.error('Failed to sync wishlist:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'blaqroth-wishlist',
    }
  )
);
