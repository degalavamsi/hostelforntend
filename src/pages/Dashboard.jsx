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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-main/20 backdrop-blur-sm">
                    <div className="card-3d w-full max-w-xl p-6 md:p-8 animate-in zoom-in-95 duration-200 relative max-h-[95vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <div>
                                <h3 className="text-2xl font-semibold text-main tracking-tight text-glow">Submit Feedback</h3>
                                <p className="text-xs font-medium text-muted uppercase tracking-wider mt-1">Direct to Warden Channel</p>
                            </div>
                            <button onClick={() => setIsComplaintModalOpen(false)} className="p-2 text-muted hover:text-main hover:bg-app rounded-xl transition-all"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <form onSubmit={handlePostComplaint} className="space-y-6 relative z-10">
                            <div className="space-y-4">
                                <div className="space-y-1.5 group">
                                    <label className="text-xs font-medium text-muted ml-1 group-focus-within:text-primary transition-colors">Subject</label>
                                    <input
                                        required
                                        className="w-full bg-app border border-border rounded-base p-3 text-main placeholder:text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
                                        placeholder="Identification of issue"
                                        value={complaintForm.title}
                                        onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                                    />
                                </div>
                                
                                <div className="space-y-1.5 group">
                                    <label className="text-xs font-medium text-muted ml-1 group-focus-within:text-primary transition-colors">Infrastructure Node</label>
                                    <select
                                        className="w-full bg-app border border-border rounded-base p-3 text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
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
                                
                                <div className="space-y-1.5 group">
                                    <label className="text-xs font-medium text-muted ml-1 group-focus-within:text-primary transition-colors">Detailed Context</label>
                                    <textarea
                                        required
                                        rows="4"
                                        className="w-full bg-app border border-border rounded-base p-3 text-main placeholder:text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none font-medium text-sm"
                                        placeholder="Provide comprehensive details..."
                                        value={complaintForm.content}
                                        onChange={(e) => setComplaintForm({ ...complaintForm, content: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submittingComplaint}
                                className="w-full bg-primary hover:opacity-90 text-white font-medium py-3 rounded-full shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 text-base"
                            >
                                {submittingComplaint ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Raise Resolution Ticket'}
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
