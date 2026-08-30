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
                    <h1 className="text-3xl font-semibold text-main tracking-tight">
                        My <span className="text-primary">Workspace</span>
                    </h1>
                    <p className="text-muted text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
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
                    <div className="card-3d p-6 md:p-8 rounded-2xl relative overflow-hidden group">
                        
                        <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center relative z-10">
                            <div className="relative">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-surface shadow-md relative group-hover:scale-105 transition-transform duration-500">
                                    {profile?.photo_path ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/uploads/documents/${profile.photo_path}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary bg-primary/10">
                                            {user?.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 p-1.5 bg-success rounded-full shadow-lg border-2 border-surface">
                                    <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-6 text-center md:text-left w-full">
                                <div className="space-y-1">
                                    <h2 className="text-3xl md:text-4xl font-bold text-main tracking-tight truncate max-w-full">{profile?.username || user?.username}</h2>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 mt-2">
                                         <p className="text-primary font-medium tracking-wider uppercase text-xs bg-primary/10 px-3 py-1 rounded-full border border-primary/20 truncate">
                                            {profile?.email || 'N/A'}
                                         </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 pt-4">
                                    {[
                                        { label: 'Block', val: profile?.block || '—' },
                                        { label: 'Floor', val: profile?.floor || '—' },
                                        { label: 'Room', val: `${profile?.room_number || '—'}-${profile?.bed_number || '—'}` },
                                        { label: 'Rent', val: `₹${profile?.rent_amount || 0}`, color: 'text-success' }
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 bg-app rounded-xl border border-border text-center transition-all">
                                            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">{item.label}</p>
                                            <p className={`text-base font-semibold ${item.color || 'text-main'}`}>{item.val}</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                {[
                                    { label: 'Morning', val: todayMenu.breakfast, bg: 'bg-warning/10', color: 'text-warning' },
                                    { label: 'Midday', val: todayMenu.lunch, bg: 'bg-primary/10', color: 'text-primary' },
                                    { label: 'Twilight', val: todayMenu.dinner, bg: 'bg-indigo-500/10', color: 'text-indigo-500' }
                                ].map((m, i) => (
                                    <div key={i} className={`p-6 ${m.bg} rounded-2xl transition-all group text-center`}>
                                        <p className={`text-xs font-semibold ${m.color} uppercase tracking-wider mb-2`}>{m.label}</p>
                                        <p className="text-main font-semibold text-lg">{m.val || '—'}</p>
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
                                    <div key={n._id || i} className={`p-5 rounded-xl border transition-all ${n.priority === 'urgent' ? 'border-l-4 border-l-danger bg-danger/5' : 'border-l-4 border-l-primary bg-app'}`}>
                                        <div className={`flex items-start gap-3 font-semibold text-sm mb-2 ${n.priority === 'urgent' ? 'text-danger' : 'text-primary'}`}>
                                            <h4 className="flex-1 leading-tight">{n.title}</h4>
                                        </div>
                                        <p className="text-muted text-xs leading-relaxed line-clamp-3">{n.content}</p>
                                        <div className="mt-4 flex items-center justify-between text-xs font-medium text-muted uppercase tracking-wider">
                                            <span>{new Date(n.created_at).toLocaleDateString()}</span>
                                            {n.priority === 'urgent' && <span className="text-danger">Urgent Pulse</span>}
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
                                    <div key={c._id || i} className="p-5 bg-app border border-border rounded-xl hover:border-primary/30 transition-all flex flex-col gap-4 group">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-main font-semibold text-sm tracking-tight leading-none truncate pr-4">{c.title}</h4>
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${ c.status === 'resolved' ? 'bg-success/10 text-success' :
                                                c.status === 'in_progress' ? 'bg-primary/10 text-primary' : 
                                                'bg-warning/10 text-warning'
                                            }`}>
                                                {c.status?.replace('_', ' ') || 'pending'}
                                            </span>
                                        </div>
                                        <p className="text-muted text-sm font-medium leading-relaxed line-clamp-2">{c.content}</p>
                                        <div className="flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity pt-2 border-t border-border">
                                            <span className="text-xs font-medium text-muted uppercase tracking-wider">{new Date(c.created_at).toLocaleDateString()}</span>
                                            <ArrowUpRight className="w-4 h-4 text-primary" />
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
                        <div className="p-6 bg-app rounded-xl border border-border space-y-6 text-center">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted uppercase tracking-wider">Active Deposit</p>
                                <p className="text-4xl font-semibold text-main">₹{profile?.deposit || 0}</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center card-3d p-4 rounded-xl">
                                    <span className="text-xs font-medium text-muted uppercase tracking-wider">Compliance</span>
                                    <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${profile?.deposit_refund_status === 'refunded' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                        {profile?.deposit_refund_status?.replace('_', ' ') || 'Secured'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Network Access */}
                    <Card title="Network Fabrics" icon={Wifi} className="flex flex-col max-h-[450px]">
                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                            {wifiConfigs.length > 0 ? wifiConfigs.map((w, i) => (
                                <div key={i} className="bg-app rounded-xl p-5 border border-border space-y-4">
                                    <div className="flex items-center justify-between border-b border-border pb-4">
                                        <div>
                                            <h3 className="text-main font-semibold text-sm tracking-tight">{w.ssid || w.network_name}</h3>
                                            <p className="text-xs font-medium text-muted uppercase tracking-wider mt-1">Block {w.block} • Floor {w.floor}</p>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${w.service_status === 'Active' || w.status === 'Active' ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg card-3d cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setShowWifiPwd(p => p === w._id ? null : w._id)}>
                                        <div>
                                            <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">Access Credential</p>
                                            <p className="text-main font-semibold text-sm font-mono tracking-wider">
                                                {showWifiPwd === w._id ? (w.password || w.network_password) : '••••••••'}
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium text-primary uppercase tracking-wider">
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
                                    className="flex items-center gap-4 p-4 bg-app rounded-xl border border-border hover:border-primary/30 transition-all group"
                                >
                                    <div className="p-3 bg-success/10 rounded-lg text-success">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-main font-semibold text-sm tracking-tight">Verified Identity</p>
                                        <p className="text-muted text-[10px] font-medium uppercase tracking-wider mt-0.5">Gov Proof Vaulted</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-primary transition-all" />
                                </a>
                            )}
                            <div className="p-4 text-center border-2 border-dashed border-border rounded-xl">
                               <p className="text-xs font-medium text-muted uppercase tracking-wider">End-to-End Encrypted</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentView;
