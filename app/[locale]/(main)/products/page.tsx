'use client';

import { useState, useMemo, useEffect } from 'react';
import { Loader2, Plus, AlertTriangle, XCircle, DollarSign, Package } from 'lucide-react';
import { useProducts } from '@/libs/hooks/useProducts';
import { Product } from '@/libs/types/product';
import Table from '@/components/ui/dynamic/Table';
import Pinto, { StatCardData } from '@/components/ui/dynamic/Pinto';
import Filter from '@/components/ui/dynamic/Filter';
import { ActionButton } from '@/components/ui/dynamic/Operation';
import { useRouter } from '@/routing';
import { useLocale, useTranslations } from 'next-intl';

import { 
    getFilterConfigs, 
    formatProductTableData, 
    getTableColumns,
    TableRowData
} from './dynamic-component-configs';
import { getErrorResponse } from '@/utils/errorMapping';

export default function ProductsPage() {
    const router = useRouter();
    const { data: products, isLoading, error } = useProducts();
    const t = useTranslations('products');
    const locale = useLocale();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const statCards = useMemo<StatCardData[]>(() => {
        if (!products) return [];

        const totalProducts = products.length;
        const lowStockCount = products.filter(p => p.currentStock > 0 && p.currentStock <= 5).length;
        const outOfStockCount = products.filter(p => p.currentStock === 0).length;
        const totalStockValue = products.reduce((acc, p) => acc + (parseFloat(p.averageCost?.toString() || '0') * p.currentStock), 0);

        return [
            {
                id: 'total-products',
                title: t('stats.totalProducts') || "สินค้าทั้งหมด (รายการ)",
                value: totalProducts.toLocaleString(),
                icon: Package,
                theme: "blue"
            },
            {
                id: 'low-stock',
                title: t('stats.lowStock') || "สินค้าใกล้หมด (≤5)",
                value: lowStockCount.toLocaleString(),
                icon: AlertTriangle,
                theme: "amber"
            },
            {
                id: 'out-of-stock',
                title: t('stats.outOfStock') || "สินค้าหมดสต็อก",
                value: outOfStockCount.toLocaleString(),
                icon: XCircle,
                theme: "red"
            },
            {
                id: 'total-stock-value',
                title: t('stats.totalValue') || "ต้นทุนสต็อกรวม",
                value: `฿${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                icon: DollarSign,
                theme: "emerald"
            }
        ];
    }, [products, t]);

    const operationActions: ActionButton[] = useMemo(() => [
        {
            label: t('actions.addProduct') || 'เพิ่มสินค้าหลัก',
            icon: <Plus className="w-5 h-5" />,
            onClick: () => router.push('/products/create'),
        }
    ], [router, t]);

    const categories = useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map((p) => locale === 'th' ? p.category?.nameTh : p.category?.nameEn || p.category?.nameTh || 'อื่นๆ'))];
    }, [products, locale]);

    const filterConfigs = useMemo(() => {
        return getFilterConfigs(categories, selectedCategory, setSelectedCategory, stockFilter, setStockFilter, t);
    }, [categories, selectedCategory, stockFilter, t, locale]);

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter((product: Product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sellingUnits?.some((su) => su.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const categoryName = locale === 'th' ? product.category?.nameTh : product.category?.nameEn || product.category?.nameTh || 'อื่นๆ';
            const matchesCategory = selectedCategory === 'all' || categoryName === selectedCategory;
            
            const matchesStock = stockFilter === 'all' ||
                (stockFilter === 'in-stock' && product.currentStock > 5) ||
                (stockFilter === 'low-stock' && product.currentStock <= 5 && product.currentStock > 0);
                
            return matchesSearch && matchesCategory && matchesStock;
        }).sort((a, b) => a.currentStock - b.currentStock);
    }, [products, searchQuery, selectedCategory, stockFilter, locale]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, stockFilter]);

    const tableData = useMemo(() => formatProductTableData(filteredProducts, locale), [filteredProducts, locale]);
    const columns = useMemo(() => getTableColumns(router, t), [router, t]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return tableData.slice(startIndex, startIndex + itemsPerPage);
    }, [tableData, currentPage, itemsPerPage]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setStockFilter('all');
    };

    const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || stockFilter !== 'all';

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-lg text-gray-600">
                <Loader2 className="animate-spin mr-2 w-6 h-6" />
                <span>{t('loading') || 'กำลังโหลดรายการสินค้า...'}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 rounded-xl border border-red-200 shadow-sm flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-red-600 font-medium">{getErrorResponse(error)?.message}</p>
            </div>
        );
    }

    return (
        <div className="p-0">
            {products && <Pinto cards={statCards} />}

            <Filter 
                showSearch={true}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder={t('searchPlaceholder') || "ค้นหาสินค้า (ชื่อหรือบาร์โค้ด)..."}
                filters={filterConfigs}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                actions={operationActions}
            />

            <div className="mb-4">
                <Table<TableRowData>
                    columns={columns}
                    datas={paginatedData}
                    pagination={{
                        currentPage: currentPage,
                        itemsPerPage: itemsPerPage,
                        totalItems: filteredProducts.length,
                        onPageChange: (newPage) => setCurrentPage(newPage)
                    }}
                />
            </div>
        </div>
    );
}