import { Product } from '@/libs/types/product';
import { FilterConfig } from '@/components/ui/dynamic/Filter';
import { ColumnConfigs } from '@/components/ui/dynamic/Table';
import { AlertCircle, Package, Tags, PackagePlus, Edit } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/routing';

export type TranslationFunction = ReturnType<typeof useTranslations<'products'>>;
export type AppRouterInstance = ReturnType<typeof useRouter>;

export type SellingOptionSummary = {
    count: number;
    minPrice: number;
    hasRetail: boolean;
    hasWholesale: boolean;
};

export type StockData = {
    stock: number;
    unit: string;
};

export type TableRowData = {
    image: string;
    info: string;
    stock: string;
    cost: string;
    sellingFormat: string;
    manage: string;
};

export const getFilterConfigs = (
    categories: string[],
    selectedCategory: string,
    setSelectedCategory: (val: string) => void,
    stockFilter: 'all' | 'in-stock' | 'low-stock',
    setStockFilter: (val: 'all' | 'in-stock' | 'low-stock') => void,
    t: TranslationFunction
): FilterConfig[] => [
        {
            id: 'category',
            value: selectedCategory,
            onChange: setSelectedCategory,
            options: [
                { label: t('filters.allCategories') || 'หมวดหมู่ทั้งหมด', value: 'all' },
                ...categories.map(cat => ({ label: cat, value: cat }))
            ]
        },
        {
            id: 'stock',
            value: stockFilter,
            onChange: (val: string) => setStockFilter(val as 'all' | 'in-stock' | 'low-stock'),
            options: [
                { label: t('filters.allStock') || 'สต็อกทั้งหมด', value: 'all' },
                { label: t('filters.inStock') || 'มีสินค้า (6+)', value: 'in-stock' },
                { label: t('filters.lowStock') || 'เหลือน้อย (≤5)', value: 'low-stock' }
            ]
        }
    ];

export const formatProductTableData = (
    products: Product[],
    lang: string
): TableRowData[] => {
    return products.map((product) => {
        const cost = parseFloat(product.averageCost?.toString() || '0');

        const baseUnitName = lang === 'th' 
        ? (product.baseUnit?.nameTh || 'หน่วย') 
        : (product.baseUnit?.nameEn || product.baseUnit?.nameTh || 'Unit');

        const sellingUnits = product.sellingUnits || [];
        const count = sellingUnits.length;
        const minPrice = count > 0
            ? Math.min(...sellingUnits.map((su) => parseFloat(su.price.toString())))
            : 0;
        const hasRetail = sellingUnits.some((su) => su.sellType === 'RETAIL');
        const hasWholesale = sellingUnits.some((su) => su.sellType === 'WHOLESALE');

        const sellingSummary: SellingOptionSummary = { count, minPrice, hasRetail, hasWholesale };
        const stockData: StockData = { stock: product.currentStock, unit: baseUnitName };

        return {
            image: product.imageUrl || '',
            info: product.name || '-',
            stock: JSON.stringify(stockData),
            cost: `฿${cost.toFixed(2)} / ${baseUnitName}`,
            sellingFormat: JSON.stringify(sellingSummary),
            manage: String(product.id)
        };
    });
};

export const getTableColumns = (
    router: AppRouterInstance,
    t: TranslationFunction
): ColumnConfigs[] => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || '';

    return [
        {
            name: t('table.image') || 'รูปภาพ',
            accessor: 'image',
            container: ({ children }) => {
                const imageUrl = String(children);
                const displayUrl = imageUrl && imageUrl !== 'null' ? (imageUrl.startsWith('http') ? imageUrl : `${BACKEND_URL}${imageUrl}`) : null;

                return (
                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                        {displayUrl ? (
                            <img src={displayUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                            <Package className="w-6 h-6 text-gray-300" />
                        )}
                    </div>
                );
            }
        },
        {
            name: t('table.info') || 'ข้อมูลสินค้า',
            accessor: 'info',
            container: ({ children }) => (
                <div className="font-bold text-gray-900 max-w-[200px] whitespace-normal wrap-break-word" title={String(children)}>
                    {children}
                </div>
            )
        },
        {
            name: t('table.stock') || 'สต็อกคงเหลือ',
            accessor: 'stock',
            container: ({ children }) => {
                try {
                    const { stock, unit } = JSON.parse(String(children)) as StockData;
                    const isLowStock = stock <= 5;
                    const isOutOfStock = stock <= 0;

                    return (
                        <div className="flex flex-col items-start gap-1">
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isOutOfStock ? 'bg-red-100 text-red-800' :
                                    isLowStock ? 'bg-orange-100 text-orange-800' :
                                        'bg-emerald-100 text-emerald-800'
                                }`}>
                                {isLowStock && !isOutOfStock && <AlertCircle className="w-3 h-3 mr-1" />}
                                {stock.toLocaleString()} {unit}
                            </div>
                        </div>
                    );
                } catch (e) {
                    return <span>-</span>;
                }
            }
        },
        {
            name: t('table.cost') || 'ต้นทุนเฉลี่ย',
            accessor: 'cost',
            container: ({ children }) => <span className="text-gray-500 text-sm font-medium">{children}</span>
        },
        {
            name: t('table.sellingFormat') || 'รูปแบบการขาย',
            accessor: 'sellingFormat',
            container: ({ children }) => {
                try {
                    const summary = JSON.parse(String(children)) as SellingOptionSummary;

                    if (summary.count === 0) {
                        return <span className="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">{t('table.noPrice') || 'ยังไม่ตั้งราคาขาย'}</span>;
                    }

                    return (
                        <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-emerald-600 text-sm">
                                {t('table.startsAt') || 'เริ่มต้น'} ฿{summary.minPrice.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500 font-medium">{t('table.has') || 'มี'} {summary.count} {t('table.formats') || 'รูปแบบ'}</span>
                                <div className="flex gap-1">
                                    {summary.hasRetail && (
                                        <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{t('table.retail') || 'ปลีก'}</span>
                                    )}
                                    {summary.hasWholesale && (
                                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{t('table.wholesale') || 'ส่ง'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                } catch (e) {
                    return <span>-</span>;
                }
            }
        },
        {
            name: t('table.manage') || 'จัดการ',
            accessor: 'manage',
            container: ({ children }) => {
                const productId = Number(children);
                return (
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => router.push(`/products/selling-units/${productId}`)}
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-200 group relative"
                            title={t('table.setPriceTooltip') || 'ตั้งราคาและรูปแบบการขาย'}
                        >
                            <Tags className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => router.push(`/products/restock/${productId}`)}
                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200 group relative"
                            title={t('table.restockTooltip') || 'รับของเข้า/ปรับสต็อก'}
                        >
                            <PackagePlus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => router.push(`/products/edit/${productId}`)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 group relative"
                            title={t('table.editTooltip') || 'แก้ไขข้อมูลสินค้า'}
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    </div>
                );
            }
        }
    ];
};