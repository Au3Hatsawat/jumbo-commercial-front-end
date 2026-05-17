import { ActionButton } from "@/components/ui/dynamic/Operation";
import { ColumnConfigs } from "@/components/ui/dynamic/Table";
import { Unit } from "@/libs/types/unit";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

export type TranslationFunction = ReturnType<typeof useTranslations<'units'>>;

export type UnitTableRow = {
    nameTh: string;
    nameEn: string;
    manage: string;
};

// --- 1. Table Data Formatter ---
export const formatUnitTableData = (units: Unit[]): UnitTableRow[] => {
    return units.map(unit => ({
        nameTh: unit.nameTh || '-',
        nameEn: unit.nameEn || '-',
        manage: String(unit.id) 
    }));
};

// --- 2. Table Columns Configs ---
export const getTableColumns = (
    handleEdit: (id: number) => void,
    handleDeleteClick: (id: number) => void,
    t: TranslationFunction
): ColumnConfigs[] => [
    { 
        name: t('table.nameTh') || 'ชื่อหน่วยนับ (TH)', 
        accessor: 'nameTh' 
    },
    { 
        name: t('table.nameEn') || 'ชื่อหน่วยนับ (EN)', 
        accessor: 'nameEn' 
    },
    {
        name: t('table.manage') || 'จัดการ',
        accessor: 'manage',
        container: ({ children }) => {
            const unitId = Number(children); 
            return (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(unitId)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('tooltips.edit') || "แก้ไข"}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(unitId)}
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
        label: t('actions.addUnit') || 'เพิ่มหน่วยนับ',
        icon: <Plus className="w-5 h-5" />,
        onClick: handleCreate,
        className: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
];