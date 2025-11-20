import { Product } from "./product";

export interface StockLog {
  id: number;

  productId: number;
  
  // จำนวนเปลี่ยนแปลง (+ คือรับเข้า, - คือขาย/ตัดออก)
  quantity: number;
  
  // ประเภทรายการ
  type: StockType; 
  
  // ต้นทุนต่อหน่วย ของล็อตที่รับเข้ามา (Decimal)
  costPrice: string | null; 
  
  note: string | null;
  createdAt: string;

  // relations
  product?: Product;
}

export enum StockType {
  RESTOCK = 'RESTOCK',      // รับสินค้าเข้า
  SALE = 'SALE',            // ขายสินค้า
  ADJUSTMENT = 'ADJUSTMENT',// ปรับปรุงสต็อก
  DAMAGED = 'DAMAGED',      // สินค้าเสียหาย/หมดอายุ
  RETURN = 'RETURN',        // ลูกค้าคืนของ
}

export interface RestockPayload {
    quantityToAdd: number;
    costPerUnit: number; 
    note?: string;
}

export interface StockPayload {
    quantity: number;
    stockType: StockType;
    note?: string;
}

export interface ProductStockPayload extends StockPayload {
    productId: number;
}

export interface ProductRestockPayload extends RestockPayload {
    productId: number;
}


