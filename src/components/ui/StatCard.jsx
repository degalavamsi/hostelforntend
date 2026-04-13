import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend }) => {
  const colors = {
    primary: 'bg-primary-500/10 text-primary-400 group-hover:bg-primary-500 group-hover:text-white',
    blue: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
    purple: 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
    amber: 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white',
    rose: 'bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-white',
  };

  const glows = {
    primary: 'bg-primary-500/10',
    blue: 'bg-blue-500/10',
    purple: 'bg-indigo-500/10',
    amber: 'bg-amber-500/10',
    rose: 'bg-rose-500/10',
  };

  return (
    <div className="glass-card p-6 min-h-[160px] flex flex-col justify-between group hover:border-white/20 relative overflow-hidden">
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${glows[color]}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className={`p-3 rounded-2xl transition-all duration-500 ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
