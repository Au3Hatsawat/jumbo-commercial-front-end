import { FormGroup } from '@/components/ui/dynamic/Form';
import { useTranslations } from 'next-intl';

export type TranslationFunction = ReturnType<typeof useTranslations<'customers.create'>>;

export interface CustomerCreateFormState {
    name: string;
    phoneNumber: string;
}

export const INITIAL_FORM_STATE: CustomerCreateFormState = {
    name: '',
    phoneNumber: ''
};

export const getFormGroups = (t: TranslationFunction): FormGroup[] => [
    {
        title: t('form.groups.basic.title') || 'ข้อมูลลูกค้า / สมาชิก',
        description: t('form.groups.basic.desc') || 'ระบุข้อมูลเบอร์โทรศัพท์และชื่อสำหรับการสมัครสมาชิกใหม่',
        fields: [
            {
                name: 'phoneNumber',
                label: t('form.fields.phoneLabel') || 'เบอร์โทรศัพท์ (จำเป็น)',
                type: 'text',
                required: true,
                placeholder: t('form.fields.phonePlaceholder') || 'เช่น 0812345678' 
            },
            {
                name: 'name',
                label: t('form.fields.nameLabel') || 'ชื่อลูกค้า (ไม่บังคับ)',
                type: 'text',
                required: false,
                placeholder: t('form.fields.namePlaceholder') || 'ชื่อ-นามสกุล หรือ ชื่อเล่น'
            },
        ]
    }
];

export const buildCreateCustomerPayload = (formData: CustomerCreateFormState) => {
    return {
        name: formData.name || undefined,
        phoneNumber: formData.phoneNumber,
    };
};