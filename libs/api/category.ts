import api from "./axios";
import { Category, CategoryCreatePayload, CategoryUpdatePayload } from "../types/category";

export async function getCategories(): Promise<Category[]> {
    const response = await api.get('/categories'); 
    return response.data as Category[];
}

export async function getCategoryById(id:number): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data as Category;
}

export async function createCategories(category: CategoryCreatePayload): Promise<Category> {
    const response = await api.post('/categories',category);
    return response.data as Category;
}

export async function updateCategory(id:number,category: Partial<CategoryCreatePayload>): Promise<Category> {
    const response = await api.patch(`/categories/${id}`, category);
    return response.data as Category;
}

export async function deleteCategory(id:number): Promise<Category> {
    const response = await api.delete(`/categories/${id}`);
    return response.data as Category;
}