'use client';

import { Settings, Clock, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pos': 'ระบบขาย (POS)',
  '/products': 'จัดการสินค้า',
  '/orders': 'ประวัติการขาย',
  '/customers': 'จัดการลูกค้า',
};

export default function Header() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
      }));
      setCurrentDate(now.toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const pageName = pageNames[pathname] || 'ภาพรวมระบบ';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex-shrink-0">
      <div className="h-full flex items-center justify-between px-6">
        
        {/* Page Title */}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {pageName}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          
          {/* Date & Time */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 px-3 py-1.5 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>{currentTime}</span>
            <span className="text-gray-400">•</span>
            <span>{currentDate}</span>
          </div>
          
          {/* Notifications */}
          <button 
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          {/* Settings */}
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

        </div>
      </div>
    </header>
  );
}
