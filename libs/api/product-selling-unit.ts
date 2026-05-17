import { IAddSellingUnitDto, ProductSellingUnit } from "../types/product";
import api from "./axios";

export async function updateProductSellingUnit(id:number ,data: Partial<IAddSellingUnitDto>): Promise<ProductSellingUnit> {
    const response = await api.patch(`/selling-units/${id}`, data); 
    return response.data as ProductSellingUnit;
}

export async function deleteProductSellingUnit(id:number): Promise<ProductSellingUnit> {
    const response = await api.delete(`/selling-units/${id}`); 
    return response.data as ProductSellingUnit;
}