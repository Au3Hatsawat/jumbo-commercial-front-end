'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/routing';
import { useTranslations } from 'next-intl';

import { ChevronLeft, Loader2 } from 'lucide-react';
import { DynamicForm } from '@/components/ui/dynamic/Form';

import { useUnit, UseUpdateUnit } from '@/libs/hooks/useUnit'; 
import useToastStore from '@/libs/store/alertStore';

import { 
    UnitUpdateFormState, 
    getFormGroups, 
    buildUpdateUnitPayload 
} from './configs';

export default function EditUnitsPage() {
    const router = useRouter();
    const params = useParams();
    const unitId = Number(params.id);

    const t = useTranslations('units.update');
    const showToast = useToastStore((state) => state.showToast);

    const { data: unitToEdit, isLoading: isLoadingUnit } = useUnit(unitId);
    const { mutateAsync: updateUnit, isPending } = UseUpdateUnit();

    const [formData, setFormData] = useState<UnitUpdateFormState>({
        nameTh: '',
        nameEn: ''
    });

    useEffect(() => {
        if (unitToEdit) {
            setFormData({
                nameTh: unitToEdit.nameTh || '',
                nameEn: unitToEdit.nameEn || ''
            });
        }
    }, [unitToEdit]);

    const formGroups = useMemo(() => getFormGroups(t), [t]);

    const handleChange = (name: keyof UnitUpdateFormState, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nameTh || !formData.nameEn) {
            showToast(t('messages.requiredFields') || 'กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
            return;
        }

        try {
            const payload = buildUpdateUnitPayload(unitId, formData);
            await updateUnit(payload);

            showToast(t('messages.success') || 'แก้ไขหน่วยนับสำเร็จ!', 'success');
            router.push('/settings/units');
        } catch (error: unknown) {
            console.error('Update failed:', error);
            const msg = error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง';
            showToast(`${t('messages.error') || 'ไม่สามารถแก้ไขข้อมูลได้:'} ${msg}`, 'error');
        }
    };

    if (isLoadingUnit) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-gray-600">
                <Loader2 className="w-8 h-8 mr-2 animate-spin text-emerald-600" />
                <span>{t('messages.loading') || 'กำลังโหลดข้อมูลหน่วยนับ...'}</span>
            </div>
        );
    }

    if (!unitToEdit) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] text-gray-600 gap-3">
                <p className="text-xl font-bold">{t('messages.notFound') || 'ไม่พบข้อมูลหน่วยนับ'}</p>
                <button onClick={() => router.push('/settings/units')} className="text-emerald-600 hover:underline font-medium">
                    {t('messages.backBtn') || 'กลับไปหน้ารายการหน่วยนับ'}
                </button>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold text-gray-800">{t('title') || 'แก้ไขหน่วยนับ'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle') || 'อัปเดตข้อมูลหน่วยนับที่มีอยู่ในระบบ'}</p>
                </div>
            </div>

            {/* Form Section */}
            <DynamicForm<UnitUpdateFormState>
                dataForm={formData}
                groups={formGroups}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
                onCancel={() => router.push('/settings/units')}
                submitLabel={t('form.submitBtn') || 'บันทึกการแก้ไข'}
            />
        </div>
    );
}