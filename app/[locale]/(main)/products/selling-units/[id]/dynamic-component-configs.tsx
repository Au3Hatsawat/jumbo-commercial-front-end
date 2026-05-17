import { FormGroup } from '@/components/ui/dynamic/Form';
import { useTranslations } from 'next-intl';

export type TranslationFunction = ReturnType<typeof useTranslations<'products.sellingUnits'>>;

export interface SellingUnitFormState {
    barcode: string;
    unitId: number | '';
    multiplier: number | '';
    price: number | '';
    sellType: string;
    imageFile: File | string | null;
}

export interface SellingUnitDisplay {
    id: number;
    barcode: string;
    multiplier: number;
    price: string | number;
    sellType: string;
    imageUrl?: string;
    unitId?: number;
    unit?: {
        id?: number;
        nameTh: string;
        nameEn: string;
    };
}

export const INITIAL_FORM_STATE: SellingUnitFormState = {
    barcode: '',
    unitId: '',
    multiplier: '',
    price: '',
    sellType: 'RETAIL',
    imageFile: null
};

export const getFormGroups = (
    unitOptions: { label: string; value: number }[],
    isEditing: boolean,
    t: TranslationFunction
): FormGroup[] => {
    
    const sellTypeOptions = [
        { label: t('form.options.retail') || 'ขายปลีก (Retail)', value: 'RETAIL' },
        { label: t('form.options.wholesale') || 'ขายส่ง (Wholesale)', value: 'WHOLESALE' }
    ];

    return [
        {
            title: isEditing ? (t('form.groups.image.titleEdit') || 'แก้ไขรูปภาพ') : (t('form.groups.image.titleAdd') || 'รูปภาพรูปแบบการขาย (ไม่บังคับ)'),
            fields: [
                { 
                    name: 'imageFile', 
                    label: t('form.fields.imageLabel') || 'รูปภาพเฉพาะรูปแบบนี้ (เช่น รูปลัง, รูปแพ็ค)', 
                    type: 'image', 
                    required: false, 
                    accept: 'image/jpeg, image/png, image/webp' 
                }
            ]
        },
        {
            title: isEditing ? (t('form.groups.basic.titleEdit') || 'แก้ไขข้อมูลรูปแบบการขาย') : (t('form.groups.basic.titleAdd') || 'ข้อมูลรูปแบบการขาย'),
            fields: [
                { 
                    name: 'barcode', 
                    label: t('form.fields.barcodeLabel') || 'บาร์โค้ด', 
                    type: 'text', 
                    required: true, 
                    placeholder: t('form.fields.barcodePlaceholder') || 'สแกนหรือพิมพ์บาร์โค้ด' 
                },
                { 
                    name: 'unitId', 
                    label: t('form.fields.unitLabel') || 'หน่วยขาย', 
                    type: 'select', 
                    required: true, 
                    options: unitOptions 
                },
                { 
                    name: 'multiplier', 
                    label: t('form.fields.multiplierLabel') || 'ตัวคูณ (อิงจากหน่วยนับพื้นฐาน)', 
                    type: 'number', 
                    required: true, 
                    placeholder: t('form.fields.multiplierPlaceholder') || 'เช่น 1, 6, 12' 
                },
                { 
                    name: 'price', 
                    label: t('form.fields.priceLabel') || 'ราคาขาย (฿)', 
                    type: 'number', 
                    required: true, 
                    placeholder: '0.00' 
                },
                { 
                    name: 'sellType', 
                    label: t('form.fields.sellTypeLabel') || 'ชนิดการขาย', 
                    type: 'select', 
                    required: true, 
                    options: sellTypeOptions 
                },
            ]
        }
    ];
};