import { FormGroup } from '@/components/ui/dynamic/Form';
import { useTranslations } from 'next-intl';

export type TranslationFunction = ReturnType<typeof useTranslations<'units.create'>>;

export interface UnitCreateFormState {
    nameTh: string;
    nameEn: string;
}

export const INITIAL_FORM_STATE: UnitCreateFormState = {
    nameTh: '',
    nameEn: ''
};

export const getFormGroups = (t: TranslationFunction): FormGroup[] => [
    {
        title: t('form.groups.basic.title') || 'ข้อมูลหน่วยนับ',
        description: t('form.groups.basic.desc') || 'ระบุชื่อหน่วยนับที่ต้องการใช้งานในระบบ',
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

export const buildCreateUnitPayload = (formData: UnitCreateFormState) => {
    return {
        nameTh: formData.nameTh,
        nameEn: formData.nameEn,
    };
};