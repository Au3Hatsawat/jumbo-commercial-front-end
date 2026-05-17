import { FormGroup } from '@/components/ui/dynamic/Form';
import { useTranslations } from 'next-intl';

export type TranslationFunction = ReturnType<typeof useTranslations<'units.update'>>;

export interface UnitUpdateFormState {
    nameTh: string;
    nameEn: string;
}

export const getFormGroups = (t: TranslationFunction): FormGroup[] => [
    {
        title: t('form.groups.basic.title') || 'ข้อมูลหน่วยนับ',
        description: t('form.groups.basic.desc') || 'แก้ไขชื่อหน่วยนับที่ต้องการใช้งานในระบบ',
        fields: [
            {
                name: 'nameTh',
                label: t('form.fields.nameThLabel') || 'ชื่อหน่วยนับ (ภาษาไทย)',
                type: 'text',
                required: true,
                placeholder: t('form.fields.nameThPlaceholder') || 'เช่น ชิ้น, กล่อง, ขวด'
            },
            {
                name: 'nameEn',
                label: t('form.fields.nameEnLabel') || 'ชื่อหน่วยนับ (ภาษาอังกฤษ)',
                type: 'text',
                required: true,
                placeholder: t('form.fields.nameEnPlaceholder') || 'เช่น Piece, Box, Bottle'
            },
        ]
    }
];

export const buildUpdateUnitPayload = (id: number, formData: UnitUpdateFormState) => {
    return {
        id,
        nameTh: formData.nameTh,
        nameEn: formData.nameEn,
    };
};