import React from 'react';
import { 
    Users, DoorOpen, CreditCard, Clock, 
    Settings2, ArrowRight, Zap, Droplets, 
    Wifi, AlertCircle, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';

const AdminView = ({ 
    stats, 
    utilitySummary, 
    complaints, 
    notices, 
    onAction 
}) => {
    return (
        <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-10">
            {/* Header */}
            <div className="space-y-1 px-1">
                <h1 className="text-3xl font-black text-white tracking-tighter leading-none">
                    Command <span className="text-primary-500">Center</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                    Enterprise Overview • Real-time Monitoring
                </p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard 
                    title="Active Admissions" 
                    value={stats.totalStudents} 
                    icon={Users} 
                    color="blue" 
                    trend="+12% this month"
                />
                <StatCard 
                    title="System Occupancy" 
                    value={stats.occupancy} 
                    icon={DoorOpen} 
                    color="purple" 
                />
                <StatCard 
                    title="Pending Dues" 
                    value={stats.pendingPayments} 
                    icon={CreditCard} 
                    color="amber" 
                />
                <StatCard 
                    title="Visitor Pulse" 
                    value={stats.activeVisitors} 
                    icon={Clock} 
                    color="rose" 
                />
            </div>

            {/* Infrastructure Control Core */}
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-3xl md:rounded-[48px] p-6 md:p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-10 gap-6">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="p-3 md:p-4 bg-primary-600 rounded-xl md:rounded-[20px] shadow-2xl shadow-primary-900/40">
                            <Settings2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter">Infrastructure Hub</h2>
                            <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1">Core Utility Matrix</p>
                        </div>
                    </div>
                    <a href="/utilities" className="group w-full md:w-auto">
                        <div className="flex items-center justify-center md:justify-start gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-primary-400 font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all hover:border-primary-500">
                            Manage Modules <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {[
                        { label: 'Laundry nodes', val: utilitySummary.washing, icon: Zap, color: 'amber', subtitle: 'Machines Active' },
                        { label: 'Hydration', val: utilitySummary.water, icon: Droplets, color: 'cyan', subtitle: 'Status Controlled' },
                        { label: 'Network Fabric', val: utilitySummary.wifi, icon: Wifi, color: 'indigo', subtitle: 'Configured Floors' },
                        { label: 'Energy Alerts', val: complaints.filter(c => c.category === 'maintenance').length, icon: AlertCircle, color: 'rose', subtitle: 'Pending Issues' }
                    ].map((item, i) => (
                        <div key={i} className={`bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-6 hover:border-${item.color}-500/30 transition-all group relative overflow-hidden`}>
                             <div className={`absolute -right-4 -bottom-4 w-20 h-20 bg-${item.color}-500/5 blur-2xl group-hover:bg-${item.color}-500/10 transition-all`} />
                             <div className="flex items-center gap-3 mb-4 md:mb-6 relative z-10">
                                <div className={`p-2 bg-${item.color}-500/10 rounded-xl text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-white font-black text-[10px] uppercase tracking-tight">{item.label}</h3>
                             </div>
                             <div className="flex items-end justify-between relative z-10">
                                <h4 className="text-3xl md:text-4xl font-black text-white tracking-tighter">{item.val}</h4>
                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-tight mb-1">{item.subtitle}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Resolution Desk */}
                <div className="lg:col-span-2 glass-card rounded-3xl md:rounded-[40px] p-6 md:p-8 flex flex-col h-[450px] md:h-[500px] relative overflow-hidden group">
                    <div className="absolute -left-10 -top-10 w-64 h-64 bg-primary-500/5 blur-[100px]" />
                    <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
                        <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                            <AlertTriangle className="w-5 h-5 text-rose-500" /> Resolution Desk
                        </h2>
                        <div className="hidden sm:flex items-center gap-2">
                             <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                    {complaints.filter(c => c.status !== 'resolved').length} Pending
                                </span>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto pr-2 md:pr-4 custom-scrollbar flex-1 relative z-10">
                        {complaints.map(c => (
                            <div key={c._id} className="p-5 md:p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-primary-500/30 transition-all group/item shadow-2xl flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                                    <div className="space-y-1 w-full max-w-full overflow-hidden">
                                        <h4 className="text-white font-black text-sm tracking-tight group-hover/item:text-primary-400 transition-colors uppercase truncate">{c.title}</h4>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase truncate">ID: {c.student_name || 'Anonymous'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl border w-fit whitespace-nowrap ${
                                        c.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        c.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                        {c.status?.replace('_', ' ') || 'pending'}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed font-medium line-clamp-2">{c.content}</p>
                                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</p>
                                    <button 
                                        onClick={() => onAction(c)}
                                        className="text-primary-400 hover:text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-xl hover:bg-primary-600 border border-primary-500/20 transition-all"
                                    >
                                        Execute Action <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {complaints.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-6">
                                <CheckCircle2 className="w-20 h-20 opacity-10" />
                                <p className="text-2xl md:text-3xl font-black italic tracking-widest opacity-20 text-center uppercase">Zero Pending</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Broadcast Feed */}
                <div className="glass-card rounded-3xl md:rounded-[40px] p-6 md:p-8 flex flex-col h-[450px] md:h-[500px] relative overflow-hidden group">
                     <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/5 blur-[100px]" />
                     <h2 className="text-lg md:text-xl font-black text-white mb-6 md:mb-8 flex items-center gap-3 uppercase tracking-tighter shrink-0 relative z-10">
                        <Clock className="w-5 h-5 text-amber-500" /> Active Broadcasts
                     </h2>
                     <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-10">
                        {notices.map(n => (
                            <div key={n._id} className={`p-5 md:p-6 border rounded-3xl flex flex-col transition-all hover:scale-[1.02] ${n.priority === 'urgent' ? 'bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-900/10' : 'bg-primary-500/5 border-primary-500/20'}`}>
                                <div className={`flex items-start gap-3 font-black text-sm mb-3 leading-tight ${n.priority === 'urgent' ? 'text-rose-400' : 'text-primary-400'}`}>
                                    {n.priority === 'urgent' && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                                    <span className="truncate">{n.title}</span>
                                </div>
                                <p className="text-slate-500 text-xs leading-relaxed font-medium line-clamp-3">{n.content}</p>
                                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-black uppercase tracking-widest mt-auto">
                                    <span className="text-slate-700">Enterprise Sync</span>
                                    <span className="text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        {notices.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-6 opacity-20">
                                <Clock className="w-20 h-20" />
                                <p className="text-xl md:text-2xl font-black italic tracking-widest uppercase text-center">Broadcast Silent</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AdminView;
