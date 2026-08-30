import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      
      addItem: (item) =>
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.variantId === item.variantId
          );

          if (existingItemIndex > -1) {
            // Update quantity of existing item
            const newItems = [...state.items];
            const existingItem = newItems[existingItemIndex];
            
            // Ensure we don't exceed stock
            const newQuantity = Math.min(
              existingItem.stock,
              existingItem.quantity + item.quantity
            );
            
            newItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity,
            };
            
            return { items: newItems };
          }

          // Add new item
          // Ensure we don't exceed stock
          const initialQuantity = Math.min(item.stock, item.quantity);
          return { items: [...state.items, { ...item, quantity: initialQuantity }] };
        }),
        
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
        
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId
              ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) }
              : item
          ),
        })),
        
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cartify-cart-storage',
    }
  )
);
