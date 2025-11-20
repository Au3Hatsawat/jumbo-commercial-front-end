// lib/store/cartStore.ts
import { create } from 'zustand';
import { CartItem, Product } from '../types/product';

interface CartState {
  items: CartItem[];
  totalAmount: number;

  // Actions
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

// Helper function
const calculateTotal = (currentItems: CartItem[]): number => {
    return currentItems.reduce((sum, item) => sum + item.total, 0);
};

export const useCartStore = create<CartState>((set, get) => ({
  // 1. STATE เริ่มต้น
  items: [],
  totalAmount: 0,

  // 2. ACTIONS
  addItem: (product, quantity) => {
    set((state) => {
      const price = parseFloat(product.sellingPrice);
      const costAtSale = parseFloat(product.averageCost);
      const existingItem = state.items.find(item => item.productId === product.id);
      let newItems: CartItem[] = [];

      if (existingItem) {
        // อัปเดตรายการที่มีอยู่
        newItems = state.items.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total: (item.quantity + quantity) * price,
              }
            : item
        );
      } else {
        // เพิ่มรายการใหม่
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          quantity: quantity,
          price: price,
          total: quantity * price,
          costAtSale: costAtSale, // Snapshot ต้นทุน
        };
        newItems = [...state.items, newItem];
      }
      
      return {
        items: newItems,
        totalAmount: calculateTotal(newItems),
      };
    });
  },

  updateQuantity: (productId, newQuantity) => {
    set((state) => {
        if (newQuantity <= 0) {
            // ลบออกถ้าจำนวนเป็นศูนย์หรือน้อยกว่า
            const filteredItems = state.items.filter(item => item.productId !== productId);
            return { items: filteredItems, totalAmount: calculateTotal(filteredItems) };
        }
        
        const newItems = state.items.map(item =>
            item.productId === productId
                ? {
                      ...item,
                      quantity: newQuantity,
                      total: newQuantity * item.price,
                  }
                : item
        );
        return { items: newItems, totalAmount: calculateTotal(newItems) };
    });
  },

  removeItem: (productId) => {
    set((state) => {
        const newItems = state.items.filter(item => item.productId !== productId);
        return { items: newItems, totalAmount: calculateTotal(newItems) };
    });
  },

  clearCart: () => set({ items: [], totalAmount: 0 }),
}));