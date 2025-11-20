'use client';

import React, { useMemo } from 'react';
import { Banknote, ShoppingBag, TrendingUp, BarChart3 } from 'lucide-react';
import { Order } from '@/libs/types/order'; 

interface OrderStatsProps {
  orders: Order[];
}

export const OrderStats: React.FC<OrderStatsProps> = ({ orders }) => {
  
  const stats = useMemo(() => {
    // 1. จำนวนบิลทั้งหมด
    const totalOrders = orders.length;

    // 2. ยอดขายรวม (Sum of totalAmount)
    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount), 
      0
    );

    // 3. กำไรขั้นต้น (Gross Profit)
    // คำนวณจาก (ราคาขาย - ต้นทุน) * จำนวน ของแต่ละ Item
    const totalProfit = orders.reduce((sum, order) => {
      const orderProfit = (order.items || []).reduce((itemSum, item) => {
        const sellingPrice = parseFloat(item.price);
        const costPrice = parseFloat(item.costAtSale);
        const profitPerItem = sellingPrice - costPrice;
        return itemSum + (profitPerItem * item.quantity);
      }, 0);
      return sum + orderProfit;
    }, 0);

    // 4. ยอดขายเฉลี่ยต่อบิล (Average Order Value)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalOrders, totalRevenue, totalProfit, averageOrderValue };
  }, [orders]);

  // Helper สำหรับจัดรูปแบบเงิน
  const formatCurrency = (val: number) => 
    val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: ยอดขายรวม */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">ยอดขายรวม</p>
          <h3 className="text-2xl font-bold text-emerald-600">฿{formatCurrency(stats.totalRevenue)}</h3>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
          <Banknote className="w-6 h-6" />
        </div>
      </div>

      {/* Card 2: จำนวนบิล */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">จำนวนบิล</p>
          <h3 className="text-2xl font-bold text-blue-600">{stats.totalOrders.toLocaleString()}</h3>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
          <ShoppingBag className="w-6 h-6" />
        </div>
      </div>

      {/* Card 3: กำไรขั้นต้น */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">กำไรขั้นต้น (Est.)</p>
          <h3 className="text-2xl font-bold text-indigo-600">฿{formatCurrency(stats.totalProfit)}</h3>
        </div>
        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      {/* Card 4: เฉลี่ยต่อบิล */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">เฉลี่ยต่อบิล</p>
          <h3 className="text-2xl font-bold text-orange-600">฿{formatCurrency(stats.averageOrderValue)}</h3>
        </div>
        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
          <BarChart3 className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
};