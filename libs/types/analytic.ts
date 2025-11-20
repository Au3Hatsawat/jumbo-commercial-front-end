export interface DashboardSummary {
    id: number;
    date: string;        // วันที่ (ISO String)
    totalOrders: number; // จำนวนบิล
    totalSales: number;  // ยอดขายรวม
    totalCost: number;   // ต้นทุนรวม
    totalProfit: number; // กำไรสุทธิ
}

export interface TopProduct {
    productId: number;
    productName: string;
    _sum: {
        quantity: number;
        totalPrice: number;
    };
}

export interface CategoryDistribution {
    categoryId: number;
    categoryName: string;
    totalSales: number;
    [key: string]: string | number;
}