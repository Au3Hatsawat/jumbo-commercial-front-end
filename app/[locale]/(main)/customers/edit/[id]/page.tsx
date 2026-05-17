'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/routing';
import { useTranslations } from 'next-intl';

import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { DynamicForm } from '@/components/ui/dynamic/Form';

import { useCustomer, useUpdateCustomer } from '@/libs/hooks/useCustomer';
import useToastStore from '@/libs/store/alertStore';

import {
    CustomerUpdateFormState,
    getFormGroups,
    buildUpdateCustomerPayload
} from './configs';
import { getErrorResponse } from '@/utils/errorMapping';

export default function EditCustomerPage() {
    const router = useRouter();
    const params = useParams();
    const customerId = Number(params.id);

    const t = useTranslations('customers.update');
    const showToast = useToastStore((state) => state.showToast);

    const { data: customer, isLoading: isFetching, error: fetchError } = useCustomer(customerId);
    const { mutateAsync: updateCustomer, isPending: updateCustomerPending } = useUpdateCustomer();

    const [formData, setFormData] = useState<CustomerUpdateFormState>({
        name: '',
        phoneNumber: ''
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                phoneNumber: customer.phoneNumber || ''
            });
        }
    }, [customer]);

    // 🚀 ดึง Form Configs มาจากไฟล์แยก
    const formGroups = useMemo(() => getFormGroups(t), [t]);

    const handleChange = (name: keyof CustomerUpdateFormState, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.phoneNumber) {
            showToast(t('messages.requiredPhone') || 'กรุณากรอกเบอร์โทรศัพท์', 'error');
            return;
        }

        const payload = buildUpdateCustomerPayload(customerId, formData);
        await updateCustomer(payload, {
            onSuccess: () => {
                showToast(t('messages.success') || 'แก้ไขข้อมูลลูกค้าสำเร็จ!', 'success');
                router.push('/customers');
            },
            onError: (error) => {
                console.error('Update failed:', error);
                const message = getErrorResponse(error);
                showToast(`${t('messages.error') || 'ไม่สามารถแก้ไขข้อมูลได้:'} ${message?.message}`, 'error');
            }
        });

    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-gray-500">
                <Loader2 className="animate-spin mr-2 w-6 h-6 text-emerald-600" />
                <span>{t('messages.loading') || 'กำลังโหลดข้อมูลลูกค้า...'}</span>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-80" />
                    <h3 className="font-bold text-lg">{t('messages.notFoundTitle') || 'ไม่พบข้อมูลลูกค้า'}</h3>
                    <p className="mt-1 text-sm">{t('messages.notFoundDesc') || 'อาจถูกลบไปแล้ว หรือเกิดข้อผิดพลาดในการดึงข้อมูล'}</p>
                    <button
                        onClick={() => router.push('/customers')}
                        className="mt-4 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                        {t('messages.backBtn') || 'ย้อนกลับ'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('title') || 'แก้ไขข้อมูลลูกค้า'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle') || 'อัปเดตข้อมูลรายละเอียดของสมาชิกในระบบ'}</p>
                </div>
            </div>

            {/* Information Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
                <h4 className="font-bold text-blue-800 mb-1">{t('banner.title') || 'ข้อมูลสมาชิก'}</h4>
                <p className="text-blue-600">
                    {t('banner.desc') || 'การแก้ไขเบอร์โทรศัพท์จะไม่ส่งผลกระทบต่อประวัติการซื้อหรือแต้มสะสมเดิมที่มีอยู่แล้ว'}
                </p>
            </div>

            {/* Form Section */}
            <DynamicForm<CustomerUpdateFormState>
                dataForm={formData}
                groups={formGroups}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isSubmitting={updateCustomerPending}
                onCancel={() => router.push('/customers')}
                submitLabel={t('form.submitBtn') || "บันทึกการเปลี่ยนแปลง"}
            />
        </div>
    );
}