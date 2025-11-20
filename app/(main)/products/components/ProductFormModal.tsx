'use client';

import React, { useState, useCallback, useMemo } from 'react';
// 1. เพิ่ม RotateCcw เข้ามา
import { X, Save, Package, Loader2, RotateCcw } from 'lucide-react';
import useToastStore from '@/libs/store/alertStore'; 

import { Product, ProductCreatePayload, ProductUpdatePayload } from '@/libs/types/product'; 
import { useCreateProduct, useUpdateProduct } from '@/libs/hooks/useProducts'; 
import { useCategories } from '@/libs/hooks/useCategory';
import { useUnits } from '@/libs/hooks/useUnit';
import { Button, Input, Select, Textarea } from '@/components/ui/Input';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    productToEdit?: Product | null; 
}

interface FormState {
    barcode: string;
    name: string;
    description: string | null;
    sellingPrice: string; 
    categoryId: number | ''; 
    unitId: number | '';     
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ 
    isOpen, 
    onClose, 
    productToEdit 
}) => {
    const showToast = useToastStore(state => state.showToast);

    const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
    const { data: units = [], isLoading: isLoadingUnits } = useUnits();
    
    const initialFormData = useMemo<FormState>(() => ({
        barcode: productToEdit?.barcode || '',
        name: productToEdit?.name || '',
        description: productToEdit?.description || null, 
        sellingPrice: productToEdit?.sellingPrice?.toString() || '', 
        categoryId: productToEdit?.categoryId || (categories.length > 0 ? categories[0].id : ''), 
        unitId: productToEdit?.unitId || (units.length > 0 ? units[0].id : ''), 
    }), [productToEdit, categories, units]);
    
    const [formData, setFormData] = useState<FormState>(initialFormData);
    
    if (!productToEdit) {
        if (formData.categoryId === '' && initialFormData.categoryId !== '') {
            setFormData(initialFormData);
        }
        if (formData.unitId === '' && initialFormData.unitId !== '') {
            setFormData(prev => ({ ...prev, unitId: initialFormData.unitId }));
        }
    }
    
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    
    const isEditing = !!productToEdit;
    const isPending = createMutation.isPending || updateMutation.isPending;
    const isLoadingMasterData = isLoadingCategories || isLoadingUnits;

    const handleClose = useCallback(() => {
        if (!isPending) {
            onClose();
        }
    }, [onClose, isPending]);

    // 2. เพิ่มฟังก์ชัน Reset ค่า
    const handleReset = () => {
        setFormData(initialFormData);
        showToast('คืนค่าข้อมูลเรียบร้อย', 'info');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'categoryId' || name === 'unitId') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.sellingPrice || !formData.barcode || !formData.categoryId || !formData.unitId) {
            showToast("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", 'error');
            return;
        }
        if (Number(formData.sellingPrice) <= 0) {
            showToast("ราคาขายต้องมากกว่าศูนย์", 'error');
            return;
        }
        
        const basePayload: Omit<ProductCreatePayload, 'averageCost' | 'currentStock'> = {
            barcode: formData.barcode,
            name: formData.name,
            sellingPrice: Number(formData.sellingPrice),
            description: formData.description || undefined,
            categoryId: Number(formData.categoryId), 
            unitId: Number(formData.unitId),
            imageUrl: undefined, 
        };

        if (isEditing && productToEdit) {
            const updatePayload: ProductUpdatePayload = {
                id: productToEdit.id,
                ...basePayload,
            };

            updateMutation.mutate(updatePayload, {
                onSuccess: () => {
                    showToast('แก้ไขข้อมูลสินค้าสำเร็จ!', 'success');
                    handleClose();
                },
                onError: (err) => showToast(`แก้ไขล้มเหลว: ${err.message}`, 'error'),
            });
        } else {
            const createPayload: ProductCreatePayload = {
                ...basePayload,
            };
            
            createMutation.mutate(createPayload, { 
                onSuccess: () => {
                    showToast('เพิ่มสินค้าใหม่สำเร็จ!', 'success');
                    handleClose();
                },
                onError: (err) => showToast(`เพิ่มล้มเหลว: ${err.message}`, 'error'),
            });
        }
    };

    if (!isOpen) return null;

    if (isLoadingMasterData) {
        return (
             <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                 <Loader2 className="w-8 h-8 text-white animate-spin" />
             </div>
        );
    }

    const displayUnitName = isEditing 
        ? productToEdit?.unit?.nameTh || units.find(u => u.id === productToEdit?.unitId)?.nameTh || 'หน่วย'
        : units.find(u => u.id === formData.unitId)?.nameTh || 'หน่วย';


    return (
        <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" 
            onClick={handleClose}
        >
            <div 
                className="bg-white rounded-xl w-full max-w-2xl shadow-xl overflow-hidden transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-blue-600" />
                            {isEditing ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-0.5">{isEditing ? productToEdit?.name : 'กำหนดรายละเอียดสินค้าพื้นฐาน'}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isPending}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Basic Info */}
                    <Input 
                        label="ชื่อสินค้า (Name) *" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="เช่น น้ำเปล่า 600ml ขวดเดี่ยว"
                        required 
                    />
                    
                    {/* Barcode & Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="บาร์โค้ด (Barcode) *" 
                            name="barcode" 
                            value={formData.barcode} 
                            onChange={handleChange} 
                            placeholder="ใส่เลขบาร์โค้ด 13 หลัก"
                            required 
                        />
                        <Input 
                            label="ราคาขาย (Selling Price) *" 
                            name="sellingPrice" 
                            type="number" 
                            step="0.01"
                            value={formData.sellingPrice} 
                            onChange={handleChange} 
                            placeholder="0.00"
                            required 
                            helperText="ราคาที่จะใช้ขายหน้าร้าน"
                        />
                    </div>
                    
                    {/* Category & Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="หมวดหมู่ (Category) *" 
                            name="categoryId" 
                            value={formData.categoryId} 
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>--- เลือกหมวดหมู่ ---</option> 
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nameTh}
                                </option>
                            ))}
                        </Select>
                        <Select
                            label="หน่วยนับ (Unit) *" 
                            name="unitId" 
                            value={formData.unitId} 
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>--- เลือกหน่วยนับ ---</option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.nameTh}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Description */}
                    <Textarea
                        label="รายละเอียด (Description)"
                        name="description"
                        rows={3}
                        value={formData.description || ''}
                        onChange={handleChange}
                        placeholder="รายละเอียดสินค้าเพิ่มเติม..."
                    />

                    {/* Stock Info Display (Read-only) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mt-4">
                        <h4 className="font-bold text-gray-700 mb-2">ข้อมูลสต็อก (อ่านอย่างเดียว)</h4>
                        <div className="flex justify-between">
                            <span className="text-gray-600">สต็อกปัจจุบัน:</span>
                            <span className="font-semibold text-blue-600">
                                {isEditing ? `${productToEdit?.currentStock} ${productToEdit?.unit?.nameTh || displayUnitName}` : `0 (${displayUnitName})`}
                            </span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-gray-600">ต้นทุนเฉลี่ย:</span>
                            <span className="font-semibold text-gray-700">{isEditing ? `฿${parseFloat(productToEdit?.averageCost?.toString() || '0').toFixed(2)}` : '฿0.00 (เริ่มต้น)'}</span>
                        </div>
                        {!isEditing && <p className="text-xs text-gray-500 mt-2 italic">เมื่อสร้างสินค้าสำเร็จแล้ว กรุณาใช้ปุ่ม **Restock** เพื่อเพิ่มสต็อกและคำนวณต้นทุนเฉลี่ย</p>}
                    </div>


                    {/* Footer Buttons - ปรับ Layout ให้มีปุ่มล้างค่าทางซ้าย */}
                    <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
                        {/* ปุ่มล้างค่า (อยู่ซ้ายสุด) */}
                        <Button 
                            variant="ghost" 
                            type="button" 
                            onClick={handleReset}
                            disabled={isPending}
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {isEditing ? 'คืนค่าเดิม' : 'ล้างค่า'}
                        </Button>

                        {/* ปุ่ม Action หลัก (อยู่ขวาสุด) */}
                        <div className="flex space-x-3">
                            <Button 
                                variant="outline" 
                                onClick={handleClose} 
                                type="button"
                                disabled={isPending}
                            >
                                ยกเลิก
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isPending || isLoadingMasterData}
                                className="min-w-[140px]"
                            >
                                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังบันทึก...</> : isEditing ? <><Save className="w-4 h-4 mr-2" /> บันทึกการแก้ไข</> : <><Save className="w-4 h-4 mr-2" /> เพิ่มสินค้า</>}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};