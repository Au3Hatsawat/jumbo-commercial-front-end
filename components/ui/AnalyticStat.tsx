import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AnalyticStatProps {
  title: string;
  value: string;
  icon: LucideIcon;
  theme: 'blue' | 'emerald' | 'amber' | 'red' | 'gray';
  subText?: React.ReactNode;
}

export const AnalyticStat: React.FC<AnalyticStatProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  theme, 
  subText 
}) => {
  const themes = {
    blue: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-600', 
      valueColor: 'text-gray-800' 
    },
    emerald: { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-600', 
      valueColor: 'text-emerald-600' 
    },
    amber: { 
      bg: 'bg-amber-50', 
      text: 'text-amber-600', 
      valueColor: 'text-gray-800' 
    },
    red: { 
      bg: 'bg-red-50', 
      text: 'text-red-600', 
      valueColor: 'text-red-600' 
    },
    gray: { 
      bg: 'bg-gray-50', 
      text: 'text-gray-600', 
      valueColor: 'text-gray-800' 
    },
  };

  const color = themes[theme];

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${color.valueColor}`}>{value}</h3>
        </div>
        <div className={`w-12 h-12 ${color.bg} rounded-full flex items-center justify-center ${color.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {subText && (
        <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-500 flex items-center">
          {subText}
        </div>
      )}
    </div>
  );
};