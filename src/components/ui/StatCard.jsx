import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend }) => {
  const colorMap = {
    primary: { icon: 'bg-primary/10 text-primary', grad: 'stat-blue' },
    blue: { icon: 'bg-blue-500/10 text-blue-500', grad: 'stat-blue' },
    purple: { icon: 'bg-violet-500/10 text-violet-500', grad: 'stat-purple' },
    amber: { icon: 'bg-amber-500/10 text-amber-500', grad: 'stat-amber' },
    rose: { icon: 'bg-rose-500/10 text-rose-500', grad: 'stat-rose' },
    green: { icon: 'bg-emerald-500/10 text-emerald-500', grad: 'stat-green' },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className={`card-3d ${c.grad} p-6 min-h-[160px] flex flex-col justify-between group cursor-default`}>
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.icon} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full text-[11px] font-semibold">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-muted mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-main tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
