'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Loader2, Plus, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '@/libs/hooks/useProducts';
import { Product } from '@/libs/types/product';
import { ProductFormModal } from '@/app/(main)/products/components/ProductFormModal';
import { StockAdjustmentModal } from '@/app/(main)/products/components/StockAdjustmentModal';
import { Button } from '@/components/ui/Input';
import { ProductStats } from '@/app/(main)/products/components/StatCard';
import ProductTable from './components/ProductTable';

type ProductDisplayType = Product;

export default function ProductsPage() {
    const { data: products, isLoading, error } = useProducts();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<ProductDisplayType | null>(null);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [productForStock, setProductForStock] = useState<ProductDisplayType | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock'>('all');
    const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const categories = useMemo(() => {
        if (!products) return [];
        const uniqueCategories = [...new Set(products.map(p => p.category.nameTh || 'อื่นๆ'))];
        return uniqueCategories;
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter((product: ProductDisplayType) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.barcode.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' ||
                (product.category.nameTh || 'อื่นๆ') === selectedCategory;
            const price = parseFloat(product.sellingPrice.toString());
            const matchesStock = stockFilter === 'all' ||
                (stockFilter === 'in-stock' && product.currentStock > 5) ||
                (stockFilter === 'low-stock' && product.currentStock <= 5 && product.currentStock > 0);
            const matchesPrice = priceRange === 'all' ||
                (priceRange === 'low' && price < 50) ||
                (priceRange === 'medium' && price >= 50 && price <= 200) ||
                (priceRange === 'high' && price > 200);
            return matchesSearch && matchesCategory && matchesStock && matchesPrice;
        }).sort((a, b) => a.currentStock - b.currentStock);
    }, [products, searchQuery, selectedCategory, stockFilter, priceRange]);

    useEffect(() => {
        (() => setCurrentPage(1))();
    }, [searchQuery, selectedCategory, stockFilter, priceRange]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setStockFilter('all');
        setPriceRange('all');
    };
    const hasActiveFilters = searchQuery || selectedCategory !== 'all' || stockFilter !== 'all' || priceRange !== 'all';
    const handleOpenCreate = () => { setProductToEdit(null); setIsFormModalOpen(true); };
    const handleOpenEdit = (product: ProductDisplayType) => { setProductToEdit(product); setIsFormModalOpen(true); };
    const handleOpenStockAdjustment = (product: ProductDisplayType) => { setProductForStock(product); setIsStockModalOpen(true); };
    const handlePageChange = (newPage: number) => { if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage); };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-lg text-gray-600">
                <Loader2 className="animate-spin mr-2 w-6 h-6" />
                <span>กำลังโหลดรายการสินค้า...</span>
            </div>
        );
    }

    if (error) {
        const errorMessage = (error as Error).message || 'Unknown error';
        return (
            <div className="p-6 bg-red-50 rounded-xl border border-red-200 shadow-sm">
                <h3 className="text-xl font-bold text-red-600 mb-2">ข้อผิดพลาดในการดึงข้อมูล</h3>
                <p className="text-red-500">ไม่สามารถเชื่อมต่อกับ Backend เพื่อดึงข้อมูลสินค้าได้: ({errorMessage})</p>
            </div>
        );
    }

    return (
        <div className="p-0">
            {products && <ProductStats products={products} />}

            {/* Filters & Search Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="ค้นหาสินค้า (ชื่อหรือบาร์โค้ด)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-10 py-3 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                <div className='flex justify-between'>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                            <Filter className="w-4 h-4 mr-2 text-emerald-600" />
                            ตัวกรอง
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="flex-1 md:flex-none px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all min-w-[150px]"
                        >
                            <option value="all">หมวดหมู่ทั้งหมด</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value as 'all' | 'in-stock' | 'low-stock')}
                            className="flex-1 md:flex-none px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all min-w-[140px]"
                        >
                            <option value="all">สต็อกทั้งหมด</option>
                            <option value="in-stock">มีสินค้า (6+)</option>
                            <option value="low-stock">เหลือน้อย (≤5)</option>
                        </select>

                        <select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value as 'all' | 'low' | 'medium' | 'high')}
                            className="flex-1 md:flex-none px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all min-w-[140px]"
                        >
                            <option value="all">ราคาทั้งหมด</option>
                            <option value="low">ต่ำกว่า ฿50</option>
                            <option value="medium">฿50 - ฿200</option>
                            <option value="high">มากกว่า ฿200</option>
                        </select>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
                            >
                                ล้างตัวกรอง
                            </button>
                        )}
                    </div>
                    <div>
                        <Button
                            onClick={handleOpenCreate}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            เพิ่มสินค้าใหม่
                        </Button>
                    </div>

                </div>

                <div className="mt-3 text-sm text-gray-600">
                    แสดง <span className="font-semibold text-emerald-600">{filteredProducts.length}</span> รายการ
                    {hasActiveFilters && products && <span className="text-gray-400"> จาก {products.length} รายการ</span>}
                </div>
            </div>

            {/* Main Card (Table) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <ProductTable
                        products={paginatedProducts}
                        onEdit={handleOpenEdit}
                        onAdjustStock={handleOpenStockAdjustment}
                    />
                </div>
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                        แสดง <span className="font-semibold text-emerald-600">{startIndex + 1}</span> ถึง{' '}
                        <span className="font-semibold text-emerald-600">
                            {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                        </span>{' '}
                        จากทั้งหมด <span className="font-semibold text-gray-900">{filteredProducts.length}</span> รายการ
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="text-sm font-medium text-gray-700">
                                หน้า {currentPage} จาก {totalPages}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ProductFormModal
                key={`form-${productToEdit?.id || 'new'}`}
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                productToEdit={productToEdit}
            />

            {productForStock && (
                <StockAdjustmentModal
                    key={`stock-${productForStock.id}`}
                    isOpen={isStockModalOpen}
                    onClose={() => setIsStockModalOpen(false)}
                    product={productForStock}
                />
            )}
        </div>
    );
}

