import {  IAddSellingUnitDto, Product, ProductCreatePayload, ProductSellingUnit } from "../types/product";
import api from "./axios";
import { RestockPayload, StockPayload } from "../types/stock";

export async function getProducts(): Promise<Product[]> {
    const response = await api.get('/products'); 
    return response.data as Product[];
}

export async function getProductById(id:number): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data as Product
}

export async function createProductSellingUnit(id: number, data: IAddSellingUnitDto): Promise<ProductSellingUnit> {
    const response = await api.post(`/products/${id}/selling-units`, data);
    return response.data;
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
 
export async function uploadImage({ id, file, action = "1", productSellingUnitId }: { id: number; file: File; action?: "1" | "2"; productSellingUnitId?: number; }): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('image', file);    
    const response = await api.post(`/products/${id}/upload`, formData,{
        params: {action , productSellingUnitId},
        headers: {
            'Content-Type': 'multipart/form-data' 
        }
    });
    return response.data;
}
