import { Customer } from "./customer";
import { Product } from "./product";

export interface Order {
  id: number;
  orderNo: string; // เลขที่ใบเสร็จ

  customerId: number | null;
  
  // ยอดรวมสุทธิ (Decimal)
  totalAmount: string; 
  paymentMethod: string | null; // CASH, QR, CREDIT, TRANSFER

  createdAt: string;
  updatedAt: string;

  // relations
  customer?: Customer;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;

  orderId: number;
  productId: number;

  quantity: number;
  
  // Snapshot Data (Decimal)
  price: string; // ราคาที่ขายไปจริง (Snapshot)
  costAtSale: string; // ต้นทุนเฉลี่ย ณ วินาทีที่ขาย (Snapshot)

  // relations
  order?: Order;
  product?: Product;
}

export interface IOrderItemDto {
    productId: number;
    quantity: number;
}

export interface ICreateOrderDto {
    customerId?: number; 
    newCustomerName?: string;
    newCustomerPhone?: string;
    items: IOrderItemDto[];
    paymentMethod: string;
}