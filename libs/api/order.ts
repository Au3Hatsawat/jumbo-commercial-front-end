import { ICreateOrderDto, Order } from "../types/order";
import api from "./axios";

export async function createOrder(data: ICreateOrderDto): Promise<Order> {
  const response = await api.post('/orders', data);
  return response.data as Order;
}

export async function getOrders(): Promise<Order[]> {
    const response = await api.get('/orders');
    return response.data as Order[];
}

export async function getOrderReceipt(orderId: number): Promise<Blob> {
    const response = await api.get(`/orders/${orderId}/receipt`, {
        responseType: 'blob'
    });
    return response.data;
}