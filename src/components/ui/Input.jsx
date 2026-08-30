import React from 'react';

const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-medium text-muted ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
        )}
        <input
          {...props}
          className={` w-full bg-app border border-border rounded-base py-3 ${Icon ? 'pl-12' : 'px-4'} pr-4 text-main placeholder:text-muted
            focus:ring-2 focus:ring-primary/20 focus:border-primary 
            outline-none transition-all duration-300 font-medium
            ${error ? 'border-danger focus:ring-danger/20' : ''}
          `}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-danger ml-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
