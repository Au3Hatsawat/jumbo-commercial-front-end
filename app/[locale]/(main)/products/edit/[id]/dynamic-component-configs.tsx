import { FormGroup } from '@/components/ui/dynamic/Form';
import { ProductUpdatePayload } from '@/libs/types/product';
import { useTranslations } from 'next-intl';

export type TranslationFunction = ReturnType<typeof useTranslations<'products.update'>>;

export interface ProductUpdateFormState {
    name: string;
    description: string;
    categoryId: number | '';
    baseUnitId: number | ''; 
    imageFile: File | string | null;
}

export const getFormGroups = (
    categoryOptions: { label: string; value: number }[],
    unitOptions: { label: string; value: number }[],
    t: TranslationFunction
): FormGroup[] => [
    {
        title: t('form.groups.image.title') || 'รูปภาพสินค้าหลัก',
        description: t('form.groups.image.desc') || 'อัปโหลดรูปภาพใหม่เพื่อเปลี่ยนรูปเดิม (หากไม่ต้องการเปลี่ยน ให้เว้นว่างไว้)',
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

export const buildUpdatePayload = (
    productId: number,
    formData: ProductUpdateFormState
): ProductUpdatePayload => {
    return {
        id: productId, 
        name: formData.name,
        description: formData.description || undefined,
        categoryId: Number(formData.categoryId),
        baseUnitId: Number(formData.baseUnitId),
    };
};