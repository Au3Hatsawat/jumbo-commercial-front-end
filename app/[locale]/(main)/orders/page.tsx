'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Calendar,
  CreditCard,
  User,
  Printer,
  ChevronRight,
  Clock,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Download,
  Banknote,
  TrendingUp,
  BarChart3,
  X
} from 'lucide-react';

import { useGetOrders, usePrintReceipt } from '@/libs/hooks/useOrder';
import { BASE_URL } from '@/libs/api/axios';
import Pinto, { StatCardData } from '@/components/ui/dynamic/Pinto';
import Filter from '@/components/ui/dynamic/Filter';
import { ActionButton } from '@/components/ui/dynamic/Operation';
import Table from '@/components/ui/dynamic/Table';

import {
  OrderTableRow,
  formatTime,
  formatDate,
  formatCurrency,
  getFilterConfigs,
  formatOrderTableData,
  getTableColumns
} from './configs';

export default function OrderHistoryPage() {
  const { data: orders = [], isLoading, error } = useGetOrders();
  const { mutateAsync: printReceipt, isPending: isPrinting } = usePrintReceipt();

  const t = useTranslations('orders');
  const locale = useLocale();

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'this_week' | 'all' | 'this_month'>('today');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'CASH' | 'QR'>('all');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRange, paymentFilter]);

  const selectedOrder = useMemo(() =>
    orders.find(o => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]);

  const handlePrintReceipt = async () => {
    if (!selectedOrderId) return;

    try {
      const pdfBlob = await printReceipt(selectedOrderId);
      const fileURL = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error("Print receipt error:", err);
      alert(t('messages.errorTitle') || 'ไม่สามารถปริ้นใบเสร็จได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

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
      } else if (dateRange === 'this_month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        matchesDate = orderDate >= startOfMonth;
      }

      return matchesSearch && matchesPayment && matchesDate;
    });
  }, [orders, searchQuery, paymentFilter, dateRange]);

  const statCards = useMemo<StatCardData[]>(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    const totalProfit = filteredOrders.reduce((sum, order) => {
      const orderProfit = (order.items || []).reduce((itemSum, item) => {
        const sellingPrice = parseFloat(item.priceAtSale);
        const costPrice = parseFloat(item.costAtSale);
        const profitPerItem = sellingPrice - costPrice;
        return itemSum + (profitPerItem * item.quantity);
      }, 0);
      return sum + orderProfit;
    }, 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const formatCurr = (val: number) => val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return [
      { id: 'total-revenue', title: t('stats.totalRevenue') || "ยอดขายรวม", value: `฿${formatCurr(totalRevenue)}`, icon: Banknote, theme: "emerald" },
      { id: 'total-orders', title: t('stats.totalOrders') || "จำนวนบิล", value: totalOrders.toLocaleString(), icon: ShoppingBag, theme: "blue" },
      { id: 'total-profit', title: t('stats.totalProfit') || "กำไรขั้นต้น (Est.)", value: `฿${formatCurr(totalProfit)}`, icon: TrendingUp, theme: "gray" },
      { id: 'avg-order-value', title: t('stats.avgOrderValue') || "เฉลี่ยต่อบิล", value: `฿${formatCurr(averageOrderValue)}`, icon: BarChart3, theme: "amber" }
    ];
  }, [filteredOrders, t]);

  const filterConfigs = useMemo(() => getFilterConfigs(dateRange, setDateRange, paymentFilter, setPaymentFilter, t), [dateRange, paymentFilter, t]);
  const tableData = useMemo(() => formatOrderTableData(filteredOrders, t), [filteredOrders, t]);
  const columns = useMemo(() => getTableColumns(selectedOrderId, setSelectedOrderId, t), [selectedOrderId, t]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tableData.slice(startIndex, startIndex + itemsPerPage);
  }, [tableData, currentPage, itemsPerPage]);

  const clearFilters = () => {
    setSearchQuery('');
    setDateRange('all');
    setPaymentFilter('all');
  };

  const hasActiveFilters = searchQuery !== "" || dateRange !== 'all' || paymentFilter !== 'all';

  const handleExport = () => {
    const apiUrl = `${BASE_URL}/orders/export`;
    const params = new URLSearchParams();

    const today = new Date();
    let startDateStr = '';
    let endDateStr = '';

    const toDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (dateRange === 'today') {
      startDateStr = toDateString(today);
      endDateStr = toDateString(today);
    } else if (dateRange === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      startDateStr = toDateString(yesterday);
      endDateStr = toDateString(yesterday);
    } else if (dateRange === 'this_week') {
      const startOfWeek = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startDateStr = toDateString(startOfWeek);
      endDateStr = toDateString(today);
    } else if (dateRange === 'this_month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startDateStr = toDateString(startOfMonth);
      endDateStr = toDateString(today);
    }

    if (dateRange !== 'all') {
      params.append('startDate', startDateStr);
      params.append('endDate', endDateStr);
    }

    window.open(`${apiUrl}?${params.toString()}`, '_blank');
  };

  const operationActions: ActionButton[] = [
    {
      label: t('actions.export') || 'ส่งออก',
      icon: <Download className="w-5 h-5" />,
      onClick: handleExport,
      className: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] text-gray-500">
        <Loader2 className="animate-spin mr-2 w-6 h-6 text-emerald-600" />
        <span>{t('messages.loading') || 'กำลังโหลดข้อมูลประวัติการขาย...'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="text-red-600 bg-red-50 p-6 rounded-xl border border-red-200 flex flex-col items-center text-center max-w-md">
          <AlertCircle className="w-10 h-10 mb-2" />
          <h3 className="font-bold text-lg">{t('messages.errorTitle') || 'เกิดข้อผิดพลาด'}</h3>
          <p className="text-sm mt-1 text-red-500">{t('messages.errorMessage') || 'ไม่สามารถดึงข้อมูลรายการขายได้'} ({(error as Error).message})</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative">
      <Pinto cards={statCards} />

      <div className="flex flex-1 gap-6">

        <div className="flex-1 flex flex-col min-w-0 pb-safe">
          <Filter
            showSearch={true}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t('searchPlaceholder') || "ค้นหาเลขที่บิล, ชื่อลูกค้า, เบอร์โทร..."}
            filters={filterConfigs}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            actions={operationActions}
          />

          <Table<OrderTableRow>
            columns={columns}
            datas={paginatedData}
            pagination={{
              currentPage: currentPage,
              itemsPerPage: itemsPerPage,
              totalItems: filteredOrders.length,
              onPageChange: (newPage) => setCurrentPage(newPage)
            }}
          />
        </div>

        <div className={`
          fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 
          lg:static lg:bg-transparent lg:backdrop-blur-none lg:z-auto lg:opacity-100 lg:visible
          ${selectedOrderId ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}>

          <div className="absolute inset-0 lg:hidden" onClick={() => setSelectedOrderId(null)} />

          <div className={`
            absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-2xl flex flex-col transition-transform duration-300 shadow-2xl
            lg:static lg:h-full lg:w-[420px] lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-200 lg:translate-y-0
            ${selectedOrderId ? 'translate-y-0' : 'translate-y-full'}
          `}>

            {selectedOrder ? (
              <>
                {/* Header */}
                <div className="px-5 py-4 lg:py-5 border-b border-gray-200 bg-linear-to-br from-emerald-50 to-teal-50 lg:rounded-t-xl rounded-t-2xl shrink-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-emerald-600 font-medium mb-1">{t('details.title') || 'รายละเอียดคำสั่งซื้อ'}</p>
                      <h2 className="text-xl font-bold text-gray-900">{selectedOrder.orderNo}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrintReceipt}
                        disabled={isPrinting}
                        className="p-2 bg-white rounded-lg shadow-sm hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        title={t('tooltips.print') || 'พิมพ์'}
                      >
                        {isPrinting ? (
                          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                        ) : (
                          <Printer className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => setSelectedOrderId(null)}
                        className="lg:hidden p-2 bg-white rounded-lg shadow-sm text-gray-500 hover:text-gray-700 transition-colors border border-gray-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
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
                <div className="px-5 lg:px-6 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {selectedOrder.customer?.name || t('details.generalCustomer') || 'ลูกค้าทั่วไป'}
                      </p>
                      {selectedOrder.customer?.phoneNumber && (
                        <p className="text-xs text-gray-500 truncate">{selectedOrder.customer.phoneNumber}</p>
                      )}
                    </div>
                    <div className="ml-auto shrink-0">
                      {selectedOrder.customer && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{t('details.member') || 'สมาชิก'}</span>}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-5 lg:px-6 py-4 bg-slate-50 lg:bg-white">
                  <table className="w-full text-sm">
                    <thead className="text-gray-500 font-medium border-b border-gray-200">
                      <tr>
                        <th className="pb-2 text-left">{t('details.tableItem') || 'รายการ'}</th>
                        <th className="pb-2 text-center w-16">{t('details.tableQty') || 'จำนวน'}</th>
                        <th className="pb-2 text-right w-24">{t('details.tableTotal') || 'รวม'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(selectedOrder.items || []).map((item) => {
                        const itemTotal = Number(item.priceAtSale) * item.quantity;
                        return (
                          <tr key={item.id} className="bg-transparent hover:bg-slate-50 transition-colors">
                            <td className="py-3 pr-2 align-top">
                              <p className="font-medium text-gray-900 line-clamp-2">
                                {item.productName || t('details.unknownProduct') || 'สินค้าไม่ระบุชื่อ'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {locale === 'th' ? item.unitName : item.unitNameEn || item.unitName}
                              </p>
                            </td>
                            <td className="py-3 px-2 text-center text-gray-600 align-top whitespace-nowrap">
                              x{item.quantity}
                            </td>
                            <td className="py-3 pl-2 text-right font-medium text-emerald-600 align-top whitespace-nowrap">
                              ฿{formatCurrency(itemTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Summary */}
                <div className="px-5 lg:px-6 py-4 bg-white lg:bg-gray-50 border-t border-gray-200 space-y-2 shrink-0 pb-safe">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('details.paymentMethod') || 'วิธีการชำระเงิน'}</span>
                    <span className="font-medium flex items-center gap-1">
                      <CreditCard className="w-4 h-4" /> {selectedOrder.paymentMethod || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('details.totalItems') || 'จำนวนสินค้า'}</span>
                    <span className="font-medium">{selectedOrder.items?.length || 0} {t('details.itemsCountUnit') || 'รายการ'}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-end">
                    <span className="font-bold text-gray-900">{t('details.netTotal') || 'ยอดสุทธิ'}</span>
                    <span className="text-2xl font-bold text-emerald-600">฿{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-gray-400 p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ChevronRight className="w-8 h-8 text-gray-300" />
                </div>
                <p>{t('details.emptyStateLine1') || 'เลือกรายการทางซ้าย'}</p>
                <p className="text-sm">{t('details.emptyStateLine2') || 'เพื่อดูรายละเอียด'}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}