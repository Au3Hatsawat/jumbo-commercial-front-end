import { Customer } from "./customer";

export interface Order {
  id: number;
  orderNo: string;

  customerId: number | null;

  totalAmount: string; 
  paymentMethod: string | null;

  createdAt: string;
  updatedAt: string;

  customer?: Customer;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;

  orderId: number;
  productId: number;
  sellingUnitId: number | null;

  productName: string;
  unitName: string;
  unitNameEn: string | null;
  imageUrl: string | null;
  sellType: 'RETAIL' | 'WHOLESALE'; 

  quantity: number;

  vatRate: number;
  priceAtSale: string; 
  costAtSale: string;
  multiplierAtSale: number;

  order?: Order;

}



export interface IOrderItemDto {
  sellingUnitId: number;
  quantity: number;
}

export interface ICreateOrderDto {
  customerId?: number;
  newCustomerName?: string;
  newCustomerPhone?: string;
  items: IOrderItemDto[];
  paymentMethod: string;
}