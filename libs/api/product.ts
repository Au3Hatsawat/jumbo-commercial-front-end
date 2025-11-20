import {  Product, ProductCreatePayload } from "../types/product";
import api from "./axios";
import { RestockPayload, StockPayload } from "../types/stock";

export async function getProducts(): Promise<Product[]> {
    const response = await api.get('/products'); 
    return response.data as Product[];
}

export async function createProduct(data: ProductCreatePayload): Promise<Product> {
    const response = await api.post('/products', data); 
    return response.data as Product;
}

export async function updateProduct(id:number ,data: Partial<ProductCreatePayload>): Promise<Product> {
    const response = await api.patch(`/products/${id}`, data); 
    return response.data as Product;
}

export async function restockProduct(id:number ,data: RestockPayload): Promise<Product> {
    const response = await api.post(`/products/${id}/restock`, data); 
    return response.data as Product;
}

export async function createStockLog(id:number ,data: StockPayload): Promise<Product> {
    const response = await api.patch(`/products/${id}/stock`, data); 
    return response.data as Product;
}
 
