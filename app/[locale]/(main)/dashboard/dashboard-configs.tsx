import { ArrowUpRight, DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dayjs from '@/utils/timeutils';

export type TranslationFunction = ReturnType<typeof useTranslations<'dashboard'>>;

export const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export const PAYMENT_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#64748b'];

export const formatCurrency = (value: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(value);

export const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format('D MMM BBBB'); 
};

export const calculateTotals = (summaryData: any[]) => {
    return summaryData.reduce((acc, curr) => ({
        sales: acc.sales + (curr.totalSales || 0),
        profit: acc.profit + (curr.totalProfit || 0),
        orders: acc.orders + (curr.totalOrders || 0),
        cost: acc.cost + (curr.totalCost || 0)
    }), { sales: 0, profit: 0, orders: 0, cost: 0 });
};

export const getStatCards = (totals: ReturnType<typeof calculateTotals>, days: number, t: TranslationFunction) => {
    const marginPercent = totals.sales > 0 ? ((totals.profit / totals.sales) * 100).toFixed(1) : '0.0';
    const avgPerBill = formatCurrency(totals.orders > 0 ? totals.sales / totals.orders : 0);
    const costRatio = totals.sales > 0 ? ((totals.cost / totals.sales) * 100).toFixed(1) : '0.0';

    return [
        {
            id: 'sales',
            title: t('stats.sales') || "ยอดขายรวม",
            value: formatCurrency(totals.sales),
            icon: DollarSign,
            theme: "gray" as const,
            subText: (
                <span className="flex items-center text-emerald-600 font-medium">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> {t('stats.fromDays', { days }) || `จาก ${days} วันที่ผ่านมา`}
                </span>
            )
        },
        {
            id: 'profit',
            title: t('stats.profit') || "กำไรสุทธิ",
            value: formatCurrency(totals.profit),
            icon: TrendingUp,
            theme: "emerald" as const,
            subText: (
                <span>
                    Margin: <span className="font-bold text-gray-700">{marginPercent}%</span> {t('stats.ofSales') || 'ของยอดขาย'}
                </span>
            )
        },
        {
            id: 'orders',
            title: t('stats.orders') || "จำนวนออเดอร์",
            value: totals.orders.toLocaleString(),
            icon: ShoppingBag,
            theme: "amber" as const,
            subText: (
                <span>
                    {t('stats.avg') || 'เฉลี่ย'}: <span className="font-bold text-gray-700">{avgPerBill}</span> / {t('stats.bill') || 'บิล'}
                </span>
            )
        },
        {
            id: 'cost',
            title: t('stats.cost') || "ต้นทุนขาย",
            value: formatCurrency(totals.cost),
            icon: Package,
            theme: "red" as const,
            subText: <span>Cost Ratio: {costRatio}%</span>
        }
    ];
};