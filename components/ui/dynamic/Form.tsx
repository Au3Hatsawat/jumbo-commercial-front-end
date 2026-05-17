'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type FieldType = 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'image';

export interface FormField {
    name: string; 
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string | number }[];
    accept?: string; 
}

export interface FormGroup {
    title?: string;
    description?: string;
    fields: FormField[];
}

export interface DynamicFormProps<T> {
    dataForm: T;
    groups: FormGroup[];
    onSubmit: (e: React.FormEvent) => void;
    onChange: (name: keyof T, value: any) => void;
    submitLabel?: string;
    isSubmitting?: boolean;
    onCancel?: () => void;
}

const ImagePreview = ({ fileOrUrl }: { fileOrUrl: File | string | null | undefined }) => {
    const t = useTranslations('Common.form');

    useEffect(() => {
        if (!fileOrUrl) return;
        if (typeof fileOrUrl === 'string') return;

        const objectUrl = URL.createObjectURL(fileOrUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [fileOrUrl]);

    if (!fileOrUrl) return null;

    const previewUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);

    return (
        <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex justify-center items-center">
            <img src={previewUrl} alt={t('imagePreview') || 'Preview'} className="max-w-full max-h-full object-contain" />
        </div>
    );
};

export function DynamicForm<T extends Record<string, any>>({
    dataForm,
    groups,
    onSubmit,
    onChange,
    submitLabel,
    isSubmitting = false,
    onCancel
}: DynamicFormProps<T>) {
    const t = useTranslations('Common.form');

    const handleChange = (field: FormField, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (field.type === 'image') {
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files?.[0] || null;
            onChange(field.name as keyof T, file);
            return;
        }

        let value: any = e.target.value;
        if (field.type === 'number') {
            value = value === '' ? '' : Number(value);
        }
        
        onChange(field.name as keyof T, value);
    };

    const baseInputClass = "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed";

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {groups.map((group, groupIndex) => (
                <div key={groupIndex} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    {(group.title || group.description) && (
                        <div className="mb-4 border-b border-gray-100 pb-3">
                            {group.title && <h3 className="text-lg font-semibold text-gray-800">{group.title}</h3>}
                            {group.description && <p className="text-sm text-gray-500 mt-1">{group.description}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.fields.map((field) => (
                            <div key={field.name} className={`flex flex-col space-y-1.5 ${['textarea', 'image'].includes(field.type) ? 'md:col-span-2' : ''}`}>
                                <label className="text-sm font-medium text-gray-700 flex items-center">
                                    {field.type === 'image' && <ImageIcon className="w-4 h-4 mr-1.5 text-gray-400" />}
                                    {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>

                                {field.type === 'textarea' ? (
                                    <textarea
                                        value={dataForm[field.name] || ''}
                                        onChange={(e) => handleChange(field, e)}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        rows={3}
                                        disabled={isSubmitting}
                                        className={baseInputClass}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        value={dataForm[field.name] || ''}
                                        onChange={(e) => handleChange(field, e)}
                                        required={field.required}
                                        disabled={isSubmitting}
                                        className={baseInputClass}
                                    >
                                        <option value="" disabled>{t('selectPrefix')}{field.label}</option>
                                        {field.options?.map((opt, i) => (
                                            <option key={i} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'image' ? (
                                    <div className="w-full">
                                        <input
                                            type="file"
                                            accept={field.accept || "image/*"}
                                            onChange={(e) => handleChange(field, e as React.ChangeEvent<HTMLInputElement>)}
                                            required={field.required && !dataForm[field.name]} 
                                            disabled={isSubmitting}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all border border-gray-200 rounded-lg cursor-pointer"
                                        />
                                        <ImagePreview fileOrUrl={dataForm[field.name]} />
                                    </div>
                                ) : (
                                    <input
                                        type={field.type}
                                        value={dataForm[field.name] ?? ''}
                                        onChange={(e) => handleChange(field, e)}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        disabled={isSubmitting}
                                        className={baseInputClass}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-end items-center gap-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSubmitting ? t('processing') : (submitLabel || t('save'))}
                </button>
            </div>
        </form>
    );
}