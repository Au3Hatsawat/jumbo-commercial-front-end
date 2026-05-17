import { FilterConfig } from '@/components/ui/dynamic/Filter';
import { ColumnConfigs } from '@/components/ui/dynamic/Table';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type TranslationFunction = ReturnType<typeof useTranslations<'orders'>>;

export type OrderTableRow = {
    orderNo: string;
    dateTime: string;
    customer: string;
    payment: string;
    totalAmount: string;
    details: string;
};

export const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
};

export const formatCurrency = (amount: string | number) => {
    return Number(amount).toFixed(2);
};

export const getFilterConfigs = (
    dateRange: 'today' | 'yesterday' | 'this_week' | 'all' | 'this_month',
    setDateRange: (val: 'today' | 'yesterday' | 'this_week' | 'all' | 'this_month') => void,
    paymentFilter: 'all' | 'CASH' | 'QR',
    setPaymentFilter: (val: 'all' | 'CASH' | 'QR') => void,
    t: TranslationFunction
): FilterConfig[] => [
    {
        id: 'dateRange',
        value: dateRange,
        onChange: (val: string) => setDateRange(val as 'today' | 'yesterday' | 'this_week' | 'all' | 'this_month'),
        options: [
            { label: t('filters.today') || 'วันนี้', value: 'today' },
            { label: t('filters.yesterday') || 'เมื่อวาน', value: 'yesterday' },
            { label: t('filters.thisWeek') || 'สัปดาห์นี้', value: 'this_week' },
            { label: t('filters.thisMonth') || 'เดือนนี้', value: 'this_month' },
            { label: t('filters.allDate') || 'ทั้งหมด', value: 'all' }
        ]
    },
    {
        id: 'paymentFilter',
        value: paymentFilter,
        onChange: (val: string) => setPaymentFilter(val as 'all' | 'CASH' | 'QR'),
        options: [
            { label: t('filters.allPayment') || 'ทุกการชำระเงิน', value: 'all' },
            { label: t('filters.cash') || 'เงินสด (Cash)', value: 'CASH' },
            { label: t('filters.qr') || 'โอน/สแกน (QR)', value: 'QR' }
        ]
    }
];

// --- 2. Table Data Formatter ---
export const formatOrderTableData = (orders: any[], t: TranslationFunction): OrderTableRow[] => {
    return orders.map(order => ({
        orderNo: order.orderNo,
        dateTime: JSON.stringify({ date: order.createdAt }),
        customer: JSON.stringify({ 
            name: order.customer?.name || t('details.generalCustomer') || 'ลูกค้าทั่วไป', 
            itemCount: order.items?.length || 0 
        }),
        payment: order.paymentMethod || '-',
        totalAmount: order.totalAmount.toString(),
        details: String(order.id)
    }));
};

export const getTableColumns = (
    selectedOrderId: number | null,
    setSelectedOrderId: (id: number) => void,
    t: TranslationFunction
): ColumnConfigs[] => [
    {
        name: t('table.orderNo') || 'เลขที่บิล',
        accessor: 'orderNo',
        container: ({ children }) => (
            <span className="font-bold text-gray-900">{children}</span>
        )
    },
    {
        name: t('table.dateTime') || 'วันที่/เวลา',
        accessor: 'dateTime',
        container: ({ children }) => {
            try {
                const { date } = JSON.parse(String(children));
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" /> {formatDate(date)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Clock className="w-3 h-3 mr-1" /> {formatTime(date)}
                        </span>
                    </div>
                );
            } catch { return <span>-</span>; }
        }
    },
    {
        name: t('table.customer') || 'ลูกค้า',
        accessor: 'customer',
        container: ({ children }) => {
            try {
                const { name, itemCount } = JSON.parse(String(children));
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 flex items-center">
                            <User className="w-3 h-3 mr-1" /> {name}
                        </span>
                        <span className="text-xs text-gray-500 ml-4">{itemCount} {t('details.itemsCountUnit') || 'รายการ'}</span>
                    </div>
                );
            } catch { return <span>-</span>; }
        }
    },
    {
        name: t('table.payment') || 'การชำระเงิน',
        accessor: 'payment',
        container: ({ children }) => (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${children === 'CASH' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {children || '-'}
            </span>
        )
    },
    {
        name: t('table.totalAmount') || 'ยอดสุทธิ',
        accessor: 'totalAmount',
        container: ({ children }) => (
            <span className="font-bold text-emerald-600">฿{formatCurrency(String(children))}</span>
        )
    },
    {
        name: t('table.details') || 'รายละเอียด',
        accessor: 'details',
        container: ({ children }) => {
            const orderId = Number(children);
            const isSelected = selectedOrderId === orderId;
            return (
                <button
                    onClick={() => setSelectedOrderId(orderId)}
                    className={`p-2 rounded-lg transition-colors border group relative ${isSelected ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-200'}`}
                    title={t('tooltips.viewDetails') || "ดูรายละเอียด"}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            );
        }
    }
];