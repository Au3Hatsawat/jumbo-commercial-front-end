'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import Operation, { ActionButton } from './Operation';
import { useTranslations } from 'next-intl';

export interface FilterOption {
    label: string;
    value: string | number;
}

export interface FilterConfig {
    id: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
}

interface FilterProps {
    showSearch?: boolean; 
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    filters?: FilterConfig[];
    onClearFilters?: () => void;
    hasActiveFilters?: boolean;
    actions?: ActionButton[]; 
}

export const Filter: React.FC<FilterProps> = ({
    showSearch = true,
    searchQuery = '',
    onSearchChange,
    searchPlaceholder,
    filters = [],
    onClearFilters,
    hasActiveFilters = false,
    actions = [],
}) => {
    const t = useTranslations('Common');
    searchPlaceholder = searchPlaceholder || t('searchPlaceholder');
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 shrink-0">
            {/* --- Search Bar --- */}
            {showSearch && (
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className="w-full pl-12 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange?.('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>
            )}

            {/* --- Toolbar: Filters (Left) & Operations (Right) --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Left Side: Dynamic Dropdown Filters */}
                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                    {filters.map((filter) => (
                        <select
                            key={filter.id}
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            className="flex-1 md:flex-none px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none min-w-[140px]"
                        >
                            {filter.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ))}

                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
                            className="px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg whitespace-nowrap"
                        >
                            {t('clear')}
                        </button>
                    )}
                </div>

                {actions.length > 0 && (
                    <div className="w-full md:w-auto flex justify-end">
                        <Operation actions={actions} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Filter;