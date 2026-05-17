import { Product } from "./product";

export interface StockLog {
    id: number;

    productId: number;

    quantity: number;

    type: StockType;

    costPrice: string | null;

    note: string | null;
    createdAt: string;

    product?: Product;
}

export enum StockType {
    RESTOCK = 'RESTOCK',
    SALE = 'SALE',
    ADJUSTMENT = 'ADJUSTMENT',
    DAMAGED = 'DAMAGED',
    RETURN = 'RETURN',
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