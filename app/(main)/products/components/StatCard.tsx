'use client';

import React, { useMemo } from 'react';
import { Package, AlertTriangle, XCircle, DollarSign } from 'lucide-react';
import { Product } from '@/libs/types/product';

interface ProductStatsProps {
  products: Product[];
}

export const ProductStats: React.FC<ProductStatsProps> = ({ products }) => {
  
  const stats = useMemo(() => {
    const totalProducts = products.length;
    
    const lowStockCount = products.filter(
      p => p.currentStock > 0 && p.currentStock <= 5
    ).length;

    const outOfStockCount = products.filter(
      p => p.currentStock === 0
    ).length;

    const totalStockValue = products.reduce(
      (acc, p) => acc + (parseFloat(p.sellingPrice.toString()) * p.currentStock), 
      0
    );

    return { totalProducts, lowStockCount, outOfStockCount, totalStockValue };
  }, [products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: สินค้าทั้งหมด */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">สินค้าทั้งหมด</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalProducts}</h3>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
          <Package className="w-6 h-6" />
        </div>
      </div>

      {/* Card 2: สินค้าใกล้หมด (ตามที่คุณต้องการ) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">สินค้าใกล้หมด (≤5)</p>
          <h3 className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</h3>
        </div>
        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      {/* Card 3: สินค้าหมด */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">สินค้าหมดสต็อก</p>
          <h3 className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</h3>
        </div>
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
          <XCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Card 4: มูลค่าสินค้าในคลัง */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">มูลค่าสต็อกรวม</p>
          <h3 className="text-2xl font-bold text-emerald-600">
            ฿{stats.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </h3>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
};