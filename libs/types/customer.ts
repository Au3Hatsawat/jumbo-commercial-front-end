import { Order } from "./order";

export interface Customer {
  id: number;
  name: string | null;
  phoneNumber: string;
  points: number;

  createdAt: string;
  updatedAt: string;

  orders?: Order[];
}

export interface CreateCustomerPayload {
  name?: string;
  phoneNumber: string;
}

export interface UpdateCustomerPayload extends CreateCustomerPayload {
  id: number;
}