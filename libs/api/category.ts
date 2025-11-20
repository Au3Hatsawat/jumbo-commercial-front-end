import api from "./axios";
import { Category } from "../types/category";

export async function getCategories(): Promise<Category[]> {
    const response = await api.get('/categories'); 
    return response.data as Category[];
}
