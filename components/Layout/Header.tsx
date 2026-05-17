'use client';

import { Clock, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from '@/routing';
import { useTranslations, useLocale } from 'next-intl';

import LanguageSwitcher from '../ui/LanguageSwitcher';
import { getPageTranslationKey } from '@/utils/langutils';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const locale = useLocale(); 
  const t = useTranslations('header.pageNames');

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const currentLocaleCode = locale === 'th' ? 'th-TH' : 'en-US';

    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString(currentLocaleCode, { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: locale !== 'th'
      }));
      setCurrentDate(now.toLocaleDateString(currentLocaleCode, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); 
    return () => clearInterval(interval);
  }, [locale]);

  const translationKey = getPageTranslationKey(pathname);
  const pageName = t(translationKey);

  return (
    <header className="h-16 bg-white border-b border-gray-200 shrink-0">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        
        <div className="flex items-center space-x-3">
          
          <button 
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {pageName}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 md:space-x-3">

          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 px-3 py-1.5 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>{currentTime}</span>
            <span className="text-gray-400">•</span>
            <span>{currentDate}</span>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

        </div>
      </div>
    </header>
  );
}