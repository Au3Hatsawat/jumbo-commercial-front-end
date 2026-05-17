import { Customer } from '@/libs/types/customer';
import { FilterConfig } from '@/components/ui/dynamic/Filter';
import { ColumnConfigs } from '@/components/ui/dynamic/Table';
import { Phone, Star, Edit, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type TranslationFunction = ReturnType<typeof useTranslations<'customers'>>;

export type CustomerTableRow = {
    customer: string;
    totalSpent: string;
    points: string;
    lastVisit: string;
    manage: string;
};

// --- Helpers ---
export const getCustomerStats = (customer: Customer) => {
    const orders = customer.orders || [];
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);

    let lastVisit: Date | null = null;
    if (orders.length > 0) {
        const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        lastVisit = new Date(sortedOrders[0].createdAt);
    }

    return { totalSpent, lastVisit };
};

export const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
};

export const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// --- 1. Filter Configs ---
export const getFilterConfigs = (
    sortBy: 'spent-high' | 'spent-low' | 'points-high' | 'recent' | 'name',
    setSortBy: (val: 'spent-high' | 'spent-low' | 'points-high' | 'recent' | 'name') => void,
    t: TranslationFunction
): FilterConfig[] => [
    {
        id: 'sortBy',
        value: sortBy,
        onChange: (val: string) => setSortBy(val as 'spent-high' | 'spent-low' | 'points-high' | 'recent' | 'name'),
        options: [
            { label: t('filters.spentHigh') || 'ยอดซื้อมากสุด', value: 'spent-high' },
            { label: t('filters.spentLow') || 'ยอดซื้อน้อยสุด', value: 'spent-low' },
            { label: t('filters.pointsHigh') || 'แต้มสะสมมากสุด', value: 'points-high' },
            { label: t('filters.recent') || 'มาล่าสุด', value: 'recent' },
            { label: t('filters.nameAsc') || 'ชื่อ ก-ฮ', value: 'name' }
        ]
    }
];

// --- 2. Table Data Formatter ---
export const formatCustomerTableData = (
    filteredCustomers: (Customer & { stats: ReturnType<typeof getCustomerStats> })[],
    t: TranslationFunction
): CustomerTableRow[] => {
    return filteredCustomers.map(customer => ({
        customer: JSON.stringify({ name: customer.name || t('details.unknownName') || 'ไม่ระบุชื่อ', phone: customer.phoneNumber }),
        totalSpent: customer.stats.totalSpent.toString(),
        points: customer.points.toString(),
        lastVisit: customer.stats.lastVisit ? customer.stats.lastVisit.toISOString() : '',
        manage: String(customer.id)
    }));
};

// --- 3. Table Columns Configs ---
export const getTableColumns = (
    selectedCustomerId: number | null,
    setSelectedCustomerId: (id: number) => void,
    handleEditCustomer: (id: number) => void,
    t: TranslationFunction
): ColumnConfigs[] => [
    {
        name: t('table.customer') || 'ลูกค้า',
        accessor: 'customer',
        container: ({ children }) => {
            try {
                const { name, phone } = JSON.parse(String(children));
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                            {name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-gray-900 truncate">{name}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                <Phone className="w-3 h-3 mr-1"/> {phone}
                            </div>
                        </div>
                    </div>
                );
            } catch { return <span>-</span>; }
        }
    },
    {
        name: t('table.totalSpent') || 'ยอดซื้อรวม',
        accessor: 'totalSpent',
        container: ({ children }) => {
            const amount = Number(children);
            return <span className={`font-bold ${amount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>฿{formatCurrency(amount)}</span>;
        }
    },
    {
        name: t('table.points') || 'แต้มสะสม',
        accessor: 'points',
        container: ({ children }) => (
            <span className="text-gray-600 flex items-center font-medium">
                <Star className="w-3.5 h-3.5 text-yellow-400 mr-1.5"/> {Number(children).toLocaleString()}
            </span>
        )
    },
    {
        name: t('table.lastVisit') || 'มาล่าสุด',
        accessor: 'lastVisit',
        container: ({ children }) => {
            const dateStr = String(children);
            return <span className="text-gray-500 text-sm">{dateStr ? formatDate(new Date(dateStr)) : '-'}</span>;
        }
    },
    {
        name: t('table.manage') || 'จัดการ',
        accessor: 'manage',
        container: ({ children }) => {
            const id = Number(children);
            const isSelected = selectedCustomerId === id;
            return (
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => handleEditCustomer(id)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                        title={t('tooltips.edit') || "แก้ไขข้อมูลลูกค้า"}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setSelectedCustomerId(id)}
                        className={`p-2 rounded-lg transition-colors border group relative ${isSelected ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-200'}`}
                        title={t('tooltips.viewDetails') || "ดูรายละเอียด"}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            );
        }
    }
];