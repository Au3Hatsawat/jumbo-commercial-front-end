import { Category } from "./category";
import { OrderItem } from "./order";
import { StockLog } from "./stock";
import { Unit } from "./unit";

export interface Product {
  id: number;
  barcode: string; // บาร์โค้ด
  name: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: number;
  unitId: number;

  // ราคาและต้นทุน
  sellingPrice: string; // ราคาขายหน้าร้าน (Decimal)
  averageCost: string; // ต้นทุนเฉลี่ย (Decimal)

  // คลังสินค้า
  currentStock: number;

  createdAt: string;
  updatedAt: string;

  // relations
  category: Category;
  unit: Unit;
  stockLogs?: StockLog[];
  orderItems?: OrderItem[];
}

// Type สำหรับ Item ในตะกร้าสินค้า
export interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  price: number; // ราคา Snapshot (แปลงเป็น number ได้ เพราะใช้สำหรับ calculation ใน Cart)
  total: number;
  // **สำคัญ:** ควรเพิ่มต้นทุนที่ Snapshot เพื่อใช้ใน OrderItem
  costAtSale: number;
}

export interface ProductCreatePayload {
  barcode: string;
  name: string;
  sellingPrice: number;
  categoryId: number;
  unitId: number;
  description?: string;
  imageUrl?: string;
}

export interface ProductUpdatePayload extends Partial<ProductCreatePayload> {
  id: number;
}