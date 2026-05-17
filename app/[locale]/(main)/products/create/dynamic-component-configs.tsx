import { FormGroup } from '@/components/ui/dynamic/Form';
import { ProductCreatePayload } from '@/libs/types/product';
import { useTranslations } from 'next-intl';

export type TranslationFunction = ReturnType<typeof useTranslations<'products.create'>>;
export type CommonTranslationFunction = ReturnType<typeof useTranslations<'Common'>>;

export interface ProductFormState {
    name: string;
    description: string;
    categoryId: number | '';
    baseUnitId: number | '';
    imageFile: File | null;
}

export const INITIAL_FORM_STATE: ProductFormState = {
    name: '',
    description: '',
    categoryId: '',
    baseUnitId: '',
    imageFile: null
};

export const getFormGroups = (
    categoryOptions: { label: string; value: number }[],
    unitOptions: { label: string; value: number }[],
    t: TranslationFunction
): FormGroup[] => [
    {
        title: t('form.groups.image.title') || 'รูปภาพสินค้า',
        description: t('form.groups.image.desc') || 'อัปโหลดรูปภาพเพื่อแสดงผลหน้าร้านและในระบบสต็อก',
        fields: [
            { 
                name: 'imageFile', 
                label: t('form.fields.imageLabel') || 'รูปภาพสินค้า', 
                type: 'image', 
                required: false, 
                accept: 'image/jpeg, image/png, image/webp' 
            }
        ]
    },
    {
        title: t('form.groups.basic.title') || 'ข้อมูลพื้นฐาน',
        description: t('form.groups.basic.desc') || 'รายละเอียดหลักของสินค้า',
        fields: [
            { 
                name: 'name', 
                label: t('form.fields.nameLabel') || 'ชื่อสินค้า', 
                type: 'text', 
                required: true, 
                placeholder: t('form.fields.namePlaceholder') || 'เช่น น้ำเปล่า 600ml' 
            },
            { 
                name: 'description', 
                label: t('form.fields.descLabel') || 'รายละเอียดเพิ่มเติม', 
                type: 'textarea' 
            },
        ]
    },
    {
        title: t('form.groups.classification.title') || 'การจัดหมวดหมู่และหน่วยนับพื้นฐาน',
        fields: [
            { 
                name: 'categoryId', 
                label: t('form.fields.categoryLabel') || 'หมวดหมู่', 
                type: 'select', 
                required: true,
                options: categoryOptions
            },
            { 
                name: 'baseUnitId', 
                label: t('form.fields.unitLabel') || 'หน่วยนับพื้นฐาน (สำหรับการเก็บสต็อก)', 
                type: 'select', 
                required: true,
                options: unitOptions
            },
        ]
    }
];

export const buildProductPayload = (formData: ProductFormState): ProductCreatePayload => {
    return {
        name: formData.name,
        description: formData.description || undefined,
        categoryId: Number(formData.categoryId),
        baseUnitId: Number(formData.baseUnitId),
        sellingUnits: [],
    };
};