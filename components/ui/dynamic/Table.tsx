'use client';

import { ChevronLeft, ChevronRight, GlassesIcon, LucideProps } from "lucide-react";
import { useTranslations } from "next-intl";
import { FC, ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";

export interface PaginationConfigs {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export interface ColumnConfigs {
    icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    func?: () => void;
    name: string;
    accessor: string;
    container?: FC<{ children: ReactNode }>;
}

interface TableProps<T> {
    columns: ColumnConfigs[];
    datas: T[];
    pagination?: PaginationConfigs;
}

const Table = <T,>({ columns, datas, pagination }: TableProps<T>) => {
    const t = useTranslations('Common.table');
    
    const startIndex = pagination ? (pagination.currentPage - 1) * pagination.itemsPerPage : 0;
    const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.itemsPerPage) : 1;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow overflow-hidden flex flex-col w-full h-full">
            
            <div className="flex-1 overflow-auto custom-scrollbar min-h-0">
                {
                    datas.length === 0 ? 
                    (
                    <div className="flex flex-col items-center justify-center py-16 text-center h-full min-h-[200px]">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <GlassesIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-semibold text-lg">{t('emptyTitle') || 'ไม่พบข้อมูล'}</p>
                        <p className="text-gray-400 text-sm mt-1">{t('emptyDesc') || 'ยังไม่มีรายการในขณะนี้'}</p>
                    </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 relative">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-linear-to-r from-emerald-50 to-teal-50 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                    {
                                        columns.map((column, index) => (
                                            <th key={index} className="px-4 md:px-6 py-3.5 md:py-4 text-left whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    {
                                                        column.icon ? (<div>
                                                            <column.icon className="w-4 h-4 text-emerald-600" />
                                                        </div>) : (<></>)
                                                    }
                                                    {column.name}
                                                </div>
                                            </th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {
                                    datas.map((data, rowIndex) => (
                                        <tr key={rowIndex} className="hover:bg-emerald-50/50 transition-colors group">
                                            {columns.map((col, colIndex) => {
                                                const cellData = String(data[col.accessor as keyof T]);

                                                return (
                                                    <td key={colIndex} className="px-4 md:px-6 py-3 md:py-4 align-middle">
                                                        {col.container ? (
                                                            <col.container>
                                                                {cellData}
                                                            </col.container>
                                                        ) : (
                                                            <div className="whitespace-nowrap text-sm text-gray-700">
                                                                {cellData}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    )
                }
            </div>

            {pagination && pagination.totalItems > 0 && (
                <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="text-sm text-gray-600 text-center md:text-left">
                        {t('showing')} <span className="font-semibold text-emerald-600">{startIndex + 1}</span> {t('to')}{' '}
                        <span className="font-semibold text-emerald-600">
                            {Math.min(startIndex + pagination.itemsPerPage, pagination.totalItems)}
                        </span>{' '}
                        {t('from')} <span className="font-semibold text-gray-900">{pagination.totalItems}</span> {t('records')}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                                {pagination.currentPage} / {totalPages}
                            </div>
                            <button
                                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Table;