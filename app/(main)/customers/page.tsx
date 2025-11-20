'use client';

import {
  Search,
  Filter,
  X,
  User,
  Phone,
  Star,
  Clock,
  Edit,
  ChevronRight,
  Calendar,
  Banknote,
  Loader2,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { useState, useMemo } from 'react';

import { useCustomers } from '@/libs/hooks/useCustomer';
import { Customer } from '@/libs/types/customer';
import { CustomerFormModal } from './components/CustomerFormModal';
import { CustomerStats } from './components/CustomerStats';

export default function CustomersPage() {
  const { data: customers = [], isLoading, error } = useCustomers();

  // --- State ---
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // --- Filters State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'spent-high' | 'spent-low' | 'points-high' | 'recent' | 'name'>('spent-high');

  // --- Handlers for Modal ---
  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  // --- Helper: Stats Calculation ---
  const getCustomerStats = (customer: Customer) => {
    const orders = customer.orders || [];
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);

    let lastVisit: Date | null = null;
    if (orders.length > 0) {
      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      lastVisit = new Date(sortedOrders[0].createdAt);
    }

    return { totalSpent, lastVisit };
  };

  const selectedCustomer = useMemo(() =>
    customers.find(c => c.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];

    const result = customers.map(c => ({
      ...c,
      stats: getCustomerStats(c)
    })).filter((customer) => {
      // 1. Search Only
      const matchesSearch =
        (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phoneNumber.includes(searchQuery);

      return matchesSearch;
    });

    // 2. Sorting
    result.sort((a, b) => {
      if (sortBy === 'spent-high') return b.stats.totalSpent - a.stats.totalSpent;
      if (sortBy === 'spent-low') return a.stats.totalSpent - b.stats.totalSpent;
      if (sortBy === 'points-high') return b.points - a.points;

      if (sortBy === 'recent') {
        const timeA = a.stats.lastVisit?.getTime() || 0;
        const timeB = b.stats.lastVisit?.getTime() || 0;
        return timeB - timeA;
      }

      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return result;
  }, [customers, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('spent-high');
  };

  const hasActiveFilters = searchQuery || sortBy !== 'spent-high';

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] text-gray-500">
        <Loader2 className="animate-spin mr-2 w-6 h-6 text-emerald-600" />
        <span>กำลังโหลดข้อมูลลูกค้า...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] text-red-500 bg-red-50 rounded-xl border border-red-100 m-6">
        <div className="text-center">
          <AlertCircle className="mx-auto w-10 h-10 mb-2 opacity-80" />
          <h3 className="font-bold">เกิดข้อผิดพลาด</h3>
          <p className="text-sm mt-1">ไม่สามารถดึงข้อมูลลูกค้าได้ ({error.message})</p>
        </div>
      </div>
    );
  }

  return (
    // ปรับ Root Class ให้เหมือน OrderHistoryPage (เอา p-4 gap-4 ออก)
    <div className="flex flex-col h-[calc(100vh-4rem)]">

      {/* ส่วน Stats วางแยกออกมาด้านบน พร้อม margin-bottom */}
      {!isLoading && customers.length > 0 && (
          <CustomerStats customers={customers} />
      )}

      {/* Main Layout Flex */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* Left Column: Search & List */}
        {/* เพิ่ม overflow-hidden เพื่อให้ scroll bar อยู่แค่ใน list ไม่ล้นออกมา */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* --- Search & Filters Card --- */}
          {/* เพิ่ม shrink-0 เพื่อไม่ให้กล่อง Filter หดตัวเวลามีพื้นที่น้อย */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4 shrink-0">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาลูกค้า (ชื่อ หรือ เบอร์โทร)..."
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

            {/* Filters Row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4 mr-2 text-emerald-600" />
                ตัวกรอง
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'spent-high' | 'spent-low' | 'points-high' | 'recent' | 'name')}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
              >
                <option value="spent-high">เรียงตาม: ยอดซื้อมากสุด</option>
                <option value="spent-low">เรียงตาม: ยอดซื้อน้อยสุด</option>
                <option value="points-high">เรียงตาม: แต้มสะสมมากสุด</option>
                <option value="recent">เรียงตาม: มาล่าสุด</option>
                <option value="name">เรียงตาม: ชื่อ ก-ฮ</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  ล้าง
                </button>
              )}

              <button
                onClick={handleCreateCustomer}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center font-medium transition-colors"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                เพิ่มลูกค้าใหม่
              </button>
            </div>

            {/* Result Count */}
            <div className="mt-3 text-sm text-gray-600">
              แสดง <span className="font-semibold text-emerald-600">{filteredCustomers.length}</span> รายชื่อ
              {hasActiveFilters && <span className="text-gray-400"> จาก {customers.length} รายชื่อ</span>}
            </div>
          </div>

          {/* --- Customer List (Content) --- */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {filteredCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">ไม่พบรายชื่อลูกค้า</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      ล้างตัวกรองทั้งหมด
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`
                      group cursor-pointer p-4 rounded-xl border transition-all duration-200 flex items-center gap-4
                      ${selectedCustomerId === customer.id
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-200 shadow-md'
                          : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm'}
                    `}
                    >
                      {/* Avatar */}
                      <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-lg font-bold
                      ${selectedCustomerId === customer.id ? 'bg-emerald-200 text-emerald-700' : 'bg-gray-100 text-gray-500'}
                    `}>
                        {(customer.name || '?').charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 truncate">{customer.name || 'ไม่ระบุชื่อ'}</h3>
                          <p className={`font-bold text-sm ${customer.stats.totalSpent > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            ฿{formatCurrency(customer.stats.totalSpent)}
                          </p>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm mt-0.5">
                          <Phone className="w-3 h-3 mr-1" /> {customer.phoneNumber}
                        </div>
                        <div className="flex items-center text-gray-400 text-xs mt-1">
                          <Star className="w-3 h-3 mr-1 text-yellow-400" /> {customer.points.toLocaleString()} แต้ม
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Details */}
        {/* เพิ่ม overflow-hidden */}
        <div className="w-[420px] flex flex-col overflow-hidden">

          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

            {selectedCustomer ? (
              (() => {
                const stats = getCustomerStats(selectedCustomer);
                return (
                  <>
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-gray-200 bg-linear-to-br from-emerald-50 to-teal-50 relative">
                      <button
                        onClick={() => setSelectedCustomerId(null)}
                        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-white hover:text-red-500 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold mb-3 shadow-sm text-emerald-600 border-4 border-white/50">
                          {(selectedCustomer.name || '?').charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name || 'ไม่ระบุชื่อ'}</h2>
                        <div className="flex items-center gap-2 justify-center mt-1">
                          <p className="text-gray-500 flex items-center gap-1 text-sm">
                            <Phone className="w-3.5 h-3.5" /> {selectedCustomer.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <p className="text-xs text-blue-600 font-medium mb-1">ยอดซื้อรวม</p>
                          <p className="text-xl font-bold text-blue-700">฿{formatCurrency(stats.totalSpent)}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                          <p className="text-xs text-amber-600 font-medium mb-1">แต้มสะสม</p>
                          <p className="text-xl font-bold text-amber-700 flex items-center gap-1">
                            <Star className="w-4 h-4" /> {selectedCustomer.points.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 border-b pb-2">ข้อมูลทั่วไป</h3>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 flex justify-center"><Clock className="w-4 h-4 text-gray-400" /></div>
                          <div className="flex-1 text-gray-600">
                            วันที่ซื้อล่าสุด: <span className="font-medium text-gray-900">{formatDate(stats.lastVisit)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 flex justify-center"><Calendar className="w-4 h-4 text-gray-400" /></div>
                          <div className="flex-1 text-gray-600">
                            วันที่เป็นสมาชิก: {formatDate(new Date(selectedCustomer.createdAt))}
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h3 className="text-sm font-bold text-gray-900">ประวัติการสั่งซื้อล่าสุด</h3>
                        </div>

                        <div className="space-y-3">
                          {(selectedCustomer.orders && selectedCustomer.orders.length > 0) ? (
                            selectedCustomer.orders
                              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                              .slice(0, 3)
                              .map((order) => (
                                <div key={order.id} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                      <Banknote className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{order.orderNo}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-gray-900">฿{formatCurrency(parseFloat(order.totalAmount.toString()))}</p>
                                    <p className="text-xs text-gray-400">{formatDate(new Date(order.createdAt))}</p>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีประวัติการสั่งซื้อ</p>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-gray-200 space-y-3 bg-white">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleEditCustomer(selectedCustomer)}
                          className="py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4 mr-2" /> แก้ไขข้อมูล
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()
            ) : (
              // Empty State
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-gray-400">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ChevronRight className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium text-gray-500">เลือกรายชื่อลูกค้าทางซ้าย</p>
                <p className="text-sm mt-1">เพื่อดูรายละเอียด ประวัติ หรือทำรายการ</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Modal (วางไว้นอกสุด) --- */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customerToEdit={editingCustomer}
      />

    </div>
  );
}