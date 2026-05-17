'use client';

import { Product, ProductSellingUnit } from "@/libs/types/product";
import { Package } from "lucide-react";
import { useTranslations, useLocale } from "next-intl"; // 👈 นำเข้า hooks

export type PosItemType = {
    uniqueId: string;
    product: Product;
    sellingUnit: ProductSellingUnit;
    searchString: string;
    price: number;
    categoryName: string;
    stockAvailable: number;
}

interface ProductCardProps {
    item: PosItemType;
    handleProductSelect: (item: PosItemType) => void;
}

const ProductCard = ({ item, handleProductSelect }: ProductCardProps) => {
    const t = useTranslations('pos.productCard'); 
    const locale = useLocale(); 

    const { product, sellingUnit, stockAvailable, price } = item;
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || '';
    
    const rawImageUrl = sellingUnit.imageUrl || product.imageUrl;
    const displayImageUrl = rawImageUrl 
        ? (rawImageUrl.startsWith('http') ? rawImageUrl : `${BACKEND_URL}${rawImageUrl}`)
        : null;

    const getMockImage = (productName: string) => {
        const colors = [
            'from-rose-400/20 to-pink-400/20', 'from-blue-400/20 to-cyan-400/20',
            'from-emerald-400/20 to-teal-400/20', 'from-purple-400/20 to-violet-400/20',
            'from-amber-400/20 to-orange-400/20', 'from-indigo-400/20 to-blue-400/20',
        ];
        const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const isOutOfStock = stockAvailable <= 0;

    const unitName = locale === 'th' 
        ? (sellingUnit.unit?.nameTh || 'หน่วย') 
        : (sellingUnit.unit?.nameEn || sellingUnit.unit?.nameTh || 'Unit');

    return (
        <button
            onClick={() => handleProductSelect(item)}
            disabled={isOutOfStock}
            className={`
                group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden text-left
                transition-all duration-200
                ${isOutOfStock 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:border-emerald-300 hover:-translate-y-0.5 active:scale-[0.98]'
                }
            `}
        >
            <div className={`h-28 relative shrink-0 w-full ${!displayImageUrl ? `bg-linear-to-br ${getMockImage(product.name)}` : 'bg-gray-100'}`}>
                {displayImageUrl ? (
                    <img src={displayImageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-300" />
                    </div>
                )}

                <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${sellingUnit.sellType === 'WHOLESALE' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'}`}>
                        {sellingUnit.sellType === 'WHOLESALE' ? t('wholesaleBadge') : t('retailBadge')}
                    </span>
                </div>

                <div className="absolute top-2 right-2">
                    {stockAvailable <= 5 ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-md">
                            {t('lowStock', { count: stockAvailable })}
                        </span>
                    ) : (
                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-500 text-white shadow-md">
                            {stockAvailable}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-3 flex flex-col flex-1 w-full bg-white">
                <p className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1" title={product.name}>
                    {product.name} <span className="text-emerald-600 font-bold">({unitName})</span>
                </p>
                <div className="text-[10px] text-gray-400 mb-2 flex justify-between items-center">
                    <span>{t('barcode')}: {sellingUnit.barcode}</span>
                    {sellingUnit.multiplier > 1 && <span>x{sellingUnit.multiplier}</span>}
                </div>
                
                <div className="mt-auto">
                    <p className="text-lg font-bold text-emerald-600">
                        ฿{price.toFixed(2)}
                    </p>
                </div>
            </div>
        </button>
    )
}

export default ProductCard;