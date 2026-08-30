import React from 'react';

const Card = ({ children, className = '', title, subtitle, icon: Icon, footer }) => {
  return (
    <div className={`card-3d p-6 flex flex-col gap-4 group transition-all duration-300 ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-primary/8 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-semibold text-main tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs font-medium text-muted mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
      {footer && (
        <div className="pt-4 border-t border-border mt-auto">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
