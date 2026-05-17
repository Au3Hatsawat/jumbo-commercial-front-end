'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/routing';
import { useLocale, useTranslations } from 'next-intl';

import { ChevronLeft, Loader2, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { DynamicForm } from '@/components/ui/dynamic/Form';

import useToastStore from '@/libs/store/alertStore';
import { useProduct, useRestockProduct } from '@/libs/hooks/useProducts';
import { useCreateStockLog } from '@/libs/hooks/useOrder'; 
import { StockType, ProductStockPayload } from '@/libs/types/stock';

import { 
    RestockFormState, 
    calculateStockPreview, 
    getFormGroups 
} from './dynamic-component-configs';

export default function RestockProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = Number(params.id);
    const showToast = useToastStore(state => state.showToast);
    const t = useTranslations('products.restock');
    const locale = useLocale();

    const { data: product, isLoading: isProductLoading } = useProduct(productId);
    const { mutateAsync: restockProduct, isPending: isRestocking } = useRestockProduct();
    const { mutateAsync: createStockLog, isPending: isAdjusting } = useCreateStockLog();

    const isPending = isRestocking || isAdjusting;

    const [formData, setFormData] = useState<RestockFormState>({
        stockType: StockType.RESTOCK,
        unitSelectorId: 'base', 
        quantity: '',
        costPrice: '',
        adjustmentDirection: 'decrease',
        note: ''
    });

    useEffect(() => {
        if (product && product.averageCost && formData.unitSelectorId === 'base') {
            setFormData(prev => ({
                ...prev,
                costPrice: Number(product.averageCost) || 0
            }));
        }
    }, [product]);

    const handleChange = (name: keyof RestockFormState, value: unknown) => {
        setFormData(prev => ({ ...prev, [name as string]: value }));
        if (name === 'unitSelectorId') {
             setFormData(prev => ({ ...prev, costPrice: '', quantity: '' }));
        }
    };

    const calculation = useMemo(() => calculateStockPreview(product, formData), [product, formData]);
    const formGroups = useMemo(() => getFormGroups(product, formData, calculation, t, locale), [product, formData, calculation, t, locale]);
    const baseUnitName = useMemo(() => {
        return locale === 'th' ? product?.baseUnit?.nameTh : product?.baseUnit?.nameEn || product?.baseUnit?.nameTh || '';
    }, [product,locale]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!product) return;
        if (calculation.baseQuantity <= 0) {
            showToast(t('messages.invalidQuantity') || "กรุณาระบุจำนวนให้ถูกต้อง (มากกว่า 0)", 'error');
            return;
        }

        try {
            if (formData.stockType === StockType.RESTOCK) {
                if (calculation.costPerBaseUnit <= 0) {
                    showToast(t('messages.invalidCost') || "กรุณาระบุต้นทุนให้ถูกต้อง", 'error');
                    return;
                }

                await restockProduct({
                    productId: product.id,
                    quantityToAdd: calculation.baseQuantity, 
                    costPerUnit: calculation.costPerBaseUnit, 
                    note: formData.note || undefined,
                });
                showToast(t('messages.restockSuccess') || 'รับสินค้าเข้าสำเร็จ! อัปเดตสต็อกหลักและต้นทุนเฉลี่ยแล้ว', 'success');

            } else {
                let actualQuantity = calculation.baseQuantity; 
                if (formData.stockType === StockType.ADJUSTMENT && formData.adjustmentDirection === 'decrease') {
                    actualQuantity = -calculation.baseQuantity;
                } else if (formData.stockType === StockType.DAMAGED) {
                    actualQuantity = -calculation.baseQuantity;
                }

                await createStockLog({
                    productId: product.id,
                    quantity: actualQuantity,
                    stockType: formData.stockType,
                    note: formData.note || undefined,
                } as ProductStockPayload); 

                showToast(t('messages.adjustSuccess') || 'ปรับปรุงสต็อกสำเร็จ!', 'success');
            }

            router.push('/products'); 
        } catch (error: Error | unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Stock adjustment failed:', error);
            showToast(`${t('messages.error') || 'เกิดข้อผิดพลาด:'} ${msg}`, 'error');
        }
    };

    if (isProductLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-gray-600">
                <Loader2 className="w-8 h-8 mr-2 animate-spin text-emerald-600" />
                <span>{t('messages.loadingData') || 'กำลังโหลดข้อมูลสินค้า...'}</span>
            </div>
        );
    }

    if (!product) {
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
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.push('/products')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        {t('title') || 'ปรับปรุง/รับเข้าสต็อก'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle') || 'สินค้า:'} {product.name}</p>
                </div>
            </div>

            {/* Current Stock Banner */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">{t('currentStockLabel') || 'สต็อกในระบบปัจจุบัน (หน่วยหลัก)'}</span>
                    <div className="text-3xl font-bold text-gray-800">
                        {product.currentStock} <span className="text-base font-medium text-gray-500 ml-1">{baseUnitName}</span>
                    </div>
                </div>
                {product.averageCost && (
                    <div className="md:text-right bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
                        <span className="text-sm text-orange-600 block">{t('avgCostLabel') || 'ต้นทุนเฉลี่ย (ต่อ 1'} {baseUnitName}):</span>
                        <span className="font-bold text-orange-700 text-lg">฿{parseFloat(product.averageCost).toFixed(2)}</span>
                    </div>
                )}
            </div>

            {/* Preview Banner */}
            <div className={`rounded-xl border p-5 shadow-sm mb-6 ${
                calculation.diff === 0 ? 'bg-gray-50 border-gray-200' :
                calculation.diff > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            }`}>
                <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-bold text-gray-700">{t('preview.title') || 'พรีวิวการคำนวณเข้าระบบ'}</span>
                    {calculation.diff !== 0 && (
                        <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-md ${
                            calculation.diff > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {calculation.diff > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            {calculation.diff > 0 ? '+' : ''}{calculation.diff} {baseUnitName}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-3 rounded-lg border border-gray-100">
                    <div>
                        <span className="text-gray-500 block mb-1">{t('preview.baseQuantity') || 'แปลงเป็นหน่วยหลัก (เข้าสต็อกจริง)'}</span>
                        <span className="font-bold text-gray-800 text-base">{calculation.baseQuantity} {baseUnitName}</span>
                        {calculation.multiplier > 1 && (
                            <span className="text-xs text-gray-400 ml-2">({formData.quantity || 0} {calculation.unitName} × {calculation.multiplier})</span>
                        )}
                    </div>
                    
                    {formData.stockType === StockType.RESTOCK && (
                        <div>
                            <span className="text-gray-500 block mb-1">{t('preview.avgCost') || 'เฉลี่ยต้นทุน (ต่อ 1'} {baseUnitName})</span>
                            <span className="font-bold text-emerald-600 text-base">฿{calculation.costPerBaseUnit.toFixed(2)}</span>
                            {calculation.multiplier > 1 && (
                                <span className="text-xs text-gray-400 ml-2">(฿{formData.costPrice || 0} ÷ {calculation.multiplier})</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-baseline gap-2">
                    <span className="text-sm font-medium text-gray-600">{t('preview.newStock') || 'สต็อกคงเหลือหลังบันทึก:'}</span>
                    <span className={`text-xl font-bold ${
                        calculation.diff === 0 ? 'text-gray-800' :
                        calculation.diff > 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                        {calculation.newStock}
                    </span>
                    <span className="text-sm font-medium text-gray-600">{baseUnitName}</span>
                </div>
            </div>

            {/* Information Box */}
            {calculation.multiplier > 1 && formData.stockType === StockType.RESTOCK && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm flex items-start gap-2 text-blue-800">
                    <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                    <p>
                        {t('infoBanner.line1') || 'ระบบจะทำการ คูณจำนวนและหารต้นทุน ให้อัตโนมัติ เพื่อนำไปเก็บเป็นหน่วยชิ้นเล็กในคลังสินค้า'} <br/>
                        {t('infoBanner.line2') || '(คุณสามารถกรอกราคายกแพ็คได้เลย)'}
                    </p>
                </div>
            )}

            {/* Dynamic Form */}
            <DynamicForm<RestockFormState>
                dataForm={formData}
                groups={formGroups}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
                onCancel={() => router.push('/products')}
                submitLabel={t('submitBtn') || 'บันทึกการปรับปรุง'}
            />
        </div>
    );
}