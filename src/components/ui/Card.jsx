import React from 'react';

const Card = ({ children, className = '', title, subtitle, icon: Icon, footer }) => {
  return (
    <div className={`glass-card p-6 flex flex-col gap-4 group hover:border-primary-500/30 transition-all duration-500 ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-primary-500/10 rounded-xl text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-black text-white tracking-tight">{title}</h3>}
              {subtitle && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
      {footer && (
        <div className="pt-4 border-t border-white/5 mt-auto">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
