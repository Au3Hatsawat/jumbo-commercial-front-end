import { Product } from "@/libs/types/product";
import { DollarSign, Edit, Layers, Package, TrendingUp } from "lucide-react";

interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onAdjustStock: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
    products,
    onEdit,
    onAdjustStock,
}) => {
    const calculateMargin = (sellingPrice: number, averageCost: number) => {
        const margin = ((sellingPrice - averageCost) / sellingPrice) * 100;
        return margin.toFixed(1);
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: 'หมดสต็อก', color: 'bg-red-100 text-red-700 border-red-200' };
        if (stock <= 5) return { label: 'เหลือน้อย', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        return { label: 'ปกติ', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    };

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Package className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-semibold text-lg">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
                <p className="text-gray-400 text-sm mt-1">ลองปรับเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
            </div>
        );
    }

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead>
                <tr className="bg-linear-to-r from-emerald-50 to-teal-50">
                    <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <Package className="w-4 h-4 text-emerald-600" />
                            สินค้า
                        </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <Layers className="w-4 h-4 text-emerald-600" />
                            หมวดหมู่
                        </div>
                    </th>
                    <th className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            ราคา & ต้นทุน
                        </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            กำไร
                        </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            สต็อก
                        </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            การจัดการ
                        </div>
                    </th>
                </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => {
                    const sellingPrice = parseFloat(product.sellingPrice.toString());
                    const averageCost = parseFloat(product.averageCost.toString());
                    const stockStatus = getStockStatus(product.currentStock);
                    const margin = calculateMargin(sellingPrice, averageCost);
                    const profit = sellingPrice - averageCost;

                    return (
                        <tr key={product.id} className="hover:bg-emerald-50/30 transition-colors group">
                            {/* สินค้า */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                                        <Package className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm text-gray-900 truncate">
                                            {product.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5 font-mono">
                                            {product.barcode}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* หมวดหมู่ */}
                            <td className="px-6 py-4">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">
                                        {product.category.nameTh}
                                    </span>
                                </div>
                            </td>

                            {/* ราคา & ต้นทุน */}
                            <td className="px-6 py-4">
                                <div className="text-right space-y-1">
                                    <div className="flex items-center justify-end gap-2">
                                        <span className="text-xs text-gray-500">ขาย:</span>
                                        <span className="text-base font-bold text-emerald-600">
                                            ฿{sellingPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                        <span className="text-xs text-gray-500">ทุน:</span>
                                        <span className="text-sm text-gray-600">
                                            ฿{averageCost.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </td>

                            {/* กำไร */}
                            <td className="px-6 py-4">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="text-sm font-bold text-emerald-600">
                                        +฿{profit.toFixed(2)}
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                        parseFloat(margin) >= 30 ? 'bg-emerald-100 text-emerald-700' :
                                        parseFloat(margin) >= 20 ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {margin}%
                                    </div>
                                </div>
                            </td>

                            {/* สต็อก */}
                            <td className="px-6 py-4">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className={`px-3 py-1.5 rounded-lg border text-center ${stockStatus.color}`}>
                                        <div className="text-lg font-bold">{product.currentStock}</div>
                                        <div className="text-xs">{product.unit.nameTh}</div>
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">
                                        {stockStatus.label}
                                    </div>
                                </div>
                            </td>

                            {/* การจัดการ */}
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => onAdjustStock(product)}
                                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                                    >
                                        ปรับสต็อก
                                    </button>
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default ProductTable;