'use client';

import {
  Trash, Minus, Plus, ShoppingBag, Loader2, Search, X, Package,
  User, Smartphone, QrCode,
  BanknoteIcon
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useCartStore } from '@/libs/store/cartStore';
import { useProducts } from '@/libs/hooks/useProducts';
import { Product } from '@/libs/types/product';
import ProductCard from '@/components/ui/ProductCard';
import { useCreateOrder } from '@/libs/hooks/useOrder';
import useToastStore from '@/libs/store/alertStore';
import { getErrorMessage } from '@/utils/errorMapping';

type ProductDisplayType = Product;
type CustomerMode = 'guest' | 'member';
type PaymentMethod = 'CASH' | 'QR';

export default function PosPage() {
  const { items, totalAmount, addItem, updateQuantity, removeItem, clearCart } = useCartStore();
  const { showToast } = useToastStore();

  const { data: products, isLoading: isProductsLoading, error: productsError } = useProducts();
  const createOrderMutation = useCreateOrder();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const [customerMode, setCustomerMode] = useState<CustomerMode>('guest');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  const categories = useMemo(() => {
    if (!products) return [];
    const uniqueCategories = [...new Set(products.map(p => p.category.nameTh || 'อื่นๆ'))];
    return uniqueCategories;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product: ProductDisplayType) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
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
    });
  }, [products, searchQuery, selectedCategory, stockFilter, priceRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setStockFilter('all');
    setPriceRange('all');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || stockFilter !== 'all' || priceRange !== 'all';

  const handleProductSelect = (product: ProductDisplayType) => {
    addItem(product, 1);
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    // 1. Validation: Empty Cart
    if (items.length === 0) {
      showToast('กรุณาเพิ่มสินค้าในตะกร้าก่อนชำระเงิน', 'warning');
      return;
    }

    // 2. Validation: Member Phone
    if (customerMode === 'member') {
      if (!customerPhone) {
        showToast('กรุณากรอกเบอร์โทรศัพท์ลูกค้า', 'warning');
        return;
      }
    }

    const orderData = {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      ...(customerMode === 'member' && {
        newCustomerName: customerName || 'ลูกค้าสมาชิก',
        newCustomerPhone: customerPhone
      })
    };

    createOrderMutation.mutate(orderData, {
      onSuccess: (newOrder) => {
        showToast(`ทำรายการสำเร็จ! เลขที่บิล: ${newOrder.orderNo}`, 'success');

        clearCart();
        setCustomerMode('guest');
        setCustomerName('');
        setCustomerPhone('');
      },
      onError: (error) => {
        const message = getErrorMessage(error);
        showToast(`เกิดข้อผิดพลาด: ${message}`, 'error');
      },
    });
  };

  if (isProductsLoading) return <div className="flex justify-center items-center h-full text-gray-600"><Loader2 className="animate-spin mr-2 w-5 h-5" /><span>กำลังโหลดรายการสินค้า...</span></div>;
  if (productsError) return <div className="text-red-600 p-4">Error: {(productsError as Error).message}</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">

      <div className="flex-1 flex flex-col">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="ค้นหาสินค้า..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-10 py-3 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-400" /></button>}
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none"><option value="all">หมวดหมู่ทั้งหมด</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as 'all' | 'in-stock' | 'low-stock')} className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none"><option value="all">สต็อกทั้งหมด</option><option value="in-stock">มีสินค้า (6+)</option><option value="low-stock">เหลือน้อย (≤5)</option></select>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value as 'all' | 'low' | 'medium' | 'high')} className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none"><option value="all">ราคาทั้งหมด</option><option value="low">ต่ำกว่า ฿50</option><option value="medium">฿50 - ฿200</option><option value="high">มากกว่า ฿200</option></select>
            {hasActiveFilters && <button onClick={clearFilters} className="px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg">ล้างตัวกรอง</button>}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-full overflow-y-auto p-5">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400"><Package className="w-10 h-10 mb-2" /><p>ไม่พบสินค้า</p></div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} handleProductSelect={handleProductSelect} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. ตะกร้าและชำระเงิน (ขวา) */}
      <div className="w-[420px] flex flex-col">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

          {/* Cart Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-br from-emerald-50 to-teal-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">รายการสั่งซื้อ</h2>
                {items.length > 0 && <p className="text-sm text-gray-600 mt-0.5">{items.length} รายการ</p>}
              </div>
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <ShoppingBag className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-gray-400 font-medium">ไม่มีสินค้าในตะกร้า</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">฿{item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base text-emerald-600">฿{item.total.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <span className="text-sm font-bold w-8 text-center text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- SECTION: Customer Info --- */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setCustomerMode('guest')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg border transition-all ${customerMode === 'guest' ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm' : 'border-transparent text-gray-500 hover:bg-white'}`}
              >
                ลูกค้าทั่วไป
              </button>
              <button
                onClick={() => setCustomerMode('member')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg border transition-all ${customerMode === 'member' ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm' : 'border-transparent text-gray-500 hover:bg-white'}`}
              >
                สมาชิก/ลูกค้าใหม่
              </button>
            </div>

            {customerMode === 'member' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="เบอร์โทรศัพท์ (จำเป็น)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ชื่อลูกค้า (ถ้ามี)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary & Payment */}
          <div className="px-6 py-4 border-t border-gray-200 space-y-4 bg-white">

            {/* Total */}
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">ยอดสุทธิ</span>
              <span className="text-2xl font-bold text-emerald-600">฿{totalAmount.toFixed(2)}</span>
            </div>

            {/* --- SECTION: Payment Method --- */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`
                        flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all
                        ${paymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-emerald-200'}
                    `}
              >
                <BanknoteIcon className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">เงินสด (Cash)</span>
              </button>

              <button
                onClick={() => setPaymentMethod('QR')}
                className={`
                        flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all
                        ${paymentMethod === 'QR'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-blue-200'}
                    `}
              >
                <QrCode className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">โอน/สแกน (QR)</span>
              </button>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={items.length === 0 || createOrderMutation.isPending}
              className={`
                w-full py-3.5 font-bold rounded-xl transition-all shadow-md flex items-center justify-center
                ${paymentMethod === 'CASH' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                disabled:bg-gray-300 disabled:cursor-not-allowed
              `}
            >
              {createOrderMutation.isPending ? (
                <><Loader2 className="animate-spin mr-2 w-5 h-5" /> กำลังดำเนินการ...</>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  ชำระเงิน ({paymentMethod === 'CASH' ? 'เงินสด' : 'โอนจ่าย'})
                </>
              )}
            </button>

            {/* Clear Cart */}
            <button onClick={clearCart} className="w-full py-2 text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center">
              <Trash className="w-3.5 h-3.5 mr-1.5" /> ล้างตะกร้า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}