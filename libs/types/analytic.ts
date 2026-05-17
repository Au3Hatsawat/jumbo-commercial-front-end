export interface TopProduct {
    productId: number;
    productName: string;
    _sum: {
        quantity: number | null;
        baseUnitQuantity: number | null;
        totalPrice: number | null;
    };
}

export interface PaymentDistribution {
    paymentMethod: string;
    name: string;
    value: number;
    [key: string]: string | number;
}

export interface CategoryDistribution {
    categoryId: number;
    categoryName: string;
    totalSales: number;
    [key: string]: string | number; 
}

export interface DashboardSummary {
    date: Date;
    totalOrders: number;
    totalSales: number;
    totalCost: number;
    totalProfit: number;
    [key: string]: string | number | Date;
}

export interface TopCustomer {
    customerId: number | null;
    customerName: string;
    totalSales: number;
}