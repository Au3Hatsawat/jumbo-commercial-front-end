'use client';

import {
  Trash, Minus, Plus, ShoppingBag, Loader2, Package,
  User, Smartphone, QrCode, BanknoteIcon, X, Search
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { useCartStore } from '@/libs/store/cartStore';
import { useProducts } from '@/libs/hooks/useProducts';
import { useCreateOrder } from '@/libs/hooks/useOrder';
import useToastStore from '@/libs/store/alertStore';
import { getErrorResponse } from '@/utils/errorMapping';

import ProductCard, { PosItemType } from '@/components/ui/ProductCard';

import { 
    CustomerMode, 
    PaymentMethod, 
    flattenToPosItems, 
    filterPosItems 
} from './pos-configs';

export default function PosPage() {
  const t = useTranslations('pos');
  const locale = useLocale();
  
  const { items, totalAmount, addItem, updateQuantity, removeItem, clearCart } = useCartStore();
  const { showToast } = useToastStore();
  const { data: products, isLoading: isProductsLoading, error: productsError } = useProducts();
  const createOrderMutation = useCreateOrder();

  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [customerMode, setCustomerMode] = useState<CustomerMode>('guest');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  const categories = useMemo(() => {
    if (!products) return [];
    return ['all', ...new Set(products.map(p => locale === 'th' ? p.category?.nameTh : p.category?.nameEn || p.category?.nameTh || (t('categories.otherCategory') || 'อื่นๆ')))];
  }, [products, t, locale]);

  const posItems = useMemo(() => flattenToPosItems(products, t, locale), [products, t, locale]);
  
  const filteredItems = useMemo(() => 
    filterPosItems(posItems, searchQuery, selectedCategory), 
  [posItems, searchQuery, selectedCategory]);

  const handleProductSelect = useCallback((item: PosItemType) => {
    addItem(item.product, item.sellingUnit, 1);
  }, [addItem]);

  const handleCheckout = () => {
    if (items.length === 0) return showToast(t('messages.requireItems') || 'กรุณาเพิ่มสินค้าในตะกร้าก่อนชำระเงิน', 'warning');
    if (customerMode === 'member' && !customerPhone) return showToast(t('messages.requirePhone') || 'กรุณากรอกเบอร์โทรศัพท์ลูกค้า', 'warning');

    const orderData = {
      items: items.map(item => ({ sellingUnitId: item.sellingUnitId, quantity: item.quantity })),
      paymentMethod,
      ...(customerMode === 'member' && { newCustomerName: customerName || (t('messages.defaultMemberName') || 'ลูกค้าสมาชิก'), newCustomerPhone: customerPhone })
    };

    createOrderMutation.mutate(orderData, {
      onSuccess: (newOrder) => {
        showToast(`${t('messages.success') || 'ทำรายการสำเร็จ! เลขที่บิล:'} ${newOrder.orderNo}`, 'success');
        clearCart();
        setCustomerMode('guest');
        setCustomerName('');
        setCustomerPhone('');
        setIsMobileCartOpen(false);
      },
      onError: (error) => {
        const errorResponse = getErrorResponse(error);
        showToast(`${t('messages.error') || 'เกิดข้อผิดพลาด:'} ${errorResponse?.message}`, 'error')
      },
    });
  };

  if (isProductsLoading) return <div className="flex justify-center items-center h-[60vh] text-gray-600"><Loader2 className="animate-spin mr-2 w-5 h-5" /><span>{t('messages.loading') || 'กำลังโหลดรายการสินค้า...'}</span></div>;
  if (productsError) return <div className="text-red-600 p-4">Error: {getErrorResponse(productsError)?.message}</div>;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-7rem)] md:h-[calc(100dvh-8rem)] gap-0 md:gap-6 relative">
      
      <div className="flex-1 flex flex-col min-w-0 bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm overflow-hidden">
        
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder') || "ค้นหาสินค้า (ชื่อ หรือสแกนบาร์โค้ด)..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base"
            />
          </div>
        </div>

        <div className="px-4 py-2 border-b border-gray-100 shrink-0 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 pb-1">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat || 'all')}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (selectedCategory === cat || (cat === 'all' && selectedCategory === 'all'))
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? (t('categories.allCategories') || 'ทั้งหมด') : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4 bg-slate-50 md:bg-white">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <Package className="w-10 h-10 mb-2" />
              <p>{t('messages.emptyProducts') || 'ไม่พบสินค้า'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
              {filteredItems.map((item) => (
                <ProductCard key={item.uniqueId} item={item} handleProductSelect={handleProductSelect} />
              ))}
            </div>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-30 pb-safe">
          <button 
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-emerald-600 text-white rounded-xl py-3.5 px-5 flex justify-between items-center shadow-[0_8px_20px_rgba(5,150,105,0.3)] active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              </div>
              <span className="font-semibold text-sm ml-2">{t('cart.itemsCount') || 'ตะกร้าสินค้า'}</span>
            </div>
            <span className="font-bold text-lg">฿{totalAmount.toFixed(2)}</span>
          </button>
        </div>
      )}

      <div className={`
        fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 md:static md:bg-transparent md:backdrop-blur-none md:z-auto md:opacity-100 md:visible
        ${isMobileCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}>
        <div className="absolute inset-0 md:hidden" onClick={() => setIsMobileCartOpen(false)} />

        <div className={`
          absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-2xl flex flex-col transition-transform duration-300 shadow-2xl
          md:static md:h-full md:w-[380px] xl:w-[420px] md:rounded-xl md:shadow-sm md:border md:border-gray-200 md:translate-y-0
          ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full'}
        `}>
          
          <div className="px-5 py-4 border-b border-gray-200 bg-linear-to-br from-emerald-50 to-teal-50 shrink-0 md:rounded-t-xl rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t('cart.title') || 'รายการสั่งซื้อ'}</h2>
                {items.length > 0 && <p className="text-sm text-emerald-700 font-medium mt-0.5">{items.length} {t('cart.itemsCount') || 'รายการ'}</p>}
              </div>
              
              <button onClick={() => setIsMobileCartOpen(false)} className="md:hidden p-2 bg-white rounded-full text-gray-500 shadow-sm">
                <X className="w-5 h-5" />
              </button>
              
              <div className="hidden md:flex w-10 h-10 bg-white rounded-xl shadow-sm items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 bg-slate-50 md:bg-white">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-400 font-medium">{t('cart.emptyTitle') || 'ไม่มีสินค้าในตะกร้า'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.sellingUnitId} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:border-emerald-300 transition-all">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{item.name} ({item.unitName})</p>
                        <p className="text-xs text-gray-500 mt-0.5">฿{item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <div className="text-right"><p className="font-bold text-base text-emerald-600">฿{item.total.toFixed(2)}</p></div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg">
                        <button onClick={() => updateQuantity(item.sellingUnitId, item.quantity - 1)} className="p-2 hover:bg-gray-100 transition-colors"><Minus className="w-3.5 h-3.5 text-gray-600" /></button>
                        <span className="text-sm font-bold w-8 text-center text-gray-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.sellingUnitId, item.quantity + 1)} className="p-2 hover:bg-gray-100 transition-colors"><Plus className="w-3.5 h-3.5 text-gray-600" /></button>
                      </div>
                      <button onClick={() => removeItem(item.sellingUnitId)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setCustomerMode('guest')} className={`flex-1 py-1.5 text-sm font-medium rounded-lg border transition-all ${customerMode === 'guest' ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm' : 'border-transparent text-gray-500 hover:bg-white'}`}>
                {t('cart.guestTab') || 'ลูกค้าทั่วไป'}
              </button>
              <button onClick={() => setCustomerMode('member')} className={`flex-1 py-1.5 text-sm font-medium rounded-lg border transition-all ${customerMode === 'member' ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm' : 'border-transparent text-gray-500 hover:bg-white'}`}>
                {t('cart.memberTab') || 'สมาชิก'}
              </button>
            </div>
            {customerMode === 'member' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" placeholder={t('cart.phonePlaceholder') || "เบอร์โทรศัพท์ (จำเป็น)"} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400" />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder={t('cart.namePlaceholder') || "ชื่อลูกค้า (ถ้ามี)"} value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400" />
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-gray-200 space-y-4 bg-white shrink-0 pb-safe">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-gray-600">{t('cart.netTotal') || 'ยอดสุทธิ'}</span>
              <span className="text-2xl font-bold text-emerald-600">฿{totalAmount.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPaymentMethod('CASH')} className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-500 hover:border-emerald-200'}`}>
                <BanknoteIcon className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">{t('cart.cashBtn') || 'เงินสด (Cash)'}</span>
              </button>
              <button onClick={() => setPaymentMethod('QR')} className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${paymentMethod === 'QR' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-500 hover:border-blue-200'}`}>
                <QrCode className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">{t('cart.qrBtn') || 'โอน/สแกน (QR)'}</span>
              </button>
            </div>
            <button onClick={handleCheckout} disabled={items.length === 0 || createOrderMutation.isPending} className={`w-full py-3.5 font-bold text-lg rounded-xl transition-all shadow-md flex items-center justify-center ${paymentMethod === 'CASH' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} disabled:bg-gray-300 disabled:cursor-not-allowed`}>
              {createOrderMutation.isPending ? (
                <><Loader2 className="animate-spin mr-2 w-6 h-6" /> {t('cart.processing') || 'กำลังดำเนินการ...'}</>
              ) : (
                <><ShoppingBag className="w-5 h-5 mr-2" /> {t('cart.payBtn') || 'ชำระเงิน'}</>
              )}
            </button>
            <button onClick={clearCart} className="w-full pt-1 text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center">
              <Trash className="w-3.5 h-3.5 mr-1.5" /> {t('cart.clearCart') || 'ล้างตะกร้า'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}