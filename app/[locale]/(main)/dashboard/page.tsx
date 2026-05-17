'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
    TrendingUp,
    Calendar,
    Loader2,
    PieChart as PieChartIcon,
    RefreshCcw,
    Filter,
    Package,
    Wallet,
    Users
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { useQueryClient } from '@tanstack/react-query';

import {
    useDashboardSummary,
    useTopProducts,
    useCategoryDistribution,
    usePaymentDistribution,
    useTopCustomers
} from '@/libs/hooks/useAnalytics';

import Pinto from '@/components/ui/dynamic/Pinto';

import {
    COLORS,
    PAYMENT_COLORS,
    formatCurrency,
    calculateTotals,
    getStatCards,
    formatDate
} from './dashboard-configs';

export default function DashboardPage() {
    const t = useTranslations('dashboard');
    const [days, setDays] = useState<7 | 30>(30);
    const queryClient = useQueryClient();

    const { data: summaryData = [], isLoading: isLoadingSummary, error: summaryError } = useDashboardSummary(days);
    const { data: topProducts = [], isLoading: isLoadingTop } = useTopProducts();
    const { data: categoryData = [], isLoading: isLoadingCategory } = useCategoryDistribution(days);
    const { data: paymentData = [], isLoading: isLoadingPayment } = usePaymentDistribution(days);
    const { data: topCustomers = [], isLoading: isLoadingCustomers } = useTopCustomers();

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    };

    const totals = useMemo(() => calculateTotals(summaryData), [summaryData]);
    const statCards = useMemo(() => getStatCards(totals, days, t), [totals, days, t]);

    const isLoading = isLoadingSummary || isLoadingTop || isLoadingCategory || isLoadingPayment || isLoadingCustomers;

    if (summaryError) {
        return (
            <div className="p-6 bg-red-50 rounded-xl border border-red-200 shadow-sm m-6">
                <h3 className="text-xl font-bold text-red-600 mb-2">{t('messages.errorTitle') || 'ข้อผิดพลาดในการดึงข้อมูล'}</h3>
                <p className="text-red-500">{t('messages.errorDesc') || 'ไม่สามารถเชื่อมต่อกับ Backend เพื่อดึงข้อมูล Dashboard ได้'}</p>
            </div>
        );
    }

    return (
        <div className="p-0">

            <Pinto cards={statCards} />

            {/* Filter Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                            <Filter className="w-4 h-4 mr-2 text-emerald-600" />
                            {t('filters.timeRange') || 'ช่วงเวลา'}
                        </div>

                        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setDays(7)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${days === 7
                                    ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                <Calendar className="w-3.5 h-3.5" /> 7 {t('filters.days') || 'วัน'}
                            </button>
                            <button
                                onClick={() => setDays(30)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${days === 30
                                    ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                <Calendar className="w-3.5 h-3.5" /> 30 {t('filters.days') || 'วัน'}
                            </button>
                        </div>

                        <button
                            onClick={handleRefresh}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg shadow-sm flex items-center justify-center transition-colors"
                            title={t('filters.refresh') || 'รีเฟรชข้อมูล'}
                        >
                            <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {isLoading && !totals.sales ? (
                <div className="flex justify-center items-center h-64 text-gray-600">
                    <Loader2 className="animate-spin mr-2 w-8 h-8 text-emerald-600" />
                    <span>{t('messages.processing') || 'กำลังประมวลผลข้อมูล...'}</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* --- ROW 1: Trend & Category --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Sales & Profit Trend */}
                        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-gray-400" />
                                    {t('charts.salesTrend') || 'แนวโน้มยอดขายและกำไร'}
                                </h3>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer aspect={undefined} width="100%" height="100%">
                                    <AreaChart data={summaryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                                            formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                            labelFormatter={(label) => formatDate(String(label))}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                        <Area
                                            type="monotone"
                                            dataKey="totalSales"
                                            name={t('charts.sales') || 'ยอดขายรวม'}
                                            stroke="#059669"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorSales)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="totalProfit"
                                            name={t('charts.profit') || 'กำไรสุทธิ'}
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorProfit)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Category Pie */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                            <h3 className="font-bold text-gray-900 flex items-center mb-4">
                                <PieChartIcon className="w-5 h-5 mr-2 text-gray-400" />
                                {t('charts.categoryShare') || 'สัดส่วนยอดขาย (หมวดหมู่)'}
                            </h3>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer minWidth={0} width="100%" height="100%">
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

                    {/* --- ROW 2: Top Products & Payment Methods --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Top Products Table */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-gray-500" />
                                    {t('topProducts.title') || 'สินค้าขายดี (Top 5)'}
                                </h3>
                                <span className="text-xs text-gray-500">{t('topProducts.sortBy') || 'เรียงตามยอดขายรวม'}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">{t('topProducts.rank') || 'อันดับ'}</th>
                                            <th className="px-6 py-3 font-medium">{t('topProducts.productName') || 'ชื่อสินค้า'}</th>
                                            <th className="px-6 py-3 font-medium text-center">{t('topProducts.quantity') || 'จำนวนที่ขาย'}</th>
                                            <th className="px-6 py-3 font-medium text-right">{t('topProducts.totalSales') || 'ยอดขายรวม'}</th>
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
                                                    {`${product.productName}`}
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-600">
                                                    {product._sum?.quantity?.toLocaleString() || 0}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                    {formatCurrency(Number(product._sum?.totalPrice || 0))}
                                                </td>
                                            </tr>
                                        ))}
                                        {topProducts.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                                    {t('topProducts.empty') || 'ไม่มีข้อมูลสินค้าขายดีในช่วงเวลานี้'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                            <h3 className="font-bold text-gray-900 flex items-center mb-4">
                                <Wallet className="w-5 h-5 mr-2 text-gray-400" />
                                {t('charts.paymentShare') || 'ช่องทางรับเงิน (รายได้)'}
                            </h3>
                            <div className="flex-1 min-h-[250px]">
                                {paymentData.length > 0 ? (
                                    <ResponsiveContainer minWidth={0} width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={paymentData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                nameKey="name"
                                            >
                                                {paymentData.map((entry, index) => (
                                                    <Cell key={`cell-payment-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex justify-center items-center h-full text-gray-400 text-sm">
                                        ไม่มีข้อมูลช่องทางรับเงิน
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-gray-500" />
                                    {t('topCustomers.title') || 'ลูกค้ายอดเยี่ยม (Top 5)'}
                                </h3>
                                <span className="text-xs text-gray-500">
                                    {t('topCustomers.sortBy') || 'เรียงตามยอดสั่งซื้อสะสม'}
                                </span>                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">{t('topCustomers.rank') || 'อันดับ'}</th>
                                            <th className="px-6 py-3 font-medium">{t('topCustomers.customerName') || 'ชื่อลูกค้า / เบอร์โทร'}</th>
                                            <th className="px-6 py-3 font-medium text-right">{t('topCustomers.totalSales') || 'ยอดสั่งซื้อรวม'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {topCustomers.map((customer, index) => (
                                            <tr key={`customer-${customer.customerId || index}`} className="hover:bg-gray-50 transition-colors">
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
                                                    {customer.customerName}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                    {formatCurrency(Number(customer.totalSales || 0))}
                                                </td>
                                            </tr>
                                        ))}
                                        {topCustomers.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                                                    {t('topCustomers.empty') || 'ไม่มีข้อมูลลูกค้าในช่วงเวลานี้'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="hidden lg:block lg:col-span-1"></div>
                    </div>

                </div>
            )}
        </div>
    );
}