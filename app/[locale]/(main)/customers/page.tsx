'use client';

import {
  Phone,
  Star,
  Clock,
  ChevronRight,
  Calendar,
  Banknote,
  Loader2,
  AlertCircle,
  UserPlus,
  Users,
  UserCheck,
  X
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from '@/routing';
import { useTranslations } from 'next-intl';

import { useCustomers } from '@/libs/hooks/useCustomer';
import Pinto, { StatCardData } from '@/components/ui/dynamic/Pinto';
import Filter from '@/components/ui/dynamic/Filter';
import { ActionButton } from '@/components/ui/dynamic/Operation';
import Table from '@/components/ui/dynamic/Table';

import { 
    CustomerTableRow,
    getCustomerStats, 
    formatDate, 
    formatCurrency, 
    getFilterConfigs, 
    formatCustomerTableData, 
    getTableColumns 
} from './configs';

export default function CustomersPage() {
  const router = useRouter(); 
  const { data: customers = [], isLoading, error } = useCustomers();
  const t = useTranslations('customers');

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'spent-high' | 'spent-low' | 'points-high' | 'recent' | 'name'>('spent-high');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const handleCreateCustomer = () => router.push('/customers/create');
  const handleEditCustomer = (customerId: number) => router.push(`/customers/edit/${customerId}`);

  const selectedCustomer = useMemo(() =>
    customers.find(c => c.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];

    const result = customers.map(c => ({
      ...c,
      stats: getCustomerStats(c)
    })).filter((customer) => {
      return (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
             customer.phoneNumber.includes(searchQuery);
    });

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

  const statCards = useMemo<StatCardData[]>(() => {
    if (!customers) return [];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const totalCustomers = customers.length;
    const newCustomersCount = customers.filter(c => {
      const joinedDate = new Date(c.createdAt);
      return joinedDate.getMonth() === currentMonth && joinedDate.getFullYear() === currentYear;
    }).length;

    const activeCustomersCount = customers.filter(c => {
      if (!c.orders || c.orders.length === 0) return false;
      const lastOrder = c.orders.reduce((latest, current) => new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest, c.orders[0]);
      const diffTime = Math.abs(now.getTime() - new Date(lastOrder.createdAt).getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 30;
    }).length;

    const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);

    return [
      { id: 'total-customers', title: t('stats.totalCustomers') || "สมาชิกทั้งหมด", value: totalCustomers.toLocaleString(), icon: Users, theme: "blue" },
      { id: 'new-members', title: t('stats.newMembers') || "สมาชิกใหม่ (เดือนนี้)", value: `+${newCustomersCount}`, icon: UserPlus, theme: "emerald" },
      { id: 'active-users', title: t('stats.activeUsers') || "Active (30 วันล่าสุด)", value: activeCustomersCount.toLocaleString(), icon: UserCheck, theme: "gray" },
      { id: 'total-points', title: t('stats.totalPoints') || "แต้มสะสมรวมในระบบ", value: totalPoints.toLocaleString(), icon: Star, theme: "amber" }
    ];
  }, [customers, t]);

  const filterConfigs = useMemo(() => getFilterConfigs(sortBy, setSortBy, t), [sortBy, t]);
  const tableData = useMemo(() => formatCustomerTableData(filteredCustomers, t), [filteredCustomers, t]);
  const columns = useMemo(() => getTableColumns(selectedCustomerId, setSelectedCustomerId, handleEditCustomer, t), [selectedCustomerId, t]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tableData.slice(startIndex, startIndex + itemsPerPage);
  }, [tableData, currentPage, itemsPerPage]);

  const operationActions: ActionButton[] = [
    {
      label: t('actions.addCustomer') || 'เพิ่มลูกค้าใหม่',
      icon: <UserPlus className="w-5 h-5" />,
      onClick: handleCreateCustomer,
      className: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
  ];

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('spent-high');
  };

  const hasActiveFilters = searchQuery !== "" || sortBy !== 'spent-high';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] text-gray-500">
        <Loader2 className="animate-spin mr-2 w-6 h-6 text-emerald-600" />
        <span>{t('messages.loading') || 'กำลังโหลดข้อมูลลูกค้า...'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] text-red-500 bg-red-50 rounded-xl border border-red-100 m-6">
        <div className="text-center">
          <AlertCircle className="mx-auto w-10 h-10 mb-2 opacity-80" />
          <h3 className="font-bold">{t('messages.errorTitle') || 'เกิดข้อผิดพลาด'}</h3>
          <p className="text-sm mt-1">{t('messages.errorMessage') || 'ไม่สามารถดึงข้อมูลลูกค้าได้'} ({(error as Error).message})</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative ">

      {!isLoading && customers.length > 0 && (
          <Pinto cards={statCards} />
      )}

      <div className="flex flex-1 gap-4 lg:gap-6 flex-col lg:flex-row relative ">
        
        <div className="flex-1 flex flex-col min-w-0 min-h-0 pb-safe">

          <Filter 
            showSearch={true}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t('searchPlaceholder') || "ค้นหาลูกค้า (ชื่อ หรือ เบอร์โทร)..."}
            filters={filterConfigs}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            actions={operationActions}
          />

          <div className="flex-1 min-h-0 pt-2">
            <Table<CustomerTableRow>
              columns={columns}
              datas={paginatedData}
              pagination={{
                currentPage: currentPage,
                itemsPerPage: itemsPerPage,
                totalItems: filteredCustomers.length,
                onPageChange: (newPage) => setCurrentPage(newPage)
              }}
            />
          </div>
        </div>

        <div className={`
          fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 
          lg:static lg:bg-transparent lg:backdrop-blur-none lg:z-auto lg:opacity-100 lg:visible
          ${selectedCustomerId ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}>
          
          <div className="absolute inset-0 lg:hidden" onClick={() => setSelectedCustomerId(null)} />

          <div className={`
            absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-2xl flex flex-col transition-transform duration-300 shadow-2xl
            lg:static lg:h-full lg:w-[420px] lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-200 lg:translate-y-0
            ${selectedCustomerId ? 'translate-y-0' : 'translate-y-full'}
          `}>

            {selectedCustomer ? (
              (() => {
                const stats = getCustomerStats(selectedCustomer);
                return (
                  <>
                    {/* Header */}
                    <div className="px-5 py-6 lg:px-6 lg:py-6 border-b border-gray-200 bg-linear-to-br from-emerald-50 to-teal-50 relative lg:rounded-t-xl rounded-t-2xl shrink-0">
                      
                      <button
                        onClick={() => setSelectedCustomerId(null)}
                        className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-white hover:text-red-500 rounded-full transition-colors lg:bg-transparent bg-white shadow-sm lg:shadow-none"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold mb-3 shadow-sm text-emerald-600 border-4 border-white/50">
                          {(selectedCustomer.name || '?').charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name || t('details.unknownName') || 'ไม่ระบุชื่อ'}</h2>
                        <div className="flex items-center gap-2 justify-center mt-1">
                          <p className="text-gray-500 flex items-center gap-1 text-sm">
                            <Phone className="w-3.5 h-3.5" /> {selectedCustomer.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details Body */}
                    <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6 custom-scrollbar pb-safe">

                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <p className="text-xs text-blue-600 font-medium mb-1">{t('details.totalSpent') || 'ยอดซื้อรวม'}</p>
                          <p className="text-xl font-bold text-blue-700">฿{formatCurrency(stats.totalSpent)}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                          <p className="text-xs text-amber-600 font-medium mb-1">{t('details.points') || 'แต้มสะสม'}</p>
                          <p className="text-xl font-bold text-amber-700 flex items-center gap-1">
                            <Star className="w-4 h-4" /> {selectedCustomer.points.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 border-b pb-2">{t('details.generalInfo') || 'ข้อมูลทั่วไป'}</h3>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 flex justify-center"><Clock className="w-4 h-4 text-gray-400" /></div>
                          <div className="flex-1 text-gray-600">
                            {t('details.lastPurchaseDate') || 'วันที่ซื้อล่าสุด:'} <span className="font-medium text-gray-900">{formatDate(stats.lastVisit)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 flex justify-center"><Calendar className="w-4 h-4 text-gray-400" /></div>
                          <div className="flex-1 text-gray-600">
                            {t('details.memberSince') || 'วันที่เป็นสมาชิก:'} {formatDate(new Date(selectedCustomer.createdAt))}
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h3 className="text-sm font-bold text-gray-900">{t('details.recentActivity') || 'ประวัติการสั่งซื้อล่าสุด'}</h3>
                        </div>

                        <div className="space-y-3">
                          {(selectedCustomer.orders && selectedCustomer.orders.length > 0) ? (
                            selectedCustomer.orders
                              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                              .slice(0, 3)
                              .map((order) => (
                                <div key={order.id} className="flex items-center justify-between text-sm p-2 bg-white lg:bg-transparent border border-gray-100 lg:border-transparent hover:bg-gray-50 rounded-lg transition-colors shadow-xs lg:shadow-none">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg hidden lg:block">
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
                            <p className="text-sm text-gray-400 text-center py-4">{t('details.noOrders') || 'ยังไม่มีประวัติการสั่งซื้อ'}</p>
                          )}
                        </div>
                      </div>

                    </div>
                  </>
                );
              })()
            ) : (
              <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center py-8 text-gray-400">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ChevronRight className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium text-gray-500">{t('emptyState.selectLeft') || 'เลือกรายชื่อลูกค้าทางซ้าย'}</p>
                <p className="text-sm mt-1">{t('emptyState.toViewDetails') || 'เพื่อดูรายละเอียด ประวัติ หรือทำรายการ'}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}