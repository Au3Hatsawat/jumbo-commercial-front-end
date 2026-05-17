import { create } from 'zustand';
import { CartItem, Product, ProductSellingUnit } from '../types/product';

interface CartState {
  items: CartItem[];
  totalAmount: number;

  addItem: (product: Product, sellingUnit: ProductSellingUnit, quantity: number) => void;
  updateQuantity: (sellingUnitId: number, newQuantity: number) => void;
  removeItem: (sellingUnitId: number) => void;
  clearCart: () => void;
}

const calculateTotal = (currentItems: CartItem[]): number => {
    return currentItems.reduce((sum, item) => sum + item.total, 0);
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalAmount: 0,

  addItem: (product, sellingUnit, quantity) => {
    set((state) => {
      const price = parseFloat(sellingUnit.price);
      const baseCost = parseFloat(product.averageCost);
      const costAtSale = baseCost * sellingUnit.multiplier;

      const existingItem = state.items.find(item => item.sellingUnitId === sellingUnit.id);
      let newItems: CartItem[] = [];

      if (existingItem) {
        newItems = state.items.map(item =>
          item.sellingUnitId === sellingUnit.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total: (item.quantity + quantity) * price,
              }
            : item
        );
      } else {
        const newItem: CartItem = {
          productId: product.id,
          sellingUnitId: sellingUnit.id,
          barcode: sellingUnit.barcode,
          name: product.name,
          unitName: sellingUnit.unit?.nameTh || 'ไม่ระบุ',
          multiplier: sellingUnit.multiplier,
          sellType: sellingUnit.sellType,
          quantity: quantity,
          price: price,
          total: quantity * price,
          costAtSale: costAtSale, 
        };
        newItems = [...state.items, newItem];
      }
      
      return {
        items: newItems,
        totalAmount: calculateTotal(newItems),
      };
    });
  },

  updateQuantity: (sellingUnitId, newQuantity) => {
    set((state) => {
        if (newQuantity <= 0) {
            const filteredItems = state.items.filter(item => item.sellingUnitId !== sellingUnitId);
            return { items: filteredItems, totalAmount: calculateTotal(filteredItems) };
        }
        
        const newItems = state.items.map(item =>
            item.sellingUnitId === sellingUnitId
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

  removeItem: (sellingUnitId) => {
    set((state) => {
        const newItems = state.items.filter(item => item.sellingUnitId !== sellingUnitId);
        return { items: newItems, totalAmount: calculateTotal(newItems) };
    });
  },

  clearCart: () => set({ items: [], totalAmount: 0 }),
}));