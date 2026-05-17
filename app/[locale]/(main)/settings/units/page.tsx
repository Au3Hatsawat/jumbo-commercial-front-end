'use client';

import { useUnits, UseDeleteUnit } from "@/libs/hooks/useUnit"; 
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "@/routing";
import { useTranslations } from "next-intl";

import Table from "@/components/ui/dynamic/Table";
import Modal from "@/components/ui/dynamic/Modal";
import Filter from "@/components/ui/dynamic/Filter";
import useToastStore from "@/libs/store/alertStore"; 

import { 
    UnitTableRow, 
    formatUnitTableData, 
    getTableColumns,
    getOperationActions
} from "./configs";

export default function UnitsPage() {
    const router = useRouter();
    const showToast = useToastStore((state) => state.showToast);
    const t = useTranslations('units');

    const { data: units = [], isLoading: isLoadingUnits } = useUnits();
    const { mutateAsync: deleteUnit, isPending: isDeleting } = UseDeleteUnit(); 

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingUnitId, setDeletingUnitId] = useState<number | null>(null);

    const filteredUnits = useMemo(() => {
        if (!units) return [];
        return units.filter(unit =>
            (unit.nameTh?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (unit.nameEn?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        );
    }, [units, searchQuery]);

    const tableData = useMemo(() => formatUnitTableData(filteredUnits), [filteredUnits]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return tableData.slice(startIndex, startIndex + itemsPerPage);
    }, [tableData, currentPage, itemsPerPage]);

    // --- Handlers ---
    const handleEditUnit = (id: number) => router.push(`/settings/units/edit/${id}`);
    const handleCreateUnit = () => router.push('/settings/units/create');
    const handleDeleteClick = (id: number) => {
        setDeletingUnitId(id);
        setIsDeleteModalOpen(true);
    };

    // 🚀 ดึง Configs
    const columns = useMemo(() => getTableColumns(handleEditUnit, handleDeleteClick, t), [t]);
    const operationActions = useMemo(() => getOperationActions(handleCreateUnit, t), [t]);

    const handleConfirmDelete = async () => {
        if (deletingUnitId === null) return;
        
        try {
            await deleteUnit({ id: deletingUnitId });
            showToast(t('messages.deleteSuccess') || "ลบข้อมูลหน่วยนับสำเร็จ", "success");
            setIsDeleteModalOpen(false);
            setDeletingUnitId(null);
            
            if (paginatedData.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง';
            showToast(`${t('messages.deleteError') || 'ไม่สามารถลบข้อมูลได้:'} ${msg}`, "error");
        }
    };

    if (isLoadingUnits) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-lg text-gray-600">
                <Loader2 className="animate-spin mr-2 w-6 h-6 text-emerald-600" />
                <span>{t('messages.loading') || 'กำลังโหลดข้อมูลหน่วยนับ...'}</span>
            </div>
        );
    }

    return (
        <div className="p-0">
            {/* Filter & Actions */}
            <Filter 
                showSearch={true}
                searchQuery={searchQuery}
                onSearchChange={(val) => {
                    setSearchQuery(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder={t('searchPlaceholder') || "ค้นหาชื่อหน่วยนับ (ไทย หรือ อังกฤษ)..."}
                actions={operationActions}
            />

            {/* Table Area */}
            <Table<UnitTableRow>
                columns={columns}
                datas={paginatedData} 
                pagination={{
                    currentPage: currentPage,
                    itemsPerPage: itemsPerPage,
                    totalItems: filteredUnits.length,
                    onPageChange: (newPage) => setCurrentPage(newPage)
                }}
            />

            {/* Modal ยืนยันการลบ */}
            <Modal 
                isOpen={isDeleteModalOpen} 
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                title={t('modal.title') || "ยืนยันการลบข้อมูล"}
                maxWidth="sm"
            >
                <div className="mb-6">
                    <p className="text-gray-600">{t('modal.desc') || 'คุณแน่ใจหรือไม่ว่าต้องการลบหน่วยนับนี้? ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้'}</p>
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