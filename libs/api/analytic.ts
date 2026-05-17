import { CategoryDistribution, DashboardSummary, PaymentDistribution, TopCustomer, TopProduct } from "../types/analytic";
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

export async function getPaymentDistribution(days: number = 30): Promise<PaymentDistribution[]> {
    const response = await api.get('/analytics/payment-distribution', {
        params: { days }
    });
    return response.data;
}

export async function getTopCustomers(): Promise<TopCustomer[]> {
    const response = await api.get('/analytics/top-customers');
    return response.data;
}