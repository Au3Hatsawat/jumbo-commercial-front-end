import { Category } from "./category";
import { OrderItem } from "./order";
import { StockLog } from "./stock";
import { Unit } from "./unit";

export enum SELLTYPE {
  RETAIL = 'RETAIL',
  WHOLESALE = 'WHOLESALE'
}

export interface ProductSellingUnit {
  id: number;
  productId: number;
  barcode: string;
  unitId: number;
  multiplier: number;
  price: string;
  sellType: SELLTYPE | string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;


  unit?: Unit;
  product?: Product;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: number;
  baseUnitId: number;

  averageCost: string;

  currentStock: number;

  createdAt: string;
  updatedAt: string;
  vatRate: number;

  category: Category;
  baseUnit: Unit;
  sellingUnits?: ProductSellingUnit[];
  stockLogs?: StockLog[];
  orderItems?: OrderItem[];
}

export interface CartItem {
  productId: number;
  sellingUnitId: number;
  barcode: string;
  name: string;
  unitName: string;
  multiplier: number;
  sellType: string;
  quantity: number;
  price: number;
  total: number;
  costAtSale: number;
}

export interface ISellingUnitDto {
  barcode: string;
  unitId: number;
  multiplier: number;
  price: number;
  sellType: SELLTYPE | string;
}

export interface IAddSellingUnitDto {
  barcode: string;
  unitId: number;
  multiplier: number;
  price: number;
  sellType: SELLTYPE | string;
}

export interface SellingUnitUpdatePayload extends Partial<IAddSellingUnitDto> {
  id: number;
}

export interface ProductCreatePayload {
  name: string;
  categoryId: number;
  baseUnitId: number;
  description?: string;
  imageUrl?: string;
  sellingUnits: ISellingUnitDto[];
}

export interface ProductUpdatePayload extends Partial<ProductCreatePayload> {
  id: number;
}