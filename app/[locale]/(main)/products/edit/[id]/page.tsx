'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/routing';
import { useLocale, useTranslations } from 'next-intl';

import { ChevronLeft, Loader2, Info } from 'lucide-react';
import { DynamicForm } from '@/components/ui/dynamic/Form';

import useToastStore from '@/libs/store/alertStore';
import { useProduct, useUpdateProduct, useUploadImage } from '@/libs/hooks/useProducts';
import { useCategories } from '@/libs/hooks/useCategory';
import { useUnits } from '@/libs/hooks/useUnit';

import { 
    ProductUpdateFormState, 
    getFormGroups, 
    buildUpdatePayload 
} from './dynamic-component-configs';

export default function UpdateProductsPage() {
    const router = useRouter();
    const params = useParams();
    const productId = Number(params.id);
    
    const t = useTranslations('products.update');
    const locale = useLocale();
    const showToast = useToastStore(state => state.showToast);

    const { data: productToEdit, isLoading: isLoadingProduct } = useProduct(productId);
    const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
    const { data: units = [], isLoading: isLoadingUnits } = useUnits();
    
    const { mutateAsync: updateProduct, isPending: updateProductPending } = useUpdateProduct();
    const { mutateAsync: uploadImage, isPending: uploadImagePending } = useUploadImage();

    const [formData, setFormData] = useState<ProductUpdateFormState>({
        name: '',
        description: '',
        categoryId: '',
        baseUnitId: '',
        imageFile: null 
    });

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name || '',
                description: productToEdit.description || '',
                categoryId: productToEdit.categoryId || '',
                baseUnitId: productToEdit.baseUnitId || '',
                imageFile: productToEdit.imageUrl || null,
            });
        }
    }, [productToEdit]);

    const categoryOptions = useMemo(() => 
        categories.map(cat => ({ label: locale === 'th' ? cat.nameTh : cat.nameEn || cat.nameTh, value: cat.id })), 
    [categories, locale]);

    const unitOptions = useMemo(() => 
        units.map(unit => ({ label: locale === 'th' ? unit.nameTh : unit.nameEn || unit.nameTh, value: unit.id })), 
    [units, locale]);

    const formGroups = useMemo(() => 
        getFormGroups(categoryOptions, unitOptions, t), 
    [categoryOptions, unitOptions, t]);

    const handleChange = (name: keyof ProductUpdateFormState, value: unknown) => {
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.categoryId || !formData.baseUnitId) {
            showToast(t('messages.requiredFields') || "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", 'error');
            return;
        }

        try {
            const payload = buildUpdatePayload(productId, formData);
            await updateProduct(payload);

            if (formData.imageFile instanceof File) {
                try {
                    await uploadImage({ 
                        id: productId, 
                        file: formData.imageFile,
                        action: "1"
                    });
                } catch (uploadError) {
                    console.error('Upload Image Failed:', uploadError);
                    showToast(t('messages.uploadFailed') || 'แก้ไขข้อมูลสำเร็จ แต่ไม่สามารถอัปโหลดรูปภาพใหม่ได้', 'warning');
                    router.push('/products');
                    return;
                }
            }
            
            showToast(t('messages.success') || 'แก้ไขข้อมูลสินค้าสำเร็จ!', 'success');
            router.push('/products'); 
        } catch (error: Error | unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Update failed:', error);
            showToast(`${t('messages.error') || 'ไม่สามารถแก้ไขข้อมูลได้:'} ${msg}`, 'error');
        }
    };

    if (isLoadingCategories || isLoadingUnits || isLoadingProduct) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-gray-600">
                <Loader2 className="w-8 h-8 mr-2 animate-spin text-emerald-600" />
                <span>{t('messages.loadingData') || 'กำลังโหลดข้อมูลสินค้า...'}</span>
            </div>
        );
    }

    if (!productToEdit) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] text-gray-600 gap-3">
                <p className="text-xl font-bold">{t('messages.notFound') || 'ไม่พบข้อมูลสินค้า'}</p>
                <button onClick={() => router.push('/products')} className="text-emerald-600 hover:underline font-bold">
                    {t('messages.backToProducts') || 'กลับไปหน้ารายการสินค้า'}
                </button>
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
                    <h1 className="text-2xl font-bold text-gray-800">{t('title') || 'แก้ไขข้อมูลสินค้าหลัก'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle') || 'รหัสสินค้าในระบบ:'} {productToEdit.id}</p>
                </div>
            </div>

            {/* Information Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm flex items-start gap-2 text-blue-800">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                <div>
                    <h4 className="font-bold mb-1">{t('banner.title') || 'ต้องการแก้ไขราคาหรือบาร์โค้ด?'}</h4>
                    <p className="text-blue-600">
                        {t('banner.line1') || 'หน้านี้สำหรับแก้ไขข้อมูลพื้นฐานเท่านั้น หากคุณต้องการเพิ่ม/ลดรูปแบบการขาย, เปลี่ยนบาร์โค้ด หรืออัปเดตราคาขาย'} <br/>
                        {t('banner.line2') || 'กรุณาไปที่หน้าเมนู'} <strong>"{t('banner.highlight') || 'ตั้งราคาและรูปแบบการขาย'}"</strong> {t('banner.line3') || 'ของสินค้านี้'}
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <DynamicForm<ProductUpdateFormState>
                dataForm={formData}
                groups={formGroups}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isSubmitting={updateProductPending || uploadImagePending}
                onCancel={() => router.push('/products')}
                submitLabel={t('submitBtn') || 'บันทึกการแก้ไข'}
            />
        </div>
    );
}