'use client';

import { useState, useMemo } from 'react';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Package,
    Calendar,
    Loader2,
    PieChart as PieChartIcon,
    ArrowUpRight,
    RefreshCcw,
    Filter,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { useQueryClient } from '@tanstack/react-query';

import { useDashboardSummary, useTopProducts, useCategoryDistribution } from '@/libs/hooks/useAnalytics';

// 👇 Import Component ที่แยกออกมา
import { AnalyticStat } from './components/AnalyticStat';

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function DashboardPage() {
    const [days, setDays] = useState<7 | 30>(30);
    const queryClient = useQueryClient();

    const { data: summaryData = [], isLoading: isLoadingSummary, error: summaryError } = useDashboardSummary(days);
    const { data: topProducts = [], isLoading: isLoadingTop } = useTopProducts();
    const { data: categoryData = [], isLoading: isLoadingCategory } = useCategoryDistribution(days);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    };

    const totals = useMemo(() => {
        return summaryData.reduce((acc, curr) => ({
            sales: acc.sales + curr.totalSales,
            profit: acc.profit + curr.totalProfit,
            orders: acc.orders + curr.totalOrders,
            cost: acc.cost + curr.totalCost
        }), { sales: 0, profit: 0, orders: 0, cost: 0 });
    }, [summaryData]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(value);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    };

    const isLoading = isLoadingSummary || isLoadingTop || isLoadingCategory;

    if (summaryError) {
        return (
            <div className="p-6 bg-red-50 rounded-xl border border-red-200 shadow-sm m-6">
                <h3 className="text-xl font-bold text-red-600 mb-2">ข้อผิดพลาดในการดึงข้อมูล</h3>
                <p className="text-red-500">ไม่สามารถเชื่อมต่อกับ Backend เพื่อดึงข้อมูล Dashboard ได้</p>
            </div>
        );
    }

    return (
        <div className="p-0">

            {/* --- 1. Stats Cards Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <AnalyticStat
                    title="ยอดขายรวม"
                    value={formatCurrency(totals.sales)}
                    icon={DollarSign}
                    theme="gray"
                    subText={<span className="flex items-center text-emerald-600 font-medium"><ArrowUpRight className="w-3 h-3 mr-1" /> จาก {days} วันที่ผ่านมา</span>}
                />
                <AnalyticStat
                    title="กำไรสุทธิ"
                    value={formatCurrency(totals.profit)}
                    icon={TrendingUp}
                    theme="emerald"
                    subText={<span>Margin: <span className="font-bold text-gray-700">{totals.sales > 0 ? ((totals.profit / totals.sales) * 100).toFixed(1) : 0}%</span> ของยอดขาย</span>}
                />
                <AnalyticStat
                    title="จำนวนออเดอร์"
                    value={totals.orders.toLocaleString()}
                    icon={ShoppingBag}
                    theme="amber"
                    subText={<span>เฉลี่ย: <span className="font-bold text-gray-700">{formatCurrency(totals.orders > 0 ? totals.sales / totals.orders : 0)}</span> / บิล</span>}
                />
                <AnalyticStat
                    title="ต้นทุนขาย"
                    value={formatCurrency(totals.cost)}
                    icon={Package}
                    theme="red"
                    subText={<span>Cost Ratio: {totals.sales > 0 ? ((totals.cost / totals.sales) * 100).toFixed(1) : 0}%</span>}
                />
            </div>

            {/* --- 2. Filter & Actions Card --- */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* Right: Filters */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                            <Filter className="w-4 h-4 mr-2 text-emerald-600" />
                            ช่วงเวลา
                        </div>

                        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setDays(7)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${days === 7
                                    ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                <Calendar className="w-3.5 h-3.5" /> 7 วัน
                            </button>
                            <button
                                onClick={() => setDays(30)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${days === 30
                                    ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                <Calendar className="w-3.5 h-3.5" /> 30 วัน
                            </button>
                        </div>

                        <button
                            onClick={handleRefresh}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg shadow-sm flex items-center justify-center transition-colors"
                            title="รีเฟรชข้อมูล"
                        >
                            <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 3. Content Area (Charts & Tables) --- */}

            {isLoading && !totals.sales ? (
                <div className="flex justify-center items-center h-64 text-gray-600">
                    <Loader2 className="animate-spin mr-2 w-8 h-8 text-emerald-600" />
                    <span>กำลังประมวลผลข้อมูล...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Sales Trend */}
                        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-gray-400" />
                                    แนวโน้มยอดขาย
                                </h3>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={summaryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={formatDate}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickFormatter={(value) => `฿${value / 1000}k`}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [formatCurrency(value), 'ยอดขาย']}
                                            labelFormatter={(label) => formatDate(label)}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="totalSales"
                                            stroke="#059669"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorSales)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Category Pie */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                            <h3 className="font-bold text-gray-900 flex items-center mb-4">
                                <PieChartIcon className="w-5 h-5 mr-2 text-gray-400" />
                                สัดส่วนยอดขาย (หมวดหมู่)
                            </h3>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="totalSales"
                                            nameKey="categoryName"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Top Products Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-gray-500" />
                                สินค้าขายดี (Top 5)
                            </h3>
                            <span className="text-xs text-gray-500">เรียงตามยอดขายรวม</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">อันดับ</th>
                                        <th className="px-6 py-3 font-medium">ชื่อสินค้า</th>
                                        <th className="px-6 py-3 font-medium text-center">จำนวนที่ขาย</th>
                                        <th className="px-6 py-3 font-medium text-right">ยอดขายรวม</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {topProducts.map((product, index) => (
                                        <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 w-16">
                                                <span className={`
                            inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                            ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                                            index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}
                          `}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {/* Product Name or ID */}
                                                {`${product.productName}`}
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-600">
                                                {product._sum.quantity?.toLocaleString() || 0}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                {formatCurrency(Number(product._sum.totalPrice || 0))}
                                            </td>
                                        </tr>
                                    ))}
                                    {topProducts.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                                ไม่มีข้อมูลสินค้าขายดีในช่วงเวลานี้
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}