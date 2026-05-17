'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from '@/routing'; 
import { useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';

import { DynamicForm } from '@/components/ui/dynamic/Form';
import { useCreateCategories } from '@/libs/hooks/useCategory'; 
import useToastStore from '@/libs/store/alertStore';
import { CategoryCreatePayload } from '@/libs/types/category'; 

import { 
    INITIAL_FORM_STATE, 
    getFormGroups, 
    buildCreateCategoryPayload 
} from './configs';

export default function CreateCategoryPage() {
    const router = useRouter();
    const t = useTranslations('categories.create');
    const showToast = useToastStore((state) => state.showToast);

    const { mutateAsync: createCategory, isPending } = useCreateCategories();

    const [formData, setFormData] = useState<CategoryCreatePayload>(INITIAL_FORM_STATE);

    const formGroups = useMemo(() => getFormGroups(t), [t]);

    const handleChange = (name: keyof CategoryCreatePayload, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = buildCreateCategoryPayload(formData);
            await createCategory(payload);

            showToast(t('messages.success') || 'บันทึกหมวดหมู่สำเร็จ!', 'success');
            router.push('/settings/categories'); 
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
                    onClick={() => router.push('/settings/categories')}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('title') || 'เพิ่มหมวดหมู่ใหม่'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle') || 'สร้างหมวดหมู่สำหรับใช้จัดระเบียบสินค้า'}</p>
                </div>
            </div>

            {/* Form Section */}
            <DynamicForm<CategoryCreatePayload>
                dataForm={formData}
                groups={formGroups}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
                onCancel={() => router.push('/settings/categories')}
                submitLabel={t('form.submitBtn') || 'บันทึกหมวดหมู่'}
            />
        </div>
    );
}