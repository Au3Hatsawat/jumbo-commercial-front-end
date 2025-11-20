import { CategoryDistribution, DashboardSummary, TopProduct } from "../types/analytic";
import api from "./axios";

export async function getDashboardSummary(days: number = 30): Promise<DashboardSummary[]> {
    const response = await api.get(`/analytics/summary`, {
        params: { days }
    });
    return response.data;
}

export async function getTopProducts(): Promise<TopProduct[]> {
    const response = await api.get('/analytics/top-products');
    return response.data;
}

export async function getCategoryDistribution(days: number = 30): Promise<CategoryDistribution[]> {
    const response = await api.get('/analytics/category-distribution', {
        params: { days }
    });
    return response.data;
}