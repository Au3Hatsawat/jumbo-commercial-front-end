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
  Menu,
  Settings2,
  RulerDimensionLine,
  SquareStack,
  ChevronDown,
  ChevronRight,
  LucideIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NavItem } from '@/libs/types/nav';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
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
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            if (Array.isArray(item.href)) {
              const isOpen = openDropdown === item.label;
              const hasActiveChild = item.href.some((subItem) => pathname === subItem.href);

              return (
                <div key={item.label} className="relative group space-y-1">
                  <button
                    onClick={() => {
                      if (!isCollapsed) {
                        toggleDropdown(item.label);
                      }
                    }}
                    className={`
                      w-full flex items-center justify-between rounded-lg transition-all duration-150
                      ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                      ${hasActiveChild
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className="flex items-center">
                      <item.icon className={`
                        w-5 h-5 shrink-0
                        ${hasActiveChild ? 'text-emerald-600' : 'text-gray-500'}
                        ${!isCollapsed && 'mr-3'}
                      `} />
                      {!isCollapsed && (
                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {isCollapsed && (
                    <div className="absolute left-full top-0 hidden group-hover:block z-50 pl-2">
                      <div className="w-48 bg-white shadow-lg border border-gray-100 rounded-lg py-1.5">
                        <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 border-b border-gray-50 mb-1">
                          {item.label}
                        </div>
                        {item.href.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`
                                flex items-center px-4 py-2 text-sm transition-colors
                                ${isSubActive
                                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                              `}
                            >
                              <subItem.icon className={`w-4 h-4 mr-3 shrink-0 ${isSubActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {isOpen && !isCollapsed && (
                    <div className="pl-11 space-y-1 mt-1">
                      {item.href.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`
                              flex items-center rounded-lg transition-all duration-150 px-3 py-2 text-sm
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