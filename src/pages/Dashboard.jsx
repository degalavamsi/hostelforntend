import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import { 
    MessageSquarePlus, X, Loader2 
} from 'lucide-react';
import FullPageLoader from '../components/FullPageLoader';
import StudentView from './dashboard/StudentView';
import AdminView from './dashboard/AdminView';

export default function Dashboard() {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        occupancy: '0%',
        pendingPayments: 0,
        activeVisitors: 0
    });
    const [profile, setProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [notices, setNotices] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [todayMenu, setTodayMenu] = useState(null);
    const [wifiConfigs, setWifiConfigs] = useState([]);
    const [utilitySummary, setUtilitySummary] = useState({ washing: 0, water: 0, wifi: 0 });
    
    // UI States
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [complaintForm, setComplaintForm] = useState({ title: '', content: '', category: 'general' });
    const [submittingComplaint, setSubmittingComplaint] = useState(false);
    const [showWifiPwd, setShowWifiPwd] = useState(null);

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
                    api.get('/notices'),
                    api.get('/notices/complaints/all'),
                    api.get('/utilities/washing'),
                    api.get('/utilities/water'),
                    api.get('/utilities/wifi')
                ]);

                const [occ, std, due, vis, not, cmp, wash, water, wifi] = results.map(r => r.status === 'fulfilled' ? r.value : { data: [] });

                setStats({
                    totalStudents: std.data?.length || 0,
                    occupancy: `${Math.round(((occ.data?.total_occupied || 0) / (occ.data?.total_capacity || 1)) * 100)}%`,
                    pendingPayments: due.data?.length || 0,
                    activeVisitors: Array.isArray(vis.data) ? vis.data.filter(v => !v.time_out).length : 0
                });
                setNotices(not.data || []);
                setComplaints(cmp.data || []);
                setUtilitySummary({
                    washing: wash.data?.length || 0,
                    water: water.data?.length || 0,
                    wifi: wifi.data?.length || 0
                });
            } else {
                const results = await Promise.allSettled([
                    api.get('/auth/profile'),
                    api.get('/notifications'),
                    api.get('/notices'),
                    api.get('/notices/complaints/mine'),
                    api.get('/notices/menu'),
                    api.get('/utilities/wifi')
                ]);

                const [prof, notify, not, cmp, menu, wifi] = results.map(r => r.status === 'fulfilled' ? r.value : { data: null });

                if (prof.data) setProfile(prof.data);
                if (notify.data) setNotifications(notify.data);
                if (not.data) setNotices(not.data);
                if (cmp.data) setComplaints(cmp.data);
                if (wifi.data) setWifiConfigs(wifi.data);

                if (menu.data) {
                    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const menuArray = Array.isArray(menu.data) ? menu.data : [];
                    const todayData = menuArray.find(m => m.day === dayName);
                    if (todayData) setTodayMenu(todayData.menu);
                }
            }
        } catch (err) {
            console.error('Fetch failed:', err);
        } finally {
            setLoading(false);
        }
    }, [user, isAdmin]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePostComplaint = async (e) => {
        e.preventDefault();
        setSubmittingComplaint(true);
        try {
            await api.post('/notices/complaints', complaintForm);
            setIsComplaintModalOpen(false);
            setComplaintForm({ title: '', content: '', category: 'general' });
            fetchData();
        } catch (err) {
            console.error('Complaint failed');
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
        return <FullPageLoader message="Powering up your workspace..." />;
    }

    return (
        <div className="relative">
            {/* Complaint Modal */}
            {isComplaintModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[48px] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-[60px]" />
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-tighter">Submit Feedback</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Direct to Warden Channel</p>
                            </div>
                            <button onClick={() => setIsComplaintModalOpen(false)} className="p-3 text-slate-400 hover:text-white bg-white/5 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                        </div>
                        
                        <form onSubmit={handlePostComplaint} className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-primary-500 transition-colors">Subject</label>
                                    <input
                                        required
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-5 text-white placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold"
                                        placeholder="Identification of issue"
                                        value={complaintForm.title}
                                        onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                                    />
                                </div>
                                
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-primary-500 transition-colors">Infrastructure Node</label>
                                    <select
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-5 text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold appearance-none"
                                        value={complaintForm.category}
                                        onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                                    >
                                        <option value="general">General Broadcast</option>
                                        <option value="maintenance">Maintenance Node</option>
                                        <option value="food">Culinary Services</option>
                                        <option value="internet">Network Fabric</option>
                                        <option value="other">Unclassified</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-primary-500 transition-colors">Detailed Context</label>
                                    <textarea
                                        required
                                        rows="4"
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-5 text-white placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all resize-none font-bold"
                                        placeholder="Provide comprehensive details..."
                                        value={complaintForm.content}
                                        onChange={(e) => setComplaintForm({ ...complaintForm, content: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submittingComplaint}
                                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-primary-900/40 transition-all flex items-center justify-center gap-3 text-lg"
                            >
                                {submittingComplaint ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Raise Resolution Ticket'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isAdmin ? (
                <AdminView 
                    stats={stats}
                    utilitySummary={utilitySummary}
                    complaints={complaints}
                    notices={notices}
                    onAction={(c) => console.log('Action for', c)}
                />
            ) : (
                <StudentView 
                    user={user}
                    profile={profile}
                    notifications={notifications}
                    notices={notices}
                    complaints={complaints}
                    todayMenu={todayMenu}
                    wifiConfigs={wifiConfigs}
                    onOpenComplaint={() => setIsComplaintModalOpen(true)}
                    onDeleteNotif={deleteNotif}
                    showWifiPwd={showWifiPwd}
                    setShowWifiPwd={setShowWifiPwd}
                />
            )}
        </div>
    );
}
