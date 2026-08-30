import React from 'react';
import { 
    Users, DoorOpen, CreditCard, Clock, 
    Settings2, ArrowRight, Zap, Droplets, 
    Wifi, AlertCircle, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';

const AdminView = ({ 
    stats, 
    utilitySummary, 
    complaints, 
    notices, 
    onAction 
}) => {
    return (
        <div className="space-y-6 w-full page-enter pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-main tracking-tight">
                        Welcome back 👋
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        Here's what's happening with your hostel today.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    All systems operational
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Total Students" 
                    value={stats.totalStudents} 
                    icon={Users} 
                    color="blue" 
                    trend="+12% this month"
                />
                <StatCard 
                    title="Occupancy Rate" 
                    value={stats.occupancy} 
                    icon={DoorOpen} 
                    color="purple" 
                />
                <StatCard 
                    title="Pending Payments" 
                    value={stats.pendingPayments} 
                    icon={CreditCard} 
                    color="amber" 
                />
                <StatCard 
                    title="Active Visitors" 
                    value={stats.activeVisitors} 
                    icon={Clock} 
                    color="rose" 
                />
            </div>

            {/* Infrastructure Overview */}
            <div className="card-3d p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-main tracking-tight">Quick Actions</h2>
                            <p className="text-muted text-xs mt-0.5">Manage hostel utilities & infrastructure</p>
                        </div>
                    </div>
                    <a href="/utilities" className="group">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/15 rounded-lg text-primary font-medium text-xs hover:bg-primary/10 transition-all">
                            View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Washing Machines', val: utilitySummary.washing, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                        { label: 'Water Dispensers', val: utilitySummary.water, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                        { label: 'WiFi Networks', val: utilitySummary.wifi, icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                        { label: 'Open Issues', val: complaints.filter(c => c.category === 'maintenance').length, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' }
                    ].map((item, i) => (
                        <div key={i} className={`${item.bg} rounded-xl p-4 transition-all group cursor-default hover:scale-[1.02]`}>
                             <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center mb-3`}>
                                <item.icon className="w-5 h-5" />
                             </div>
                             <h4 className="text-2xl font-bold text-main">{item.val}</h4>
                             <p className="text-muted text-xs font-medium mt-0.5">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Complaints */}
                <div className="lg:col-span-2 card-3d p-6 flex flex-col h-[480px]">
                    <div className="flex items-center justify-between mb-5 shrink-0">
                        <h2 className="text-lg font-semibold text-main flex items-center gap-2.5 tracking-tight">
                            <AlertTriangle className="w-5 h-5 text-danger" /> Complaints
                        </h2>
                        <span className="badge bg-danger/10 text-danger">
                            {complaints.filter(c => c.status !== 'resolved').length} Pending
                        </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
                        {complaints.map(c => (
                            <div key={c._id} className="p-4 bg-app rounded-xl border border-border/50 hover:border-primary/20 transition-all flex flex-col gap-3">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="min-w-0">
                                        <h4 className="text-main font-semibold text-sm truncate">{c.title}</h4>
                                        <p className="text-xs text-muted mt-0.5">{c.student_name || 'Anonymous'}</p>
                                    </div>
                                    <span className={`badge whitespace-nowrap ${
                                        c.status === 'resolved' ? 'bg-success/10 text-success' :
                                        c.status === 'in_progress' ? 'bg-primary/10 text-primary' : 
                                        'bg-warning/10 text-warning'
                                    }`}>
                                        {c.status?.replace('_', ' ') || 'pending'}
                                    </span>
                                </div>
                                <p className="text-muted text-sm leading-relaxed line-clamp-2">{c.content}</p>
                                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                    <span className="text-muted text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
                                    <button 
                                        onClick={() => onAction(c)}
                                        className="text-primary font-medium text-xs flex items-center gap-1.5 hover:gap-2.5 transition-all"
                                    >
                                        Take Action <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {complaints.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center gap-3 text-muted">
                                <CheckCircle2 className="w-12 h-12 opacity-20" />
                                <p className="text-sm font-medium">No complaints — all clear!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notices */}
                <div className="card-3d p-6 flex flex-col h-[480px]">
                     <h2 className="text-lg font-semibold text-main mb-5 flex items-center gap-2.5 tracking-tight shrink-0">
                        <Clock className="w-5 h-5 text-warning" /> Recent Notices
                     </h2>
                     <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
                        {notices.map(n => (
                            <div key={n._id} className={`p-4 bg-app rounded-xl border border-border/50 flex flex-col gap-2 transition-all hover:border-primary/20 ${n.priority === 'urgent' ? 'border-l-[3px] border-l-danger' : 'border-l-[3px] border-l-primary'}`}>
                                <p className={`font-semibold text-sm leading-tight truncate ${n.priority === 'urgent' ? 'text-danger' : 'text-main'}`}>
                                    {n.priority === 'urgent' && <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />}
                                    {n.title}
                                </p>
                                <p className="text-muted text-xs leading-relaxed line-clamp-2">{n.content}</p>
                                <p className="text-muted text-[11px] mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                        {notices.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center gap-3 text-muted">
                                <Clock className="w-12 h-12 opacity-20" />
                                <p className="text-sm font-medium">No notices yet</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AdminView;
