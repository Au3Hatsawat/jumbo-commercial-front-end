import { ActionButton } from "@/components/ui/dynamic/Operation";
import { ColumnConfigs } from "@/components/ui/dynamic/Table";
import { Category } from "@/libs/types/category";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

export type TranslationFunction = ReturnType<typeof useTranslations<'categories'>>;

export type CategoryTableRow = {
    nameTh: string;
    nameEn: string;
    manage: string;
};

export const formatCategoryTableData = (categories: Category[]): CategoryTableRow[] => {
    return categories.map(category => ({
        nameTh: category.nameTh || '-',
        nameEn: category.nameEn || '-',
        manage: String(category.id) 
    }));
};

export const getTableColumns = (
    handleEdit: (id: number) => void,
    handleDeleteClick: (id: number) => void,
    t: TranslationFunction
): ColumnConfigs[] => [
    { 
        name: t('table.nameTh') || 'ชื่อหมวดหมู่ (TH)', 
        accessor: 'nameTh' 
    },
    { 
        name: t('table.nameEn') || 'ชื่อหมวดหมู่ (EN)', 
        accessor: 'nameEn' 
    },
    {
        name: t('table.manage') || 'จัดการ',
        accessor: 'manage',
        container: ({ children }) => {
            const categoryId = Number(children); 
            return (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(categoryId)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('tooltips.edit') || "แก้ไข"}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(categoryId)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('tooltips.delete') || "ลบ"}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            );
        }
    }
];

export const getOperationActions = (
    handleCreate: () => void, 
    t: TranslationFunction
): ActionButton[] => [
    {
        label: t('actions.addCategory') || 'เพิ่มหมวดหมู่',
        icon: <Plus className="w-5 h-5" />,
        onClick: handleCreate,
        className: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
];