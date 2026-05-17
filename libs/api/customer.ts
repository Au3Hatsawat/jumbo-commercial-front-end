import { Customer } from "../types/customer";
import api from "./axios";

export async function getCustomers(): Promise<Customer[]> {
    const response = await api.get('/customers'); 
    return response.data as Customer[];
}

export async function getCustomerById(id: number): Promise<Customer> {
    const response = await api.get(`/customers/${id}`);
    return response.data as Customer;
}

export async function updateCustomer(id:number , data:Partial<Customer>): Promise<Customer> {
    const response = await api.patch(`/customers/${id}`,data); 
    return response.data as Customer;
}

export async function createCustomer(data:Partial<Customer>): Promise<Customer> {
    const response = await api.post(`/customers/`,data); 
    return response.data as Customer;
}