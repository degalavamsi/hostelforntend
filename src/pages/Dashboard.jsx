import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import {
    Users, DoorOpen, CreditCard, Bell,
    ArrowUpRight, TrendingUp, Clock, AlertTriangle, ShieldCheck,
    MessageSquarePlus, UtensilsCrossed, Calendar, X, PlusCircle,
    Loader2, ArrowRight, Zap, Droplets, Wifi, LayoutGrid, CheckCircle2, Settings2, AlertCircle, Trash2
} from 'lucide-react';
import FullPageLoader from '../components/FullPageLoader';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-primary-500/50 transition-all duration-500 flex flex-col justify-between h-full">
        <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500/5 blur-[40px] group-hover:bg-${color}-500/10 transition-colors`}></div>
        <div className="flex items-start justify-between mb-3 relative z-10">
            <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
                <Icon className={`w-4 h-4 text-${color}-400`} />
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full text-[9px] font-bold">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {trend}
                </div>
            )}
        </div>
        <div className="relative z-10">
            <p className="text-slate-500 text-[10px] font-extrabold mb-0.5 uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');

    const [stats, setStats] = useState({
        totalStudents: 0,
        occupancy: '0%',
        pendingPayments: 0,
        activeVisitors: 0
    });
    const [profile, setProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [payments, setPayments] = useState([]);
    const [notices, setNotices] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [todayMenu, setTodayMenu] = useState(null);
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [complaintForm, setComplaintForm] = useState({ title: '', content: '', category: 'general' });
    const [submittingComplaint, setSubmittingComplaint] = useState(false);
    const [loading, setLoading] = useState(true);
    const [wifiConfigs, setWifiConfigs] = useState([]);
    const [showWifiPwd, setShowWifiPwd] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        try {
            if (isAdmin) {
                const results = await Promise.allSettled([
                    api.get('/rooms/analytics/occupancy'),
                    api.get('/students/search?status=approved'),
                    api.get('/payments/dues'),
                    api.get('/visitors/all'),
                    api.get('/notices/'),
                    api.get('/notices/complaints/all'),
                    api.get('/facilities/all')
                ]);

                const [occupancyRes, studentsRes, duesRes, visitorsRes, noticesRes, complaintsRes, facilitiesRes] = results.map(r => r.status === 'fulfilled' ? r.value : { data: [] });

                setStats({
                    totalStudents: studentsRes.data?.length || 0,
                    occupancy: `${Math.round(((occupancyRes.data?.total_occupied || 0) / (occupancyRes.data?.total_capacity || 1)) * 100)}%`,
                    pendingPayments: duesRes.data?.length || 0,
                    activeVisitors: Array.isArray(visitorsRes.data) ? visitorsRes.data.filter(v => !v.time_out).length : 0
                });
                setNotices(noticesRes.data || []);
                setComplaints(complaintsRes.data || []);
                setFacilities(Array.isArray(facilitiesRes.data) ? facilitiesRes.data : []);
            } else {
                const results = await Promise.allSettled([
                    api.get('/auth/profile'),
                    api.get('/notifications/'),
                    api.get('/payments/history'),
                    api.get('/notices/'),
                    api.get('/notices/complaints/mine'),
                    api.get('/notices/menu'),
                    api.get('/facilities/all'),
                    api.get('/utilities/wifi')
                ]);

                const [profileRes, notifyRes, paymentsRes, noticesRes, complaintsRes, menuRes, facilitiesRes, wifiRes] = results.map(r => r.status === 'fulfilled' ? r.value : { data: null });

                if (profileRes.data) setProfile(profileRes.data);
                if (notifyRes.data) setNotifications(notifyRes.data);
                if (paymentsRes.data) setPayments(paymentsRes.data);
                if (noticesRes.data) setNotices(noticesRes.data);
                if (complaintsRes.data) setComplaints(complaintsRes.data);

                if (menuRes.data) {
                    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const menuArray = Array.isArray(menuRes.data) ? menuRes.data : [];
                    const todayData = menuArray.find(m => m.day === dayName);
                    if (todayData) setTodayMenu(todayData.menu);
                }
                // Set WiFi configs (backend returns all now, matching washing machine logic)
                if (wifiRes.data && Array.isArray(wifiRes.data)) {
                    setWifiConfigs(wifiRes.data);
                }
            }
        } catch (err) {
            console.error('Fetch failed:', err);
        } finally {
            setLoading(false);
        }
    }, [user, isAdmin]);

    const [utilitySummary, setUtilitySummary] = useState({ washing: 0, water: 0, wifi: 0 });

    const fetchAdminUtilities = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const [wash, water, wifi] = await Promise.all([
                api.get('/utilities/washing'),
                api.get('/utilities/water'),
                api.get('/utilities/wifi')
            ]);
            setUtilitySummary({
                washing: wash.data.length,
                water: water.data.length,
                wifi: wifi.data.length
            });
        } catch (err) {
            console.error('Utility summary fetch failed');
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchData();
        if (isAdmin) fetchAdminUtilities();
    }, [fetchData, fetchAdminUtilities, isAdmin]);

    const handleUpdateFacility = async (floor, type, status) => {
        if (!isAdmin) return;
        try {
            const floorData = facilities.find(f => f.floor === floor);
            if (!floorData) return;

            const updatedFacilities = { ...floorData.facilities, [type]: status };
            await api.put(`/facilities/floor/${floor}`, { facilities: updatedFacilities });
            fetchData();
        } catch (err) {
            alert('Failed to update facility');
        }
    };

    const handlePostComplaint = async (e) => {
        e.preventDefault();
        setSubmittingComplaint(true);
        try {
            await api.post('/notices/complaints', complaintForm);
            setIsComplaintModalOpen(false);
            setComplaintForm({ title: '', content: '', category: 'general' });
            fetchData();
        } catch (err) {
            alert('Failed to post complaint');
        } finally {
            setSubmittingComplaint(false);
        }
    };

    const deleteNotif = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) { console.error('Delete notif failed', err); }
    };

    if (loading && !profile && notices.length === 0) {
        return <FullPageLoader message="Initializing Workspace..." />;
    }

    if (user?.roles?.includes('student')) {
        return (
            <div className="space-y-12 w-full animate-in fade-in duration-700 pb-20">
                {/* Complaint Modal */}
                {isComplaintModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                        <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-3xl font-black text-white flex items-center gap-4">
                                    <MessageSquarePlus className="w-8 h-8 text-primary-500" /> Post Feedback
                                </h3>
                                <button onClick={() => setIsComplaintModalOpen(false)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl transition-all"><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handlePostComplaint} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Subject</label>
                                    <input
                                        required
                                        className="w-full bg-slate-800 border-none rounded-2xl p-5 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        placeholder="What is your concern?"
                                        value={complaintForm.title}
                                        onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Context</label>
                                    <select
                                        className="w-full bg-slate-800 border-none rounded-2xl p-5 text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        value={complaintForm.category}
                                        onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                                    >
                                        <option value="general">General Issue</option>
                                        <option value="maintenance">Maintenance Required</option>
                                        <option value="food">Food Quality</option>
                                        <option value="internet">Connectivity / WiFi</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Detailed Description</label>
                                    <textarea
                                        required
                                        rows="4"
                                        className="w-full bg-slate-800 border-none rounded-2xl p-5 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                                        placeholder="Explain the issue clearly..."
                                        value={complaintForm.content}
                                        onChange={(e) => setComplaintForm({ ...complaintForm, content: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submittingComplaint}
                                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary-900/20 transition-all flex items-center justify-center gap-3 text-lg"
                                >
                                    {submittingComplaint ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Raise Ticket'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-0.5">
                        <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">
                            My <span className="text-primary-500">Workspace</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-medium tracking-tight">Active session: {user?.username}</p>
                    </div>
                    <button
                        onClick={() => setIsComplaintModalOpen(true)}
                        className="bg-primary-600 hover:bg-primary-500 text-white font-black px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 text-xs whitespace-nowrap"
                    >
                        <MessageSquarePlus className="w-4 h-4" /> Post Feedback
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Profile Info - Expansive Glass */}
                        <div className="bg-slate-900/50 backdrop-blur-3xl border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden group min-h-[160px] flex items-center">
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-600/10 blur-[100px] group-hover:bg-primary-600/20 transition-all duration-1000"></div>
                            <div className="flex flex-col md:flex-row gap-6 items-center w-full relative z-10">
                                <div className="w-24 h-24 bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl relative flex-shrink-0 group-hover:scale-105 transition-transform">
                                    {profile?.photo_path ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/uploads/documents/${profile.photo_path}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=Profile"; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-700 bg-slate-900">
                                            {user?.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div className="space-y-0.5">
                                        <h2 className="text-xl font-black text-white tracking-tighter">{profile?.username || user?.username}</h2>
                                        <p className="text-primary-400 font-bold tracking-[0.2em] uppercase text-[9px]">{profile?.email || 'N/A'}</p>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all text-center">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-tight mb-1">Block</p>
                                            <p className="text-sm font-black text-white">{profile?.block || 'NA'}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all text-center">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-tight mb-1">Floor</p>
                                            <p className="text-sm font-black text-white">{profile?.floor || 'NA'}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all text-center">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-tight mb-1">Room / Bed</p>
                                            <p className="text-sm font-black text-white">{profile?.room_number || 'NA'}-{profile?.bed_number || 'NA'}</p>
                                        </div>
                                        <div className="p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/10 hover:bg-cyan-500/20 transition-all text-center">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-tight mb-1">Rent</p>
                                            <p className="text-sm font-black text-cyan-400 tracking-tight">₹{profile?.rent_amount || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Today's Menu Section - Symmetrical Row */}
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                                    <UtensilsCrossed className="w-5 h-5 text-amber-500" /> Culinary Board
                                </h2>
                                <div className="flex items-center gap-2 text-slate-400 font-black text-[9px] uppercase tracking-tight bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                    <Calendar className="w-3 h-3 text-primary-400" /> {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                                </div>
                            </div>
                            {todayMenu ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-5 bg-amber-500/5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all group min-h-[100px] flex flex-col justify-center text-center">
                                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Morning</p>
                                        <p className="text-white font-black text-lg group-hover:scale-105 transition-transform">{todayMenu.breakfast || '-'}</p>
                                    </div>
                                    <div className="p-5 bg-blue-500/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group min-h-[100px] flex flex-col justify-center text-center">
                                        <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Midday</p>
                                        <p className="text-white font-black text-lg group-hover:scale-105 transition-transform">{todayMenu.lunch || '-'}</p>
                                    </div>
                                    <div className="p-5 bg-indigo-500/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group min-h-[100px] flex flex-col justify-center text-center">
                                        <p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Twilight</p>
                                        <p className="text-white font-black text-lg group-hover:scale-105 transition-transform">{todayMenu.dinner || '-'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-10 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl">
                                    <p className="text-sm font-black italic opacity-30 uppercase tracking-widest">Menu being curated...</p>
                                </div>
                            )}
                        </div>

                        {/* Notices & Complaints Row - Equal Heights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col h-[400px]">
                                <h2 className="text-lg font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tighter shrink-0">
                                    <Bell className="w-5 h-5 text-amber-500" /> Announcements
                                </h2>
                                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                    {notices.map((n, i) => (
                                        <div key={n._id || i} className={`p-5 border rounded-2xl transition-all hover:scale-[1.01] ${n.priority === 'urgent' ? 'bg-red-500/5 border-red-500/20' : 'bg-primary-500/5 border-primary-500/20'}`}>
                                            <div className={`flex items-start gap-3 font-black text-sm mb-2 ${n.priority === 'urgent' ? 'text-red-400' : 'text-primary-400'}`}>
                                                {n.priority === 'urgent' && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                                                {n.title}
                                            </div>
                                            <p className="text-slate-400 text-xs leading-relaxed font-medium">{n.content}</p>
                                            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center opacity-30 text-[8px] font-black uppercase tracking-widest">
                                                <span>{new Date(n.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {notices.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-20">
                                            <p className="text-[10px] font-black italic tracking-widest uppercase">No Broadcasts</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col h-[400px]">
                                <h2 className="text-lg font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tighter shrink-0">
                                    <MessageSquarePlus className="w-5 h-5 text-rose-500" /> Resolution Hub
                                </h2>
                                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                    {complaints.map((c, i) => (
                                        <div key={c._id || i} className="p-5 bg-slate-800/10 border border-slate-700/50 rounded-2xl hover:bg-slate-800/20 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-white font-black text-sm tracking-tight leading-none">{c.title}</h4>
                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${c.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                                                    c.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                    {c.status?.replace('_', ' ') || 'pending'}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-[10px] mb-4 leading-relaxed font-medium line-clamp-2">{c.content}</p>
                                            <div className="flex items-center gap-3 border-t border-white/5 pt-3">
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {complaints.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-20">
                                            <p className="text-[10px] font-black italic tracking-widest uppercase">Clear Hub</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl h-fit">
                            <h2 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-indigo-500" /> Pulse Feed
                            </h2>
                            <div className="space-y-3">
                                {notifications.slice(0, 5).map((n, i) => (
                                    <div key={n._id || i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary-500/30 hover:bg-white/10 transition-all flex gap-3 group">
                                        <div className="p-2 h-fit bg-primary-600/10 rounded-lg text-primary-400 group-hover:bg-primary-600/30 transition-all">
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <p className="text-white text-xs font-bold leading-tight line-clamp-2">{n.message}</p>
                                            <p className="text-slate-600 text-[8px] uppercase font-black tracking-widest">{new Date(n.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteNotif(n._id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all shrink-0"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {notifications.length === 0 && (
                                    <div className="py-20 text-center text-slate-700">
                                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p className="text-sm font-black uppercase tracking-widest opacity-30">Zero Alerts</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600/10 blur-[60px]"></div>
                            <h2 className="text-lg font-black text-white mb-6 relative z-10">Safe Box</h2>
                            <div className="p-6 bg-gradient-to-br from-indigo-500/20 via-primary-500/10 to-transparent rounded-2xl border border-white/10 space-y-6 relative z-10">
                                <div className="space-y-2 text-center">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Vaulted Deposit</p>
                                    <p className="text-4xl font-black text-white tracking-widest drop-shadow-2xl">₹{profile?.deposit || 0}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Security Status</span>
                                        <span className={`px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-tighter ${profile?.deposit_refund_status === 'refunded' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {profile?.deposit_refund_status?.replace('_', ' ') || 'active stake'}
                                        </span>
                                    </div>
                                    <p className="text-[7px] text-center text-slate-600 font-bold uppercase tracking-tight mt-1">Verified compliance</p>
                                </div>
                            </div>
                        </div>

                        {/* === WiFi Network Card === */}
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-2xl overflow-hidden relative group flex flex-col max-h-[400px]">
                            <div className="absolute -right-8 -top-8 w-36 h-36 bg-indigo-600/10 blur-[60px] group-hover:bg-indigo-600/20 transition-all duration-700" />
                            <h2 className="text-base font-extrabold text-white mb-5 flex items-center gap-3 relative z-10 shrink-0">
                                <Wifi className="w-5 h-5 text-indigo-400" />
                                <span>WiFi Networks</span>
                            </h2>
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar relative z-10 flex-1">
                                {wifiConfigs.length > 0 ? wifiConfigs.map((w, idx) => (
                                    <div key={w._id || idx} className="bg-indigo-500/5 rounded-2xl p-4 border border-indigo-500/10 space-y-3">
                                        <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
                                            <div>
                                                <h3 className="text-white font-extrabold text-sm">{w.ssid || w.network_name || '—'}</h3>
                                                <p className="text-[8px] font-extrabold text-indigo-300 uppercase tracking-widest mt-0.5">Block {w.block} • Floor {w.floor}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest ${w.service_status === 'Active' || w.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                {w.service_status || w.status || 'Offline'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between group/pwd cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-all" onClick={() => setShowWifiPwd(p => p === w._id ? null : w._id)}>
                                            <div>
                                                <p className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest mb-0.5">Password</p>
                                                <p className="text-white font-extrabold text-sm font-mono">
                                                    {showWifiPwd === w._id ? (w.password || w.network_password || '—') : '••••••••'}
                                                </p>
                                            </div>
                                            <span className="text-[8px] text-indigo-400 font-extrabold uppercase tracking-widest opacity-0 group-hover/pwd:opacity-100 transition-opacity">
                                                {showWifiPwd === w._id ? 'HIDE' : 'SHOW'}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-slate-700">
                                        <Wifi className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-40">No WiFi Configured</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                            <h2 className="text-lg font-black text-white mb-6">E-Vault</h2>
                            <div className="space-y-4">
                                {profile?.id_proof_path && (
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}/uploads/documents/${profile.id_proof_path}`}
                                        target="_blank" rel="noreferrer"
                                        className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-cyan-500/40 transition-all group overflow-hidden relative shadow-2xl"
                                    >
                                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="p-2 h-fit bg-green-500/10 rounded-lg text-green-400 relative z-10">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 relative z-10">
                                            <span className="text-white font-black tracking-tight uppercase text-xs block mb-0.5">Authenticated ID</span>
                                            <span className="text-slate-500 text-[8px] font-bold uppercase tracking-tight leading-none">Global Identification Proof</span>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all relative z-10" />
                                    </a>
                                )}
                                <div className="p-5 text-center text-slate-700 border-2 border-dashed border-slate-800 rounded-2xl text-[8px] font-black uppercase tracking-tight opacity-30">
                                    Encrypted Storage Protected
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Admin/Manager Dashboard (Symmetrical Polish) ---
    return (
        <div className="space-y-6 w-full animate-in fade-in duration-1000 pb-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">
                    Command <span className="text-primary-500">Center</span>
                </h1>
                <p className="text-slate-400 text-[10px] font-medium tracking-tight">Enterprise overview of the ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Admissions" value={stats.totalStudents} icon={Users} color="blue" />
                <StatCard title="Ecosystem Occupancy" value={stats.occupancy} icon={DoorOpen} color="purple" />
                <StatCard title="Pending Receivables" value={stats.pendingPayments} icon={CreditCard} color="amber" />
                <StatCard title="Active Visitor Pulse" value={stats.activeVisitors} icon={Clock} color="rose" />
            </div>

            {/* Admin Utilities Management Panel */}
            <div className="bg-slate-900/50 backdrop-blur-3xl border border-slate-800 rounded-[32px] p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-600/20 rounded-2xl text-primary-500">
                            <Settings2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Utility Management Hub</h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-tight">Infrastructure Core Control</p>
                        </div>
                    </div>
                    <a href="/utilities" className="flex items-center gap-2 text-primary-400 hover:text-white font-black text-[10px] uppercase tracking-widest bg-white/5 px-5 py-2.5 rounded-2xl transition-all border border-white/5 hover:border-primary-500">
                        Manage All Modules <ArrowRight className="w-4 h-4" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Washing Section */}
                    <div className="bg-slate-800/20 border border-white/5 rounded-3xl p-6 hover:border-amber-500/30 transition-all group">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <h3 className="text-white font-bold text-sm tracking-tight">Laundry System</h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <h4 className="text-3xl font-black text-white">{utilitySummary.washing}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-1">Active Machines</p>
                        </div>
                    </div>

                    {/* Water Section */}
                    <div className="bg-slate-800/20 border border-white/5 rounded-3xl p-6 hover:border-cyan-500/30 transition-all group">
                        <div className="flex items-center gap-3 mb-4">
                            <Droplets className="w-5 h-5 text-cyan-500" />
                            <h3 className="text-white font-bold text-sm tracking-tight">Hydration Nodes</h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <h4 className="text-3xl font-black text-white">{utilitySummary.water}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-1">Status Controlled</p>
                        </div>
                    </div>

                    {/* WiFi Section */}
                    <div className="bg-slate-800/20 border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group">
                        <div className="flex items-center gap-3 mb-4">
                            <Wifi className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-white font-bold text-sm tracking-tight">Network Fabrics</h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <h4 className="text-3xl font-black text-white">{utilitySummary.wifi}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-1">Configured Floors</p>
                        </div>
                    </div>

                    {/* Maintenance/Energy Section */}
                    <div className="bg-slate-800/20 border border-white/5 rounded-3xl p-6 hover:border-rose-500/30 transition-all group">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                            <h3 className="text-white font-bold text-sm tracking-tight">Energy & Issues</h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <h4 className="text-3xl font-black text-white">{complaints.filter(c => c.category === 'maintenance' || c.title.toLowerCase().includes('electricity')).length}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-1">Pending Alerts</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Resolution Desk - Adjusted Height & Symmetry */}
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-3xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[400px] group relative overflow-hidden">
                    <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary-500/5 blur-[80px]"></div>
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-3 shrink-0 relative z-10 px-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500" /> Resolution Desk
                    </h2>
                    <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar relative z-10 px-2 flex-1">
                        {complaints.map(c => (
                            <div key={c._id} className="p-6 bg-slate-800/10 border-l-4 border-l-primary-500 border border-white/5 rounded-2xl flex flex-col justify-center relative hover:bg-slate-800/30 transition-all group/item shadow-2xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h4 className="text-white font-black text-sm tracking-tight leading-none group-hover/item:translate-x-1 transition-transform">{c.title}</h4>
                                        <div className="flex items-center gap-3">
                                            <p className="text-primary-400 text-[8px] font-black uppercase tracking-widest bg-primary-500/10 px-2 py-1 rounded-lg border border-primary-500/10">ID: {c.student_name || 'ANONYMOUS'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-lg ${c.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        c.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                        {c.status?.replace('_', ' ') || 'pending'}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-xs mb-4 leading-relaxed font-medium px-1">{c.content}</p>
                                <div className="flex items-center justify-between border-t border-white/5 pt-4 px-1">
                                    <p className="text-slate-700 text-[8px] font-black uppercase tracking-tight">{new Date(c.created_at).toLocaleDateString()}</p>
                                    <button className="text-primary-400 hover:text-white font-black text-[9px] uppercase tracking-tight flex items-center gap-2 transition-all group/btn bg-white/5 px-4 py-2 rounded-xl hover:bg-primary-600 border border-white/5 hover:border-primary-400 shadow-xl">
                                        Action <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {complaints.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-8 min-h-[500px]">
                                <CheckCircle2 className="w-24 h-24 opacity-10" />
                                <p className="text-4xl font-black italic tracking-widest opacity-20 text-center">Desk Operational:<br />Zero Pending Tickets</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Feed Sidebar - Polish */}
                <div className="bg-slate-900/50 backdrop-blur-3xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[400px] relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/5 blur-[80px]"></div>
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-3 shrink-0 relative z-10 px-2">
                        <Bell className="w-5 h-5 text-amber-500" /> Active Feed
                    </h2>
                    <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar relative z-10 px-2 flex-1">
                        {notices.map(n => (
                            <div key={n._id} className={`p-6 border rounded-2xl flex flex-col justify-center transition-all hover:scale-[1.02] ${n.priority === 'urgent' ? 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/5' : 'bg-primary-500/5 border-primary-500/20 shadow-lg shadow-primary-500/5'}`}>
                                <div className={`flex items-start gap-3 font-black text-sm mb-3 leading-tight ${n.priority === 'urgent' ? 'text-red-400' : 'text-primary-400'}`}>
                                    {n.priority === 'urgent' && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                                    {n.title}
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed font-medium px-1">{n.content}</p>
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center px-1">
                                    <span className="text-slate-700 text-[8px] font-black uppercase tracking-tight leading-none">Global Pulse</span>
                                    <span className="px-2 py-1 bg-black/40 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-tight">{new Date(n.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        {notices.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-8 min-h-[500px]">
                                <Bell className="w-24 h-24 opacity-10" />
                                <p className="text-4xl font-black italic tracking-widest opacity-20 text-center">Broadcast Silent</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
