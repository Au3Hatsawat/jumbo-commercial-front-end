'use client';

import { useCategories, useDeleteCategory } from "@/libs/hooks/useCategory"; 
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "@/routing";
import { useTranslations } from "next-intl";

import Table from "@/components/ui/dynamic/Table";
import Modal from "@/components/ui/dynamic/Modal";
import Filter from "@/components/ui/dynamic/Filter";
import useToastStore from "@/libs/store/alertStore";

import { 
    CategoryTableRow, 
    formatCategoryTableData, 
    getTableColumns,
    getOperationActions
} from "./configs";

export default function CategoriesPage() {
    const router = useRouter();
    const showToast = useToastStore((state) => state.showToast);
    const t = useTranslations('categories');

    const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
    const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory();

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        return categories.filter(category =>
            (category.nameTh?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (category.nameEn?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    const tableData = useMemo(() => formatCategoryTableData(filteredCategories), [filteredCategories]);
    
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return tableData.slice(startIndex, startIndex + itemsPerPage);
    }, [tableData, currentPage, itemsPerPage]);

    const handleEditCategory = (id: number) => router.push(`/settings/categories/edit/${id}`);
    const handleCreateCategory = () => router.push('/settings/categories/create');
    const handleDeleteClick = (id: number) => {
        setDeletingCategoryId(id);
        setIsDeleteModalOpen(true);
    };

    const columns = useMemo(() => getTableColumns(handleEditCategory, handleDeleteClick, t), [t]);
    const operationActions = useMemo(() => getOperationActions(handleCreateCategory, t), [t]);

    const handleConfirmDelete = async () => {
        if (deletingCategoryId === null) return;
        
        try {
            await deleteCategory({ id: deletingCategoryId });
            showToast(t('messages.deleteSuccess') || "ลบข้อมูลหมวดหมู่สำเร็จ", "success");
            setIsDeleteModalOpen(false);
            setDeletingCategoryId(null);
            
            if (paginatedData.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง';
            showToast(`${t('messages.deleteError') || 'ไม่สามารถลบข้อมูลได้:'} ${msg}`, "error");
        }
    };

    if (isLoadingCategories) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-lg text-gray-600">
                <Loader2 className="animate-spin mr-2 w-6 h-6 text-emerald-600" />
                <span>{t('messages.loading') || 'กำลังโหลดข้อมูลหมวดหมู่...'}</span>
            </div>
        );
    }

    return (
        <div className="p-0">
            <Filter 
                showSearch={true}
                searchQuery={searchQuery}
                onSearchChange={(val) => {
                    setSearchQuery(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder={t('searchPlaceholder') || "ค้นหาชื่อหมวดหมู่ (ไทย หรือ อังกฤษ)..."}
                actions={operationActions}
            />

            <Table<CategoryTableRow>
                columns={columns}
                datas={paginatedData} 
                pagination={{
                    currentPage: currentPage,
                    itemsPerPage: itemsPerPage,
                    totalItems: filteredCategories.length,
                    onPageChange: (newPage) => setCurrentPage(newPage)
                }}
            />

            <Modal 
                isOpen={isDeleteModalOpen} 
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                title={t('modal.title') || "ยืนยันการลบข้อมูล"}
                maxWidth="sm"
            >
                <div className="mb-6">
                    <p className="text-gray-600">{t('modal.desc') || 'คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้? ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้'}</p>
                </div>
                
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setIsDeleteModalOpen(false)} 
                        disabled={isDeleting}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {t('modal.cancelBtn') || 'ยกเลิก'}
                    </button>
                    <button 
                        onClick={handleConfirmDelete} 
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center disabled:opacity-50"
                    >
                        {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isDeleting ? (t('modal.deletingBtn') || 'กำลังลบ...') : (t('modal.confirmBtn') || 'ยืนยันการลบ')}
                    </button>
                </div>
            </Modal>
        </div>
    )
}