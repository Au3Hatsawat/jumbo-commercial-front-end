'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Users, BarChart3, Store, Menu } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/pos', label: 'ระบบขาย', icon: ShoppingCart },
  { href: '/products', label: 'จัดการสินค้า', icon: Package },
  { href: '/orders', label: 'ประวัติการขาย', icon: BarChart3 },
  { href: '/customers', label: 'ลูกค้า', icon: Users },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  
  return (
    <div 
      className={`
        bg-white border-r border-gray-200
        flex flex-col shadow-sm transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`h-16 flex items-center border-b border-gray-200 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">จัมโบ้พาณิชย์</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`
                  flex items-center rounded-lg transition-all duration-150
                  ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon className={`
                  w-5 h-5 shrink-0
                  ${isActive ? 'text-emerald-600' : 'text-gray-500'}
                  ${!isCollapsed && 'mr-3'}
                `} />
                
                {!isCollapsed && (
                  <span className="font-medium text-sm">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`
          p-3 border-t border-gray-200
          ${isCollapsed ? 'text-center' : ''}
        `}>
          <div className={`
            p-2.5 rounded-lg bg-gray-50
            ${isCollapsed ? 'flex justify-center' : ''}
          `}>
            {isCollapsed ? (
              <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">ระบบ POS</p>
                <p className="text-gray-500">เวอร์ชัน 1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
