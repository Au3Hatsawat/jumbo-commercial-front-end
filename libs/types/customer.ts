import { Order } from "./order";

export interface Customer {
  id: number;
  name: string | null;
  phoneNumber: string; // ใช้เบอร์โทรเป็น Member ID
  points: number; // แต้มสะสม

  createdAt: string; // DateTime
  updatedAt: string; // DateTime

  // relations
  orders?: Order[];
}

export interface CreateCustomerPayload {
  name?: string;
  phoneNumber: string;
}

export interface UpdateCustomerPayload extends CreateCustomerPayload {
  id: number;
}