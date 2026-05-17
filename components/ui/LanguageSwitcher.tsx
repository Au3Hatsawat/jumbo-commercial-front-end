'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/routing';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = locale === 'th' ? 'en' : 'th';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-600 transition-colors"
    >
      <Languages className="w-4 h-4" />
      <span className="font-medium uppercase">{locale}</span>
    </button>
  );
}