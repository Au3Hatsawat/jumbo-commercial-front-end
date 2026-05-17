'use client';

import React, { HTMLAttributes } from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  type: AlertType;
  message: string;
  description?: string | React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
}

const config = {
  success: {
    icon: CheckCircle,
    base: 'bg-green-50 border-green-200 text-green-800',
    iconColor: 'text-green-500',
    buttonHover: 'hover:bg-green-100',
  },
  error: {
    icon: XCircle,
    base: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-500',
    buttonHover: 'hover:bg-red-100',
  },
  warning: {
    icon: AlertTriangle,
    base: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconColor: 'text-yellow-500',
    buttonHover: 'hover:bg-yellow-100',
  },
  info: {
    icon: Info,
    base: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-500',
    buttonHover: 'hover:bg-blue-100',
  },
};

export const Alert: React.FC<AlertProps> = ({ 
  type, 
  message, 
  description, 
  onClose, 
  closable = true,
  className, 
  ...rest 
}) => {
  const { icon: Icon, base, iconColor, buttonHover } = config[type];

  return (
    <div
      className={`
        p-4 rounded-lg border 
        flex items-start justify-between 
        ${base} 
        ${className} 
        transition-all duration-300
      `}
      role="alert"
      {...rest} 
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} aria-hidden="true" />
        
        {/* Content */}
        <div>
          <h4 className="text-sm font-semibold">{message}</h4>
          {description && (
            <p className="text-sm mt-1 opacity-90">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Close Button */}
      {closable && onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`
            ml-4 p-1 rounded-md 
            shrink-0 transition-colors 
            ${buttonHover}
          `}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};