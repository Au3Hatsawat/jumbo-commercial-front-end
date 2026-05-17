'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/routing';
import { useLocale, useTranslations } from 'next-intl';

import { ChevronLeft, Loader2, Tag, Barcode, Info, Package, Edit, Trash2 } from 'lucide-react';
import useToastStore from '@/libs/store/alertStore';
import { DynamicForm } from '@/components/ui/dynamic/Form';
import Modal from '@/components/ui/dynamic/Modal';

import {
    useProducts,
    useAddSellingUnit,
    useUpdateSellingUnit,
    useUploadImage,
    useDeleteSellingUnit
} from '@/libs/hooks/useProducts';
import { useUnits } from '@/libs/hooks/useUnit';
import { SELLTYPE } from '@/libs/types/product';

import {
    SellingUnitFormState,
    SellingUnitDisplay,
    INITIAL_FORM_STATE,
    getFormGroups
} from './dynamic-component-configs';
import { getErrorResponse } from '@/utils/errorMapping';

export default function ProductSellingUnitsPage() {
    const router = useRouter();
    const params = useParams();
    const productId = Number(params.id);
    const locale = useLocale();
    const showToast = useToastStore(state => state.showToast);

    const t = useTranslations('products.sellingUnits');

    const { data: products, isLoading: isProductLoading } = useProducts();
    const { data: units = [], isLoading: isUnitsLoading } = useUnits();

    const { mutateAsync: addSellingUnit, isPending: isAdding } = useAddSellingUnit();
    const { mutateAsync: updateSellingUnit, isPending: isUpdating } = useUpdateSellingUnit();
    const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage();
    const { mutateAsync: deleteSellingUnit, isPending: isDeleting, error: deleteError } = useDeleteSellingUnit();

    const product = useMemo(() => products?.find(p => p.id === productId), [products, productId]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<SellingUnitDisplay | null>(null);

    const [formData, setFormData] = useState<SellingUnitFormState>(INITIAL_FORM_STATE);

    const unitOptions = useMemo(() =>
        units.map(unit => ({ label: locale === 'th' ? unit.nameTh : unit.nameEn, value: unit.id })),
        [units, locale]);

    const formGroups = useMemo(() =>
        getFormGroups(unitOptions, editingId !== null, t),
        [unitOptions, editingId, t]);

    const handleChange = (name: keyof SellingUnitFormState, value: unknown) => {
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleEditClick = (su: SellingUnitDisplay) => {
        setEditingId(su.id);
        const uId = su.unitId || su.unit?.id || '';
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || '';
        const existingImageUrl = su.imageUrl ? (su.imageUrl.startsWith('http') ? su.imageUrl : `${BACKEND_URL}${su.imageUrl}`) : null;

        setFormData({
            barcode: su.barcode,
            unitId: uId,
            multiplier: su.multiplier,
            price: Number(su.price),
            sellType: su.sellType,
            imageFile: existingImageUrl
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        handleClearForm();
    };

    const handleDeleteClick = (su: SellingUnitDisplay) => {
        setUnitToDelete(su);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!unitToDelete) return;

        deleteSellingUnit(
            { id: unitToDelete.id, productId },
            {
                onSuccess: () => {
                    showToast(t('messages.deleteSuccess') || "ลบรูปแบบการขายสำเร็จ!", "success");
                    setIsDeleteModalOpen(false);
                    setUnitToDelete(null);

                    if (editingId === unitToDelete.id) {
                        handleCancelEdit();
                    }
                },
                onError: (error) => {
                    const errorResponse = getErrorResponse(error);
                    const msg = errorResponse?.message || 'Unknown error';
                    showToast(`${t('messages.errorDelete') || 'เกิดข้อผิดพลาดในการลบ:'} ${msg}`, "error");
                }
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.barcode || !formData.unitId || !formData.multiplier || formData.price === '') {
            showToast(t('messages.requiredFields') || "กรุณากรอกข้อมูลให้ครบถ้วน", "error");
            return;
        }

        try {
            let targetUnitId = editingId;

            if (editingId) {
                await updateSellingUnit({
                    id: editingId,
                    barcode: formData.barcode,
                    unitId: Number(formData.unitId),
                    multiplier: Number(formData.multiplier),
                    price: Number(formData.price),
                    sellType: formData.sellType as SELLTYPE
                });
                showToast(t('messages.updateSuccess') || "แก้ไขรูปแบบการขายสำเร็จ!", "success");
            } else {
                const createdUnit = await addSellingUnit({
                    productId,
                    data: {
                        barcode: formData.barcode,
                        unitId: Number(formData.unitId),
                        multiplier: Number(formData.multiplier),
                        price: Number(formData.price),
                        sellType: formData.sellType as SELLTYPE
                    }
                });
                targetUnitId = createdUnit?.id;
                showToast(t('messages.addSuccess') || "เพิ่มรูปแบบการขายสำเร็จ!", "success");
            }

            if (formData.imageFile instanceof File && targetUnitId) {
                try {
                    await uploadImage({
                        id: productId,
                        file: formData.imageFile,
                        action: "2",
                        productSellingUnitId: targetUnitId
                    });
                } catch (uploadError) {
                    console.error('Upload error:', uploadError);
                    showToast(t('messages.uploadFailed') || 'บันทึกข้อมูลสำเร็จ แต่ไม่สามารถอัปโหลดรูปภาพได้', 'warning');
                }
            }

            setEditingId(null);
            handleClearForm();
        } catch (error: Error | unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            showToast(`${t('messages.error') || 'เกิดข้อผิดพลาด:'} ${msg}`, "error");
        }
    };

    const handleClearForm = () => {
        setFormData(INITIAL_FORM_STATE);
    };

    if (isProductLoading || isUnitsLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-gray-600">
                <Loader2 className="w-8 h-8 mr-2 animate-spin text-emerald-600" />
                <span>{t('messages.loadingData') || 'กำลังโหลดข้อมูล...'}</span>
            </div>
        );
    }

    if (!product) {
        return <div className="p-6 text-center text-red-500">{t('messages.notFound') || 'ไม่พบข้อมูลสินค้า'}</div>;
    }

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || '';
    const displayImageUrl = product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BACKEND_URL}${product.imageUrl}`) : null;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.push('/products')}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('title') || 'ตั้งราคาและรูปแบบการขาย'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle') || 'เพิ่มหรือแก้ไขบาร์โค้ด ราคา และรูปภาพสำหรับขายปลีกหรือขายส่ง'}</p>
                </div>
            </div>

            {/* Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm flex items-start gap-2 text-blue-800">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                <div>
                    <h4 className="font-bold mb-1">{t('banner.title') || 'ความเข้าใจเรื่องตัวคูณ (Multiplier)'}</h4>
                    <p className="text-blue-600">
                        {t('banner.line1') || 'ตัวคูณคือจำนวน "หน่วยหลัก" ที่อยู่ในรูปแบบการขายนี้ เช่น ถ้าน้ำเปล่ามีหน่วยหลักเป็น "ขวด"'} <br />
                        {t('banner.line2') || 'การสร้างรูปแบบการขายเป็น "แพ็ค" จะต้องระบุตัวคูณเป็น 12 (เพื่อให้ระบบตัดสต็อก 12 ขวดเวลาขายแพ็ค)'}
                    </p>
                </div>
            </div>

            {/* Base Product Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">{t('baseProduct.title') || 'รายละเอียดสินค้าหลัก (Base Product)'}</h2>
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                        {displayImageUrl ? (
                            <img src={displayImageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <Package className="w-10 h-10 text-gray-300" />
                        )}
                    </div>

                    <div className="flex flex-col gap-3 flex-1 text-sm">
                        <div>
                            <span className="text-gray-500 w-32 inline-block">{t('baseProduct.name') || 'ชื่อสินค้า:'}</span>
                            <span className="font-medium text-gray-900 text-base">{product.name}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 w-32 inline-block">{t('baseProduct.baseUnit') || 'หน่วยหลัก (ตัดสต็อก):'}</span>
                            <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">{locale === 'th'
                                ? (product.baseUnit?.nameTh || 'หน่วย')
                                : (product.baseUnit?.nameEn || product.baseUnit?.nameTh || 'Unit')}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 w-32 inline-block">{t('baseProduct.avgCost') || 'ต้นทุนเฉลี่ย:'}</span>
                            <span className="font-bold text-orange-600">฿{Number(product.averageCost || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="mb-6 relative">
                {editingId && (
                    <div className="absolute -top-3 left-6 z-10 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 border border-blue-200">
                        <Edit className="w-3 h-3" /> {t('badges.editing') || 'กำลังแก้ไขข้อมูล'}
                    </div>
                )}
                <div className={`transition-all duration-300 rounded-xl ${editingId ? 'border-2 border-blue-200 shadow-md bg-blue-50/30' : ''}`}>
                    <div className="p-1">
                        <DynamicForm<SellingUnitFormState>
                            dataForm={formData}
                            groups={formGroups}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            isSubmitting={isAdding || isUploading || isUpdating}
                            onCancel={editingId ? handleCancelEdit : handleClearForm}
                            submitLabel={editingId ? (t('form.submitEditBtn') || "บันทึกการแก้ไข") : (t('form.submitAddBtn') || "เพิ่มรูปแบบการขาย")}
                        />
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-lg font-bold text-gray-800">
                        {t('list.title') || 'รูปแบบการขายที่ตั้งไว้แล้ว'}
                    </h2>
                    <span className="bg-emerald-100 text-emerald-800 text-xs py-1 px-3 rounded-full font-bold">
                        {product.sellingUnits?.length || 0} {t('list.itemsCount') || 'รายการ'}
                    </span>
                </div>

                {!product.sellingUnits || product.sellingUnits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Tag className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="font-medium">{t('list.emptyTitle') || 'ยังไม่มีรูปแบบการขาย'}</p>
                        <p className="text-sm">{t('list.emptySubtitle') || 'กรุณาเพิ่มข้อมูลจากฟอร์มด้านบน'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(product.sellingUnits as SellingUnitDisplay[]).map((su) => {
                            const costAtSale = Number(product.averageCost) * su.multiplier;
                            const margin = Number(su.price) - costAtSale;
                            const unitName = locale === 'th'
                                ? (su.unit?.nameTh || 'หน่วย')
                                : (su.unit?.nameEn || su.unit?.nameTh || 'Unit');
                            const marginPercent = costAtSale > 0 ? ((margin / Number(su.price)) * 100).toFixed(0) : 100;

                            const suImageUrl = su.imageUrl
                                ? (su.imageUrl.startsWith('http') ? su.imageUrl : `${BACKEND_URL}${su.imageUrl}`)
                                : displayImageUrl;

                            const isEditingThis = editingId === su.id;

                            return (
                                <div key={su.id} className={`border rounded-xl p-4 transition-colors relative ${isEditingThis ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-gray-50 border-gray-200 hover:border-emerald-300'}`}>

                                    {isEditingThis && (
                                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                                            {t('badges.editing') || 'กำลังแก้ไข'}
                                        </div>
                                    )}

                                    {!isEditingThis && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1">
                                            <button
                                                onClick={() => handleEditClick(su)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title={t('tooltips.edit') || "แก้ไข"}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(su)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title={t('tooltips.delete') || "ลบ"}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex gap-4 items-start mb-3 pr-16">
                                        <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                            {suImageUrl ? (
                                                <img src={suImageUrl} alt="Selling Unit" className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-6 h-6 text-gray-300" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg flex items-center">
                                                        {unitName || '-'}
                                                        <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${su.sellType === 'WHOLESALE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                            {su.sellType === 'WHOLESALE' ? (t('badges.wholesale') || 'ขายส่ง') : (t('badges.retail') || 'ขายปลีก')}
                                                        </span>
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center font-medium">
                                                        <Barcode className="w-3 h-3 mr-1" /> {su.barcode}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mb-2">
                                        <div className="text-xs text-gray-500 font-medium">{t('list.cutStock') || 'ตัดสต็อก:'} {su.multiplier}</div>
                                        <div className="text-xl font-bold text-emerald-600">฿{Number(su.price).toFixed(2)}</div>
                                    </div>

                                    <div className="mt-2 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-500">{t('list.totalCost') || 'ต้นทุนรวม:'} </span>
                                            <span className="font-semibold text-gray-700">฿{costAtSale.toFixed(2)}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-gray-500">{t('list.profit') || 'กำไร:'} </span>
                                            <span className={`font-bold ${margin > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                ฿{margin.toFixed(2)} ({marginPercent}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                title={
                    <div className="flex items-center gap-2 text-red-600">
                        <Trash2 className="w-5 h-5" /> {t('modal.title') || 'ยืนยันการลบข้อมูล'}
                    </div>
                }
                maxWidth="sm"
            >
                <div className="text-gray-700 mt-2">
                    {t('modal.desc1') || 'คุณต้องการลบรูปแบบการขาย'} <strong>"{unitToDelete?.unit?.nameTh}"</strong> {t('modal.desc2') || 'ใช่หรือไม่?'}
                    <p className="text-sm text-red-500 mt-3 bg-red-50 p-2 rounded border border-red-100">
                        * {t('modal.warning') || 'การลบข้อมูลนี้จะไม่สามารถเรียกคืนได้'}
                    </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                    >
                        {t('modal.cancelBtn') || 'ยกเลิก'}
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isDeleting ? (t('modal.deletingBtn') || 'กำลังลบ...') : (t('modal.confirmBtn') || 'ยืนยันการลบ')}
                    </button>
                </div>
            </Modal>
        </div>
    );
}