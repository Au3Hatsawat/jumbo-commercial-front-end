'use client';

import React from 'react';
import { Alert } from '@/components/ui/Alert'; 
import useToastStore from '@/libs/store/alertStore'; 

export const GlobalToaster: React.FC = () => {
  const { message, type, visible, hideToast } = useToastStore();

  if (!visible || !message || !type) return null;

  return (
    <div 
      className="fixed top-4 right-1/2 translate-x-1/2 z-1000 transition-all duration-300 ease-out"
    >
      <Alert 
          type={type} 
          message={message} 
          onClose={hideToast} 
          className="w-[320px] shadow-xl" 
      />
    </div>
  );
};