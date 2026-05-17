import { FormGroup } from '@/components/ui/dynamic/Form';
import { CategoryCreatePayload } from '@/libs/types/category'; 
import { useTranslations } from 'next-intl';

export type TranslationFunction = ReturnType<typeof useTranslations<'categories.create'>>;

export const INITIAL_FORM_STATE: CategoryCreatePayload = {
    nameTh: '',
    nameEn: ''
};

export const getFormGroups = (t: TranslationFunction): FormGroup[] => [
    {
        title: t('form.groups.basic.title') || 'ข้อมูลหมวดหมู่',
        description: t('form.groups.basic.desc') || 'ระบุชื่อหมวดหมู่ที่ต้องการใช้งานในระบบ',
        fields: [
            {
                name: 'nameTh',
                label: t('form.fields.nameThLabel') || 'ชื่อหมวดหมู่ (ภาษาไทย)',
                type: 'text',
                required: true,
                placeholder: t('form.fields.nameThPlaceholder') || 'เช่น เครื่องดื่ม, อาหารว่าง, ของใช้ทั่วไป' 
            },
            {
                name: 'nameEn',
                label: t('form.fields.nameEnLabel') || 'ชื่อหมวดหมู่ (ภาษาอังกฤษ)',
                type: 'text',
                required: true,
                placeholder: t('form.fields.nameEnPlaceholder') || 'เช่น Beverages, Snacks, Utilities'
            },
        ]
    }
];

export const buildCreateCategoryPayload = (formData: CategoryCreatePayload): CategoryCreatePayload => {
    return {
        nameTh: formData.nameTh,
        nameEn: formData.nameEn,
    };
};