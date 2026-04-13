import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  loading = false,
  icon: Icon,
  type = 'button'
}) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20 active:scale-95',
    secondary: 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 active:scale-95',
    outline: 'bg-transparent border border-primary-500/30 text-primary-400 hover:bg-primary-500/10 active:scale-95',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 active:scale-95',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative px-6 py-3 rounded-2xl font-bold transition-all duration-300 
        flex items-center justify-center gap-2 group overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
        ${variants[variant]}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none" />
      
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
