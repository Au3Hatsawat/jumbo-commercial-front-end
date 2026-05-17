'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from '@/routing';
import { useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';

import { DynamicForm } from '@/components/ui/dynamic/Form';
import { UseCreateUnits } from '@/libs/hooks/useUnit';
import useToastStore from '@/libs/store/alertStore';

import { 
    UnitCreateFormState, 
    INITIAL_FORM_STATE, 
    getFormGroups, 
    buildCreateUnitPayload 
} from './configs';

export default function CreateUnitPage() {
    const router = useRouter();
    const t = useTranslations('units.create');
    const showToast = useToastStore((state) => state.showToast);

    const { mutateAsync: createUnit, isPending } = UseCreateUnits();

    const [formData, setFormData] = useState<UnitCreateFormState>(INITIAL_FORM_STATE);

    const formGroups = useMemo(() => getFormGroups(t), [t]);

    const handleChange = (name: keyof UnitCreateFormState, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = buildCreateUnitPayload(formData);
            await createUnit(payload);

            showToast(t('messages.success') || 'บันทึกหน่วยนับสำเร็จ!', 'success');
            router.push('/settings/units'); 
        } catch (error: unknown) {
            console.error('Create failed:', error);
            const msg = error instanceof Error ? error.message : '';
            showToast(`${t('messages.error') || 'ไม่สามารถบันทึกข้อมูลได้'} ${msg}`, 'error');
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.push('/settings/units')}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('title') || 'เพิ่มหน่วยนับใหม่'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle') || 'สร้างหน่วยนับสำหรับใช้จัดหมวดหมู่สินค้า'}</p>
                </div>
            </div>

            {/* Form Section */}
            <DynamicForm<UnitCreateFormState>
                dataForm={formData}
                groups={formGroups}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
                onCancel={() => router.push('/settings/units')}
                submitLabel={t('form.submitBtn') || 'บันทึกหน่วยนับ'}
            />
        </div>
    );
}