'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { DynamicForm } from '@/components/ui/dynamic/Form';
import { useRouter } from '@/routing';
import { useLocale, useTranslations } from 'next-intl';

import useToastStore from '@/libs/store/alertStore';
import { useCreateProduct, useUploadImage } from '@/libs/hooks/useProducts';
import { useCategories } from '@/libs/hooks/useCategory';
import { useUnits } from '@/libs/hooks/useUnit';

import { 
    ProductFormState, 
    INITIAL_FORM_STATE, 
    getFormGroups, 
    buildProductPayload 
} from './dynamic-component-configs';

export default function CreateProductsPage() {
    const router = useRouter();
    const showToast = useToastStore(state => state.showToast);
    
    const t = useTranslations('products.create');
    const locale = useLocale();

    const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
    const { data: units = [], isLoading: isLoadingUnits } = useUnits();
    
    const { mutateAsync: createProduct, isPending: createProductPending } = useCreateProduct();
    const { mutateAsync: uploadImage, isPending: uploadImagePending} = useUploadImage();

    const [formData, setFormData] = useState<ProductFormState>(INITIAL_FORM_STATE);

    const categoryOptions = useMemo(() => 
        categories.map(cat => ({ label: locale === 'th' ? cat.nameTh : cat.nameEn || cat.nameTh, value: cat.id })), 
    [categories, locale]);

    const unitOptions = useMemo(() => 
        units.map(unit => ({ label: locale === 'th' ? unit.nameTh : unit.nameEn || unit.nameTh, value: unit.id })), 
    [units, locale]);

    const formGroups = useMemo(() => 
        getFormGroups(categoryOptions, unitOptions, t), 
    [categoryOptions, unitOptions, t]);

    const handleChange = (name: keyof ProductFormState, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.categoryId || !formData.baseUnitId) {
            showToast(t('messages.requiredFields') || "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", 'error');
            return;
        }

        try {
            const payload = buildProductPayload(formData);
            const product = await createProduct(payload,{
                onError: (error) => {
                    console.error('Create Product Failed:', error);
                    showToast(`${t('messages.error') || 'ไม่สามารถสร้างสินค้าได้'}: ${error.message}`, 'error');
                }
            });

            if (formData.imageFile && product?.id) {
                try {
                    await uploadImage({ 
                        id: product.id, 
                        file: formData.imageFile 
                    });
                } catch (uploadError) {
                    console.error('Upload Image Failed:', uploadError);
                    showToast(t('messages.uploadFailed') || 'สร้างสินค้าสำเร็จ แต่ไม่สามารถอัปโหลดรูปภาพได้', 'warning');
                    router.push('/products');
                    return;
                }
            }
            
            showToast(t('messages.success') || 'เพิ่มสินค้าใหม่สำเร็จ! กรุณาเพิ่มรูปแบบการขายต่อไป', 'success');
            router.push(`/products`);
        } catch (error: any) {
            console.error('Save failed:', error);
            showToast(`${t('messages.error') || 'ไม่สามารถบันทึกข้อมูลได้'}: ${error.message}`, 'error');
        }
    };

    if (isLoadingCategories || isLoadingUnits) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-gray-600">
                <Loader2 className="w-8 h-8 mr-2 animate-spin text-emerald-600" />
                <span>{t('messages.loadingData') || 'กำลังโหลดข้อมูลตั้งต้น...'}</span>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.push('/products')}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('title') || 'เพิ่มสินค้าหลัก (Base Product)'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle') || 'กำหนดรายละเอียดสินค้าพื้นฐานเข้าระบบ ก่อนนำไปเพิ่มรูปแบบการขาย'}</p>
                </div>
            </div>

            {/* Information Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
                <h4 className="font-bold text-blue-800 mb-1">{t('banner.title') || 'ขั้นตอนการสร้างสินค้า'}</h4>
                <p className="text-blue-600">
                    {t('banner.line1') || 'หน้านี้คือการสร้างข้อมูลตั้งต้นของสินค้า (มีสต็อกเริ่มที่ 0 และต้นทุน ฿0.00)'} <br/>
                    {t('banner.line2') || 'หลังจากสร้างเสร็จแล้ว คุณจะต้องไปกำหนด "รูปแบบการขาย (ปลีก/ส่ง)" และบาร์โค้ดในหน้าถัดไป'}
                </p>
            </div>

            {/* Form Section */}
            <DynamicForm<ProductFormState>
                dataForm={formData}
                groups={formGroups}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isSubmitting={createProductPending || uploadImagePending}
                onCancel={() => router.push('/products')}
                submitLabel={t('submitBtn') || 'บันทึกสินค้าหลัก'}
            />
        </div>
    );
}