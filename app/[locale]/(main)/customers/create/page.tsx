'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from '@/routing';
import { useTranslations } from 'next-intl';

import { ChevronLeft } from 'lucide-react';
import { DynamicForm } from '@/components/ui/dynamic/Form';

import { useCreateCustomer } from '@/libs/hooks/useCustomer';
import useToastStore from '@/libs/store/alertStore';

import {
    CustomerCreateFormState,
    INITIAL_FORM_STATE,
    getFormGroups,
    buildCreateCustomerPayload
} from './configs';
import { getErrorResponse } from '@/utils/errorMapping';

export default function CreateCustomerPage() {
    const router = useRouter();
    const t = useTranslations('customers.create');
    const showToast = useToastStore((state) => state.showToast);

    const { mutateAsync: createCustomer, isPending: createCustomerPending } = useCreateCustomer();

    const [formData, setFormData] = useState<CustomerCreateFormState>(INITIAL_FORM_STATE);

    const formGroups = useMemo(() => getFormGroups(t), [t]);

    const handleChange = (name: keyof CustomerCreateFormState, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.phoneNumber) {
            showToast(t('messages.requiredPhone') || 'กรุณากรอกเบอร์โทรศัพท์', 'error');
            return;
        }

        const payload = buildCreateCustomerPayload(formData);
        await createCustomer(payload, {
            onSuccess: () => {
                showToast(t('messages.success') || 'เพิ่มลูกค้าใหม่สำเร็จ!', 'success');
                router.push('/customers');
            },
            onError: (error) => {
                console.error('Create failed:', error);
                const message = getErrorResponse(error);
                showToast(`${t('messages.error') || 'ไม่สามารถเพิ่มลูกค้าได้:'} ${message?.message}`, 'error');
            }
        });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.push('/customers')}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('title') || 'เพิ่มลูกค้าใหม่'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle') || 'ลงทะเบียนสมาชิกใหม่เข้าสู่ระบบสะสมแต้ม'}</p>
                </div>
            </div>

            {/* Information Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
                <h4 className="font-bold text-blue-800 mb-1">{t('banner.title') || 'ข้อมูลสมาชิก'}</h4>
                <p className="text-blue-600">
                    {t('banner.line1') || 'เบอร์โทรศัพท์จะถูกใช้เป็นข้อมูลหลักในการอ้างอิงและสะสมแต้มของลูกค้า'} <br />
                    {t('banner.line2') || 'หากไม่ทราบชื่อลูกค้า สามารถเว้นว่างไว้ก่อนและกลับมาแก้ไขในภายหลังได้'}
                </p>
            </div>

            {/* Form Section */}
            <DynamicForm<CustomerCreateFormState>
                dataForm={formData}
                groups={formGroups}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isSubmitting={createCustomerPending}
                onCancel={() => router.push('/customers')}
                submitLabel={t('form.submitBtn') || 'บันทึกข้อมูลลูกค้า'}
            />
        </div>
    );
}