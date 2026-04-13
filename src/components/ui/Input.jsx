import React from 'react';

const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
        )}
        <input
          {...props}
          className={`
            w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 
            ${Icon ? 'pl-12' : 'px-6'} pr-4 text-white placeholder:text-slate-600
            focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
            outline-none transition-all duration-300 font-medium
            ${error ? 'border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-500' : ''}
          `}
        />
      </div>
      {error && (
        <p className="text-xs font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
