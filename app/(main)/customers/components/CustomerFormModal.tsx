'use client';

import React, { useState, useCallback } from 'react';
import { X, Save, User, Loader2 } from 'lucide-react';
import useToastStore from '@/libs/store/alertStore';
import { Button, Input } from '@/components/ui/Input';
import { useCreateCustomer, useUpdateCustomer } from '@/libs/hooks/useCustomer';
import { Customer } from '@/libs/types/customer';
import { getErrorMessage } from '@/utils/errorMapping';

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerToEdit?: Customer | null;
}

interface CustomerFormState {
    name: string;
    phoneNumber: string;
}

// ----------------------------------------------------------------------
// 1. Wrapper Component (ตัวครอบ): ทำหน้าที่แค่จัดการ Key เพื่อ Reset Form
// ----------------------------------------------------------------------
export const CustomerFormModal: React.FC<CustomerFormModalProps> = (props) => {
    if (!props.isOpen) return null;

    return (
        <CustomerFormContent
            key={props.customerToEdit?.id || 'create-new'}
            {...props}
        />
    );
};

const CustomerFormContent: React.FC<CustomerFormModalProps> = ({
    onClose,
    customerToEdit
}) => {
    const showToast = useToastStore(state => state.showToast);

    const [formData, setFormData] = useState<CustomerFormState>({
        name: customerToEdit?.name || '',
        phoneNumber: customerToEdit?.phoneNumber || '',
    });

    const createMutation = useCreateCustomer();
    const updateMutation = useUpdateCustomer();

    const isEditing = !!customerToEdit;
    const isPending = createMutation.isPending || updateMutation.isPending;

    const handleClose = useCallback(() => {
        if (!isPending) {
            onClose();
        }
    }, [onClose, isPending]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.phoneNumber) {
            showToast("กรุณากรอกเบอร์โทรศัพท์", 'error');
            return;
        }

        const payload = {
            name: formData.name || undefined,
            phoneNumber: formData.phoneNumber,
        };

        if (isEditing && customerToEdit) {
            updateMutation.mutate({ id: customerToEdit.id, ...payload }, {
                onSuccess: () => {
                    showToast('แก้ไขข้อมูลลูกค้าสำเร็จ!', 'success');
                    handleClose();
                },
                onError: (err) => {
                    const message = getErrorMessage(err);
                    showToast(`แก้ไขล้มเหลว: ${message}`, 'error')
                },
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    showToast('เพิ่มลูกค้าใหม่สำเร็จ!', 'success');
                    handleClose();
                },
                onError: (err) => {
                    const message = getErrorMessage(err);
                    showToast(`เพิ่มล้มเหลว: ${message}`, 'error')
                },
            });
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-linear-to-r from-green-50 to-emerald-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <User className="w-5 h-5 mr-2 text-green-600" />
                            {isEditing ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-0.5">
                            {isEditing ? `สมาชิก: ${customerToEdit?.phoneNumber}` : 'ลงทะเบียนสมาชิกใหม่'}
                        </p>
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
                    <Input
                        label="เบอร์โทรศัพท์ (Phone Number) *"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="08x-xxx-xxxx"
                        required
                    />

                    <Input
                        label="ชื่อลูกค้า (Name)"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="ชื่อ-นามสกุล หรือ ชื่อเล่น"
                    />

                    {isEditing && customerToEdit && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm mt-4">
                            <h4 className="font-bold text-orange-800 mb-2 flex items-center">
                                ข้อมูลสมาชิก (อ่านอย่างเดียว)
                            </h4>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">แต้มสะสมปัจจุบัน:</span>
                                <span className="text-xl font-bold text-orange-600">
                                    {customerToEdit.points.toLocaleString()} แต้ม
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-6 mt-2 border-t border-gray-200">
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
                            disabled={isPending}
                            className="min-w-[140px] bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isPending ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังบันทึก...</>
                            ) : isEditing ? (
                                <><Save className="w-4 h-4 mr-2" /> บันทึกการแก้ไข</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> เพิ่มลูกค้า</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};