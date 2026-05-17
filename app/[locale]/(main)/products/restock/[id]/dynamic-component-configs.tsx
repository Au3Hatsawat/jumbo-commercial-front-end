import { FormGroup } from '@/components/ui/dynamic/Form';
import { Product } from '@/libs/types/product';
import { StockType } from '@/libs/types/stock';
import { useTranslations } from 'next-intl';

export type TranslationFunction = ReturnType<typeof useTranslations<'products.restock'>>;

export interface RestockFormState {
    stockType: StockType;
    unitSelectorId: string;
    quantity: number | '';
    costPrice: number | '';
    adjustmentDirection: 'increase' | 'decrease';
    note: string;
}

export const calculateStockPreview = (product: Product | undefined, formData: RestockFormState) => {
    if (!product) return { multiplier: 1, baseQuantity: 0, costPerBaseUnit: 0, diff: 0, newStock: 0, unitName: '' };
    
    let multiplier = 1;
    let unitName = product.baseUnit?.nameTh || ''; 
    
    if (formData.unitSelectorId !== 'base' && product.sellingUnits) {
        const selectedUnit = product.sellingUnits.find(su => su.id.toString() === formData.unitSelectorId);
        if (selectedUnit) {
            multiplier = selectedUnit.multiplier;
            unitName = selectedUnit.unit?.nameTh || '';
        }
    }

    const inputQty = Number(formData.quantity) || 0;
    const inputCost = Number(formData.costPrice) || 0;

    const baseQuantity = inputQty * multiplier;
    const costPerBaseUnit = inputCost > 0 ? (inputCost / multiplier) : 0;

    let diff = 0;
    if (formData.stockType === StockType.RESTOCK) {
        diff = baseQuantity;
    } else if (formData.stockType === StockType.ADJUSTMENT) {
        diff = formData.adjustmentDirection === 'increase' ? baseQuantity : -baseQuantity;
    } else if (formData.stockType === StockType.DAMAGED) {
        diff = -baseQuantity;
    }

    return { 
        multiplier, 
        baseQuantity, 
        costPerBaseUnit, 
        diff, 
        newStock: product.currentStock + diff,
        unitName
    };
};

export const getFormGroups = (
    product: Product | undefined,
    formData: RestockFormState,
    calculation: ReturnType<typeof calculateStockPreview>,
    t: TranslationFunction,
    locale: string
): FormGroup[] => {
    if (!product) return [];

    const unitOptions = [
        { label: `${locale === 'th' ? product.baseUnit?.nameTh : product.baseUnit?.nameEn || product.baseUnit?.nameTh || 'Unit'} (${t('form.options.baseUnit') || 'หน่วยหลัก - ตัวคูณ x1'})`, value: 'base' },
    ];
    
    if (product.sellingUnits) {
        product.sellingUnits.forEach(su => {
            unitOptions.push({
                label: `${locale === 'th' ? su.unit?.nameTh : su.unit?.nameEn || su.unit?.nameTh || 'Unit'} (${t('form.options.multiplier') || 'ตัวคูณ'} x${su.multiplier})`,
                value: su.id.toString()
            });
        });
    }
    
    const baseGroup: FormGroup = {
        title: t('form.groups.details.title') || 'รายละเอียดการปรับปรุง',
        fields: [
            {
                name: 'stockType',
                label: t('form.fields.stockType') || 'ประเภทรายการ',
                type: 'select',
                required: true,
                options: [
                    { label: t('form.options.restock') || 'รับสินค้าเข้า (RESTOCK) - เพิ่มสต็อก + คำนวณต้นทุนใหม่', value: StockType.RESTOCK },
                    { label: t('form.options.adjustment') || 'ปรับปรุงสต็อก (ADJUSTMENT) - เพิ่ม/ลดจำนวน', value: StockType.ADJUSTMENT },
                    { label: t('form.options.damaged') || 'สินค้าเสียหาย (DAMAGED) - หักออกจากสต็อก', value: StockType.DAMAGED },
                ]
            },
            {
                name: 'unitSelectorId',
                label: t('form.fields.unitSelector') || 'รูปแบบหน่วยที่รับเข้า/ทำรายการ',
                type: 'select',
                required: true,
                options: unitOptions
            },
            {
                name: 'quantity',
                label: `${t('form.fields.quantity') || 'จำนวน'} (${calculation.unitName})`,
                type: 'number',
                required: true,
                placeholder: '0'
            }
        ]
    };

    if (formData.stockType === StockType.RESTOCK) {
        baseGroup.fields.push({
            name: 'costPrice',
            label: `${t('form.fields.costPrice') || 'ต้นทุนต่อ 1'} ${calculation.unitName}`,
            type: 'number',
            required: true,
            placeholder: '0.00'
        });
    } else if (formData.stockType === StockType.ADJUSTMENT) {
        baseGroup.fields.push({
            name: 'adjustmentDirection',
            label: t('form.fields.direction') || 'ทิศทางการปรับปรุง',
            type: 'select',
            required: true,
            options: [
                { label: t('form.options.increase') || 'เพิ่มสต็อก (+)', value: 'increase' },
                { label: t('form.options.decrease') || 'ลดสต็อก (-)', value: 'decrease' },
            ]
        });
    }

    const noteGroup: FormGroup = {
        fields: [
            { 
                name: 'note', 
                label: t('form.fields.note') || 'หมายเหตุ', 
                type: 'textarea', 
                placeholder: t('form.fields.notePlaceholder') || 'ระบุสาเหตุ เช่น รับสินค้าล็อตใหม่จากใบเสร็จ #INV1234, สินค้าชำรุด...' 
            }
        ]
    };

    return [baseGroup, noteGroup];
};