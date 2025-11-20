import { ButtonHTMLAttributes, FC, HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: FC<ButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false, 
  variant = 'default', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-medium transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const variants = {
    default: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300 shadow-sm hover:shadow',
    outline: 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-emerald-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 shadow-sm hover:shadow',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: FC<InputProps> = ({ 
  label, 
  id, 
  className, 
  required,
  error,
  helperText,
  ...props 
}) => {
  const inputId = id || props.name;

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3.5 py-2 text-sm rounded-lg border 
          transition-all focus:outline-none
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
            : 'border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
          }
          disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
          placeholder:text-gray-400
          ${className || ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string | number; label: string }[];
}

export const Select: FC<SelectProps> = ({ 
  label, 
  id, 
  className, 
  required,
  error,
  options,
  children,
  ...props 
}) => {
  const selectId = id || props.name;

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label 
          htmlFor={selectId} 
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-3.5 py-2 text-sm rounded-lg border 
          transition-all focus:outline-none
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
            : 'border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
          }
          disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
          ${className || ''}
        `}
        {...props}
      >
        {options ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: FC<TextareaProps> = ({ 
  label, 
  id, 
  className, 
  required,
  error,
  helperText,
  ...props 
}) => {
  const textareaId = id || props.name;

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label 
          htmlFor={textareaId} 
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full px-3.5 py-2 text-sm rounded-lg border 
          transition-all focus:outline-none resize-none
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
            : 'border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
          }
          disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
          placeholder:text-gray-400
          ${className || ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
}

export const Card: FC<CardProps> = ({ 
  children, 
  className = '',
  variant = 'default',
  ...props 
}) => {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    outlined: 'bg-white border-2 border-gray-200',
  };

  return (
    <div 
      className={`rounded-xl ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: FC<HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody: FC<HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: FC<HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <div className={`px-6 py-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);


interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: FC<BadgeProps> = ({ 
  children, 
  className = '',
  variant = 'default',
  ...props 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};