'use client';

import {
  Search,
  Filter,
  X,
  Calendar,
  CreditCard,
  User,
  FileText,
  Printer,
  ChevronRight,
  Clock,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Download // เพิ่ม icon สำหรับปุ่ม Export
} from 'lucide-react';
import { useState, useMemo } from 'react';

import { useGetOrders } from '@/libs/hooks/useOrder';
import { OrderStats } from './components/OrderStats';
import { BASE_URL } from '@/libs/api/axios';

export default function OrderHistoryPage() {
  const { data: orders = [], isLoading, error } = useGetOrders();

  // --- State ---
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // --- Filter States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'this_week' | 'all'>('today');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'CASH' | 'QR'>('all');

  // --- Derived Data ---
  const selectedOrder = useMemo(() =>
    orders.find(o => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter(order => {
      const customerName = order.customer?.name || '';
      const customerPhone = order.customer?.phoneNumber || '';
      const orderNo = order.orderNo;

      const matchesSearch =
        orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerPhone.includes(searchQuery);

      const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);

      let matchesDate = true;

      if (dateRange === 'today') {
        matchesDate = orderDate.getTime() === today.getTime();
      } else if (dateRange === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = orderDate.getTime() === yesterday.getTime();
      } else if (dateRange === 'this_week') {
        const startOfWeek = new Date(today);
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        matchesDate = orderDate >= startOfWeek;
      }

      return matchesSearch && matchesPayment && matchesDate;
    });
  }, [orders, searchQuery, paymentFilter, dateRange]);

  // --- Helpers ---
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const formatCurrency = (amount: string | number) => {
    return Number(amount).toFixed(2);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateRange('all');
    setPaymentFilter('all');
  };

  const hasActiveFilters = searchQuery || dateRange !== 'all' || paymentFilter !== 'all';

  const handleExport = () => {
    // TODO: ปรับ URL ให้ตรงกับ Backend ของจริง
    const apiUrl = `${BASE_URL}/orders/export`;
    const params = new URLSearchParams();

    const today = new Date();
    let startDateStr = '';
    let endDateStr = '';

    // Helper จัด format YYYY-MM-DD (เพื่อไม่ให้ time zone เพี้ยน)
    const toDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (dateRange === 'today') {
      // วันนี้: start = วันนี้, end = วันนี้
      startDateStr = toDateString(today);
      endDateStr = toDateString(today);

    } else if (dateRange === 'yesterday') {
      // เมื่อวาน: start = เมื่อวาน, end = เมื่อวาน
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      startDateStr = toDateString(yesterday);
      endDateStr = toDateString(yesterday);

    } else if (dateRange === 'this_week') {
      // สัปดาห์นี้: หา Monday ของสัปดาห์
      const startOfWeek = new Date(today);
      const day = today.getDay(); // 0 (Sun) - 6 (Sat)
      // ถ้าเป็นวันอาทิตย์ (0) ให้ถอยไป 6 วันเพื่อเป็นวันจันทร์, ถ้าวันอื่นให้ถอย day-1
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      startDateStr = toDateString(startOfWeek);
      endDateStr = toDateString(today); // ถึงปัจจุบัน

    } else {
      // All: ไม่ต้องส่ง startDate/endDate (เพื่อให้ Backend ดึงทั้งหมด)
      // หรือจะส่งย้อนหลังไปไกลๆ ก็ได้
      // params.delete('startDate'); 
      // params.delete('endDate');
    }

    // ใส่ params ถ้ามีค่า
    if (dateRange !== 'all') {
      params.append('startDate', startDateStr);
      params.append('endDate', endDateStr);
    }

    console.log("Exporting with params:", params.toString()); // เช็ค log ตรงนี้ก่อน

    // เรียก URL
    window.open(`${apiUrl}?${params.toString()}`, '_blank');
  }


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] text-gray-500">
        <Loader2 className="animate-spin mr-2 w-6 h-6 text-emerald-600" />
        <span>กำลังโหลดข้อมูลประวัติการขาย...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="text-red-600 bg-red-50 p-6 rounded-xl border border-red-200 flex flex-col items-center text-center max-w-md">
          <AlertCircle className="w-10 h-10 mb-2" />
          <h3 className="font-bold text-lg">เกิดข้อผิดพลาด</h3>
          <p className="text-sm mt-1 text-red-500">ไม่สามารถดึงข้อมูลรายการขายได้ ({error.message})</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">

      {/* Stats Section */}
      <OrderStats orders={filteredOrders} />

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Side */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Filter Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4 shrink-0">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่บิล, ชื่อลูกค้า, เบอร์โทร..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4 mr-2 text-emerald-600" />
                ตัวกรอง
              </div>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'today' | 'yesterday' | 'this_week' | 'all')}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              >
                <option value="today">วันนี้</option>
                <option value="yesterday">เมื่อวาน</option>
                <option value="this_week">สัปดาห์นี้</option>
                <option value="all">ทั้งหมด</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'CASH' | 'QR')}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              >
                <option value="all">ทุกการชำระเงิน</option>
                <option value="CASH">เงินสด (Cash)</option>
                <option value="QR">โอน/สแกน (QR)</option>
              </select>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                  ล้าง
                </button>
              )}

              {/* ปุ่ม Export Excel (เพิ่มเข้ามา) */}
              <button
                onClick={handleExport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center font-medium transition-colors ml-auto"
                title="ดาวน์โหลดไฟล์ Excel"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              แสดง <span className="font-semibold text-emerald-600">{filteredOrders.length}</span> รายการ
              <span className="text-gray-400 ml-1">จากทั้งหมด {orders.length}</span>
            </div>
          </div>

          {/* Order List */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mb-2" />
                  <p>ไม่พบรายการขาย</p>
                  {hasActiveFilters && <p className="text-sm text-gray-400 mt-1">ลองปรับตัวกรองการค้นหาดูใหม่</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`
                        group cursor-pointer p-4 rounded-lg border transition-all duration-200
                        ${selectedOrderId === order.id
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-200 shadow-md'
                          : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-gray-50'}
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${selectedOrderId === order.id ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{order.orderNo}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" /> {formatDate(order.createdAt)}
                              <span className="mx-1">•</span>
                              <Clock className="w-3 h-3 mr-1" /> {formatTime(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-emerald-600">฿{formatCurrency(order.totalAmount)}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${order.paymentMethod === 'CASH' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                            {order.paymentMethod || '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100/50">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          {order.customer?.name || 'ลูกค้าทั่วไป'}
                        </div>
                        <div>{order.items?.length || 0} รายการ</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-[420px] flex flex-col overflow-hidden">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            {selectedOrder ? (
              <>
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 bg-linear-to-br from-emerald-50 to-teal-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-emerald-600 font-medium mb-1">รายละเอียดคำสั่งซื้อ</p>
                      <h2 className="text-xl font-bold text-gray-900">{selectedOrder.orderNo}</h2>
                    </div>
                    <button className="p-2 bg-white rounded-lg shadow-sm hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-gray-200">
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(selectedOrder.createdAt)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatTime(selectedOrder.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedOrder.customer?.name || 'ลูกค้าทั่วไป'}
                      </p>
                      {selectedOrder.customer?.phoneNumber && (
                        <p className="text-xs text-gray-500">{selectedOrder.customer.phoneNumber}</p>
                      )}
                    </div>
                    <div className="ml-auto">
                      {selectedOrder.customer && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Member</span>}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <table className="w-full text-sm">
                    <thead className="text-gray-500 font-medium border-b border-gray-200">
                      <tr>
                        <th className="pb-2 text-left w-1/2">รายการ</th>
                        <th className="pb-2 text-center">จำนวน</th>
                        <th className="pb-2 text-right">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(selectedOrder.items || []).map((item) => {
                        const itemTotal = Number(item.price) * item.quantity;
                        return (
                          <tr key={item.id}>
                            <td className="py-3">
                              <p className="font-medium text-gray-900">{item.product?.name || 'สินค้าไม่ระบุชื่อ'}</p>
                              <p className="text-xs text-gray-400">{item.product?.barcode}</p>
                            </td>
                            <td className="py-3 text-center text-gray-600">x{item.quantity}</td>
                            <td className="py-3 text-right font-medium text-gray-900">฿{formatCurrency(itemTotal)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Summary */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>วิธีการชำระเงิน</span>
                    <span className="font-medium flex items-center gap-1">
                      <CreditCard className="w-4 h-4" /> {selectedOrder.paymentMethod || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>จำนวนสินค้า</span>
                    <span className="font-medium">{selectedOrder.items?.length || 0} รายการ</span>
                  </div>
                  <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-end">
                    <span className="font-bold text-gray-900">ยอดสุทธิ</span>
                    <span className="text-2xl font-bold text-emerald-600">฿{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ChevronRight className="w-8 h-8 text-gray-300" />
                </div>
                <p>เลือกรายการทางซ้าย</p>
                <p className="text-sm">เพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}