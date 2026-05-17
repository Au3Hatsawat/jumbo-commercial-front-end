import { Product } from '@/libs/types/product';
import { PosItemType } from '@/components/ui/ProductCard';
import { useTranslations } from 'next-intl';

export type TranslationFunction = ReturnType<typeof useTranslations<'pos'>>;

export type CustomerMode = 'guest' | 'member';
export type PaymentMethod = 'CASH' | 'QR';

export const flattenToPosItems = (products: Product[] | undefined, t: TranslationFunction, locale: string): PosItemType[] => {
    if (!products) return [];
    
    return products.flatMap((product: Product) => {
        const sellingUnits = product.sellingUnits || [];
        return sellingUnits.map(su => {
            const stockAvailable = Math.floor(product.currentStock / su.multiplier);
            return {
                uniqueId: `${product.id}-${su.id}`,
                product: product,
                sellingUnit: su,
                searchString: `${product.name} ${su.barcode} ${su.unit?.nameTh || ''}`.toLowerCase(),
                price: parseFloat(su.price.toString()),
                categoryName: locale === 'th' ? product.category?.nameTh || (t('categories.otherCategory') || 'อื่นๆ') : product.category?.nameEn || (t('categories.otherCategory') || 'Other'),
                stockAvailable: stockAvailable
            };
        });
    });
};

export const filterPosItems = (
    posItems: PosItemType[],
    searchQuery: string,
    selectedCategory: string
): PosItemType[] => {
    return posItems.filter(item => {
        const matchesSearch = item.searchString.includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.categoryName === selectedCategory;

        return matchesSearch && matchesCategory;
    }).sort((a, b) => b.stockAvailable - a.stockAvailable);
};