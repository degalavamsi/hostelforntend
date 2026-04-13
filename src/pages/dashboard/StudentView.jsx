import React from 'react';
import { 
    MessageSquarePlus, Bell, UtensilsCrossed, Calendar, 
    Trash2, ShieldCheck, Zap, Wifi, ArrowUpRight 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const StudentView = ({ 
    profile, 
    notifications, 
    notices, 
    complaints, 
    todayMenu, 
    wifiConfigs, 
    onOpenComplaint, 
    onDeleteNotif,
    showWifiPwd,
    setShowWifiPwd,
    user
}) => {
    return (
        <div className="space-y-10 w-full animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-tighter">
                        My <span className="text-primary-500">Workspace</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Session Active: {user?.username}
                    </p>
                </div>
                <Button 
                    variant="primary" 
                    icon={MessageSquarePlus} 
                    onClick={onOpenComplaint}
                    className="shadow-primary-600/20 w-full md:w-auto"
                >
                    Post Feedback
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Profile Card */}
                    <div className="premium-gradient glass-card p-6 md:p-8 rounded-3xl md:rounded-[40px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-[120px] group-hover:bg-primary-600/15 transition-all duration-1000" />
                        
                        <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center relative z-10">
                            <div className="relative">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[32px] overflow-hidden border-4 border-white/10 shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                                    {profile?.photo_path ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/uploads/documents/${profile.photo_path}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-700 bg-slate-900">
                                            {user?.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 rounded-lg shadow-lg border-2 border-slate-950 md:border-4 md:rounded-xl md:-bottom-2 md:-right-2 md:p-2">
                                    <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-6 text-center md:text-left w-full">
                                <div className="space-y-1">
                                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter truncate max-w-full">{profile?.username || user?.username}</h2>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4">
                                         <p className="text-primary-400 font-black tracking-widest uppercase text-[9px] bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20 truncate">
                                            {profile?.email || 'N/A'}
                                         </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 pt-2">
                                    {[
                                        { label: 'Block', val: profile?.block || '—' },
                                        { label: 'Floor', val: profile?.floor || '—' },
                                        { label: 'Room', val: `${profile?.room_number || '—'}-${profile?.bed_number || '—'}` },
                                        { label: 'Rent', val: `₹${profile?.rent_amount || 0}`, color: 'text-emerald-400' }
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all text-center">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                                            <p className={`text-sm font-black ${item.color || 'text-white'}`}>{item.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Culinary Board */}
                    <Card 
                        title="Culinary Board" 
                        subtitle={`Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`}
                        icon={UtensilsCrossed}
                        className="rounded-[40px]"
                    >
                        {todayMenu ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                {[
                                    { label: 'Morning', val: todayMenu.breakfast, color: 'amber' },
                                    { label: 'Midday', val: todayMenu.lunch, color: 'blue' },
                                    { label: 'Twilight', val: todayMenu.dinner, color: 'indigo' }
                                ].map((m, i) => (
                                    <div key={i} className={`p-6 bg-${m.color}-500/5 rounded-3xl border border-white/5 hover:border-${m.color}-500/30 transition-all group text-center`}>
                                        <p className={`text-[10px] font-black text-${m.color}-500 uppercase tracking-[0.2em] mb-4`}>{m.label}</p>
                                        <p className="text-white font-black text-xl group-hover:scale-110 transition-transform duration-500">{m.val || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-700 border-2 border-dashed border-slate-800/50 rounded-3xl">
                                <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                <p className="text-sm font-black italic opacity-30 uppercase tracking-widest">Menu being curated...</p>
                            </div>
                        )}
                    </Card>

                    {/* Announcements & Feedback Hub */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card title="Broadcasts" icon={Bell} className="h-[450px] flex flex-col">
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                                {notices.map((n, i) => (
                                    <div key={n._id || i} className={`p-5 rounded-3xl border transition-all hover:translate-x-1 ${n.priority === 'urgent' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-primary-500/5 border-primary-500/20'}`}>
                                        <div className={`flex items-start gap-3 font-black text-sm mb-2 ${n.priority === 'urgent' ? 'text-rose-400' : 'text-primary-400'}`}>
                                            <h4 className="flex-1 leading-tight">{n.title}</h4>
                                        </div>
                                        <p className="text-slate-400 text-xs leading-relaxed font-medium line-clamp-3">{n.content}</p>
                                        <div className="mt-4 flex items-center justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                                            <span>{new Date(n.created_at).toLocaleDateString()}</span>
                                            {n.priority === 'urgent' && <span className="text-rose-500">Urgent Pulse</span>}
                                        </div>
                                    </div>
                                ))}
                                {notices.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-800 opacity-20">
                                        <p className="text-[10px] font-black italic tracking-widest uppercase">Broadcast Silent</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card title="Resolution Hub" icon={MessageSquarePlus} className="h-[450px] flex flex-col">
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                                {complaints.map((c, i) => (
                                    <div key={c._id || i} className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-white/10 transition-all flex flex-col gap-4 group">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-white font-black text-sm tracking-tight leading-none truncate pr-4">{c.title}</h4>
                                            <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl shrink-0 ${
                                                c.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                c.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                {c.status?.replace('_', ' ') || 'pending'}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-[11px] font-medium leading-relaxed line-clamp-2">{c.content}</p>
                                        <div className="flex items-center justify-between opacity-30 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</span>
                                            <ArrowUpRight className="w-3.5 h-3.5 text-primary-400" />
                                        </div>
                                    </div>
                                ))}
                                {complaints.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-800 opacity-20">
                                        <p className="text-[10px] font-black italic tracking-widest uppercase">Zero Tickets</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Security Vault */}
                    <Card title="Security Vault" icon={ShieldCheck}>
                        <div className="p-8 bg-gradient-to-br from-primary-600/10 via-primary-500/5 to-transparent rounded-[32px] border border-white/10 space-y-8 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="space-y-2 relative z-10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Deposit</p>
                                <p className="text-5xl font-black text-white tracking-tighter shadow-primary-500/20">₹{profile?.deposit || 0}</p>
                            </div>
                            <div className="space-y-3 relative z-10">
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</span>
                                    <span className={`px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider ${profile?.deposit_refund_status === 'refunded' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        {profile?.deposit_refund_status?.replace('_', ' ') || 'Secured Stake'}
                                    </span>
                                </div>
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Verified Protocol Active</p>
                            </div>
                        </div>
                    </Card>

                    {/* Network Access */}
                    <Card title="Network Fabrics" icon={Wifi} className="flex flex-col max-h-[450px]">
                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                            {wifiConfigs.length > 0 ? wifiConfigs.map((w, i) => (
                                <div key={i} className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-4 hover:border-indigo-500/30 transition-all group/wifi">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                        <div>
                                            <h3 className="text-white font-black text-sm tracking-tight">{w.ssid || w.network_name}</h3>
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">Block {w.block} • Floor {w.floor}</p>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${w.service_status === 'Active' || w.status === 'Active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 group-hover/wifi:bg-black/40 transition-colors cursor-pointer" onClick={() => setShowWifiPwd(p => p === w._id ? null : w._id)}>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 leading-none">Access Credential</p>
                                            <p className="text-white font-black text-sm font-mono tracking-widest leading-none">
                                                {showWifiPwd === w._id ? (w.password || w.network_password) : '••••••••'}
                                            </p>
                                        </div>
                                        <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest group-hover/wifi:text-white transition-colors">
                                            {showWifiPwd === w._id ? 'Hide' : 'Show'}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center text-slate-800 opacity-20">
                                    <Wifi className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Zero Coverage</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Data Vault */}
                    <Card title="Data Vault" icon={Zap}>
                        <div className="space-y-4">
                            {profile?.id_proof_path && (
                                <a
                                    href={`${import.meta.env.VITE_API_URL}/uploads/documents/${profile.id_proof_path}`}
                                    target="_blank" rel="noreferrer"
                                    className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all group"
                                >
                                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-black text-sm tracking-tight mb-0.5">Verified Identity</p>
                                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none">Gov Proof Vaulted</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </a>
                            )}
                            <div className="p-5 text-center text-slate-800 border-2 border-dashed border-slate-800 rounded-3xl">
                               <p className="text-[9px] font-black uppercase tracking-widest opacity-20">End-to-End Encrypted</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentView;
