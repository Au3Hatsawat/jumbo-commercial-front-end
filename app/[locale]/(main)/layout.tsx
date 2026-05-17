'use client';
import { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import MobileSidebar from '@/components/Layout/MobileSidebar';
import Header from '@/components/Layout/Header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      
      <div className="hidden md:flex h-full">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        /> 
      </div>

      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        
    
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} /> 

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}