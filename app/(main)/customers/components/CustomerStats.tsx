'use client';

import React, { useMemo } from 'react';
import { Users, UserPlus, UserCheck, Star } from 'lucide-react';
import { Customer } from '@/libs/types/customer'; // แก้ Path ตามจริง

interface CustomerStatsProps {
  customers: Customer[];
}

export const CustomerStats: React.FC<CustomerStatsProps> = ({ customers }) => {
  
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // 1. ลูกค้าทั้งหมด
    const totalCustomers = customers.length;

    // 2. ลูกค้าใหม่เดือนนี้ (New Members)
    const newCustomersCount = customers.filter(c => {
      const joinedDate = new Date(c.createdAt);
      return joinedDate.getMonth() === currentMonth && joinedDate.getFullYear() === currentYear;
    }).length;

    // 3. ลูกค้า Active (ซื้อของใน 30 วันล่าสุด)
    // ต้องเช็คจาก orders ถ้าไม่มี orders ให้ข้ามไป
    const activeCustomersCount = customers.filter(c => {
      if (!c.orders || c.orders.length === 0) return false;
      
      // หาออเดอร์ล่าสุด
      const lastOrder = c.orders.reduce((latest, current) => {
        return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
      }, c.orders[0]);

      const lastOrderDate = new Date(lastOrder.createdAt);
      const diffTime = Math.abs(now.getTime() - lastOrderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      return diffDays <= 30; // Active ถ้าซื้อภายใน 30 วัน
    }).length;

    // 4. แต้มสะสมรวม (Total Points System-wide)
    const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);

    return { totalCustomers, newCustomersCount, activeCustomersCount, totalPoints };
  }, [customers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: สมาชิกทั้งหมด */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">สมาชิกทั้งหมด</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalCustomers.toLocaleString()}</h3>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Card 2: สมาชิกใหม่เดือนนี้ */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">สมาชิกใหม่ (เดือนนี้)</p>
          <h3 className="text-2xl font-bold text-purple-600">+{stats.newCustomersCount}</h3>
        </div>
        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
          <UserPlus className="w-6 h-6" />
        </div>
      </div>

      {/* Card 3: Active Users (30 วัน) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">Active (30 วันล่าสุด)</p>
          <h3 className="text-2xl font-bold text-emerald-600">{stats.activeCustomersCount}</h3>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
          <UserCheck className="w-6 h-6" />
        </div>
      </div>

      {/* Card 4: แต้มสะสมรวม */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">แต้มสะสมรวมในระบบ</p>
          <h3 className="text-2xl font-bold text-amber-500">{stats.totalPoints.toLocaleString()}</h3>
        </div>
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
          <Star className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
};