import { Product } from "@/libs/types/product";
import { Package } from "lucide-react";

interface ProductCardProps {
    product: Product;
    handleProductSelect: (product: Product) => void;
}

const ProductCard = ({ product, handleProductSelect }: ProductCardProps) => {
    const getMockImage = (productName: string) => {
        const colors = [
            'from-rose-400/20 to-pink-400/20',
            'from-blue-400/20 to-cyan-400/20',
            'from-emerald-400/20 to-teal-400/20',
            'from-purple-400/20 to-violet-400/20',
            'from-amber-400/20 to-orange-400/20',
            'from-indigo-400/20 to-blue-400/20',
            'from-pink-400/20 to-rose-400/20',
            'from-teal-400/20 to-emerald-400/20',
        ];
        const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <button
            key={product.id}
            className={`
                      group bg-white rounded-xl border border-gray-200 overflow-hidden text-left
                      transition-all duration-200
                      ${product.currentStock <= 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:shadow-lg hover:border-emerald-300 hover:-translate-y-0.5'
                }
                    `}
            onClick={() => handleProductSelect(product as Product)}
            disabled={product.currentStock <= 0}
        >
            {/* Image */}
            <div className={`h-32 bg-linear-to-br ${getMockImage(product.name)} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-300" />
                </div>
                {/* Stock Badge */}
                <div className="absolute top-2 right-2">
                    {product.currentStock <= 5 ? (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-md">
                            เหลือ {product.currentStock}
                        </span>
                    ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-md">
                            {product.currentStock}
                        </span>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-3.5">
                <p className="font-semibold text-sm text-gray-900 truncate mb-1">
                    {product.name}
                </p>
                <p className="text-xs text-gray-500 mb-2">{product.unitType}</p>
                <p className="text-xl font-bold text-emerald-600">
                    ฿{parseFloat(product.sellingPrice.toString()).toFixed(2)}
                </p>
            </div>
        </button>
    )
}

export default ProductCard;