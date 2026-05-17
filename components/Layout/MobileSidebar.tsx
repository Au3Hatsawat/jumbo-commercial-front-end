'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/routing';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Store,
  X,
  Settings2,
  RulerDimensionLine,
  SquareStack,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NavItem } from '@/libs/types/nav';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const navItems: NavItem[] = [
    { href: '/dashboard', label: t('dashboard'), icon: Home },
    { href: '/pos', label: t('pos'), icon: ShoppingCart },
    { href: '/products', label: t('products'), icon: Package },
    { href: '/orders', label: t('orders'), icon: BarChart3 },
    { href: '/customers', label: t('customers'), icon: Users },
    {
      href: [
        { href: '/settings/categories', label: t('categories'), icon: SquareStack },
        { href: '/settings/units', label: t('units'), icon: RulerDimensionLine },
      ],
      label: t('settings'),
      icon: Settings2
    }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">จัมโบ้พาณิชย์</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              if (Array.isArray(item.href)) {
                const isOpenDropdown = openDropdown === item.label;
                const hasActiveChild = item.href.some((subItem) => pathname === subItem.href);

                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`
                        w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-150
                        ${hasActiveChild
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <item.icon className={`
                          w-5 h-5 shrink-0 mr-3
                          ${hasActiveChild ? 'text-emerald-600' : 'text-gray-500'}
                        `} />
                        <span className="font-medium text-base">
                          {item.label}
                        </span>
                      </div>
                      {isOpenDropdown ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    </button>

                    {isOpenDropdown && (
                      <div className="pl-11 pr-3 space-y-1 mt-1 mb-2 animate-in slide-in-from-top-2 duration-200">
                        {item.href.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={onClose}
                              className={`
                                flex items-center rounded-lg transition-all duration-150 px-3 py-2.5 text-sm
                                ${isSubActive
                                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }
                              `}
                            >
                              <subItem.icon className={`w-4 h-4 mr-3 shrink-0 ${isSubActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose} 
                  className={`
                    flex items-center px-3 py-3 rounded-xl transition-all duration-150
                    ${isActive
                      ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon className={`
                    w-5 h-5 shrink-0 mr-3
                    ${isActive ? 'text-emerald-600' : 'text-gray-500'}
                  `} />
                  <span className="font-medium text-base">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50/50">
          <div className="p-3 rounded-xl bg-gray-100/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">ระบบ POS</p>
              <p className="text-xs text-gray-500">เวอร์ชัน 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}