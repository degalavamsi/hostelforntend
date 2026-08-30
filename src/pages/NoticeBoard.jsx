import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import {
    Bell, AlertTriangle, Plus, Trash2,
    Calendar, Info, Loader2, Pencil, X, Save,
    MessageSquarePlus, Flag, CheckCircle2, Clock, ChevronDown
} from 'lucide-react';

const TABS = { notices: 'notices', complaints: 'complaints' };

const NoticeBoard = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');

    const [tab, setTab] = useState(TABS.notices);

    // ── Notices ──────────────────────────────────────────────
    const [notices, setNotices] = useState([]);
    const [noticeLoading, setNoticeLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [editNotice, setEditNotice] = useState(null);
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '', priority: 'normal' });

    const fetchNotices = async () => {
        try {
            const res = await api.get('/notices');
            setNotices(res.data);
        } catch (err) { console.error(err); }
        finally { setNoticeLoading(false); }
    };

    useEffect(() => { fetchNotices(); }, []);

    const openAddNotice = () => {
        setNoticeForm({ title: '', content: '', priority: 'normal' });
        setEditNotice(null);
        setShowAdd(true);
    };

    const openEditNotice = (n) => {
        setNoticeForm({ title: n.title, content: n.content, priority: n.priority });
        setEditNotice(n);
        setShowAdd(true);
    };

    const handleNoticeSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editNotice) {
                await api.put(`/notices/${editNotice._id}`, noticeForm);
            } else {
                await api.post('/notices', noticeForm);
            }
            fetchNotices();
            setShowAdd(false);
            setEditNotice(null);
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed');
        }
    };

    const handleDeleteNotice = async (id) => {
        if (!window.confirm('Delete this notice?')) return;
        try { await api.delete(`/notices/${id}`); fetchNotices(); }
        catch { alert('Delete failed'); }
    };

    // ── Complaints ────────────────────────────────────────────
    const [complaints, setComplaints] = useState([]);
    const [complaintLoading, setComplaintLoading] = useState(false);
    const [showComplaintForm, setShowComplaintForm] = useState(false);
    const [complaintForm, setComplaintForm] = useState({ title: '', content: '', category: 'general' });

    const fetchComplaints = async () => {
        setComplaintLoading(true);
        try {
            const endpoint = isAdmin ? '/notices/complaints/all' : '/notices/complaints/mine';
            const res = await api.get(endpoint);
            setComplaints(res.data);
        } catch (err) { console.error(err); }
        finally { setComplaintLoading(false); }
    };

    useEffect(() => {
        if (tab === TABS.complaints) fetchComplaints();
    }, [tab]);

    const handleRaiseComplaint = async (e) => {
        e.preventDefault();
        try {
            await api.post('/notices/complaints', complaintForm);
            setComplaintForm({ title: '', content: '', category: 'general' });
            setShowComplaintForm(false);
            fetchComplaints();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to raise complaint');
        }
    };

    const handleUpdateComplaintStatus = async (id, status) => {
        try {
            await api.patch(`/notices/complaints/${id}/status`, { status });
            fetchComplaints();
        } catch (err) { alert('Update failed'); }
    };

    // ── Helpers ───────────────────────────────────────────────
    const priorityStyle = (p) => p === 'urgent'
        ? { wrap: 'border-danger/20', inner: 'bg-danger/5', icon: 'bg-danger/20 text-danger', label: 'text-danger' }
        : { wrap: 'border-border', inner: 'bg-surface', icon: 'bg-primary/10 text-primary', label: 'text-primary' };

    const statusBadge = (status) => {
        const map = {
            open: 'bg-warning/10 text-warning',
            in_progress: 'bg-primary/10 text-primary',
            resolved: 'bg-success/10 text-success'
        };
        return map[status] || 'bg-app text-muted';
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-main tracking-tight">Broadcast <span className="text-primary">Center</span>
                    </h1>
                    <p className="text-muted text-xs font-medium uppercase tracking-wider mt-1">Hostel announcements & complaints.</p>
                </div>
                <div className="flex items-center gap-2">
                    {isAdmin && tab === TABS.notices && (
                        <button
                            onClick={openAddNotice}
                            className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Post Notice
                        </button>
                    )}
                    {!isAdmin && tab === TABS.complaints && (
                        <button
                            onClick={() => setShowComplaintForm(true)}
                            className="bg-warning hover:opacity-90 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-warning/20 text-sm"
                        >
                            <Flag className="w-4 h-4" /> Raise Complaint
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 bg-app p-1 rounded-xl border border-border w-fit shadow-floating">
                {[
                    { key: TABS.notices, icon: Bell, label: 'Notices' },
                    { key: TABS.complaints, icon: MessageSquarePlus, label: isAdmin ? 'Complaints' : 'My Complaints' }
                ].map(({ key, icon: Icon, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${tab === key ? 'bg-primary text-white shadow-md'
                            : 'text-muted hover:text-main'
                            }`}
                    >
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
            </div>

            {/* ── NOTICES TAB ── */}
            {tab === TABS.notices && (
                <div className="space-y-4">
                    {noticeLoading && <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>}
                    {!noticeLoading && notices.length === 0 && (
                        <div className="p-16 text-center card-3d rounded-3xl">
                            <Bell className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                            <p className="text-muted font-medium">No notices posted yet.</p>
                        </div>
                    )}
                    {notices.map((notice) => {
                        const s = priorityStyle(notice.priority);
                        return (
                            <div key={notice._id} className={`p-5 rounded-2xl border ${s.wrap} ${s.inner} shadow-sm transition-all hover:shadow-md flex gap-4`}>
                                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${s.icon}`}>
                                    {notice.priority === 'urgent' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-sm font-semibold text-main tracking-tight">{notice.title}</h3>
                                        {isAdmin && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => openEditNotice(notice)} className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDeleteNotice(notice._id)} className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-muted leading-relaxed text-xs">{notice.content}</p>
                                    <div className="pt-2 flex items-center gap-3 text-[10px] font-bold text-muted/70 uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(notice.created_at).toLocaleDateString('en-IN')}</span>
                                        <span className={s.label}>• {notice.priority}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── COMPLAINTS TAB ── */}
            {tab === TABS.complaints && (
                <div className="space-y-4">
                    {complaintLoading && <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>}
                    {!complaintLoading && complaints.length === 0 && (
                        <div className="p-16 text-center card-3d rounded-3xl">
                            <MessageSquarePlus className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                            <p className="text-muted font-medium">No complaints yet.</p>
                            {!isAdmin && <button onClick={() => setShowComplaintForm(true)} className="mt-4 px-6 py-2.5 bg-warning/10 text-warning border border-warning/20 rounded-xl font-medium text-sm hover:bg-warning/20 transition-all">Raise Your First Complaint</button>}
                        </div>
                    )}
                    {complaints.map((c) => (
                        <div key={c._id} className="card-3d rounded-2xl p-5 flex gap-4 hover:border-warning/30 transition-all shadow-sm hover:shadow-md">
                            <div className="shrink-0 p-3 rounded-xl bg-warning/10 text-warning h-fit">
                                <Flag className="w-4 h-4" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-main tracking-tight">{c.title}</h3>
                                        {isAdmin && c.student_name && (
                                            <p className="text-muted text-[10px] mt-0.5 font-bold uppercase tracking-wider">By: <span className="text-main">{c.student_name}</span></p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${statusBadge(c.status)}`}>
                                            {c.status?.replace('_', ' ')}
                                        </span>
                                        {isAdmin && (
                                            <select
                                                value={c.status}
                                                onChange={(e) => handleUpdateComplaintStatus(c._id, e.target.value)}
                                                className="bg-app border border-border text-main text-[9px] font-bold uppercase tracking-wider rounded-md px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                            >
                                                <option value="open">OPEN</option>
                                                <option value="in_progress">WORK</option>
                                                <option value="resolved">DONE</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                                <p className="text-muted text-xs leading-relaxed">{c.content}</p>
                                <div className="flex items-center gap-3 pt-2 text-[10px] font-bold text-muted/70 uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                                    <span>• {c.category}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Notice Add/Edit Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card-3d w-full max-w-lg rounded-3xl p-8 relative">
                        <button onClick={() => { setShowAdd(false); setEditNotice(null); }} className="absolute top-6 right-6 text-muted hover:text-main bg-app p-2 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                        <h2 className="text-xl font-semibold text-main tracking-tight mb-6">{editNotice ? 'Edit Notice' : 'Post New Notice'}</h2>
                        <form onSubmit={handleNoticeSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Title</label>
                                <input type="text" required className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Content</label>
                                <textarea required rows="4" className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Priority</label>
                                <select className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={noticeForm.priority} onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}>
                                    <option value="normal">Normal</option>
                                    <option value="urgent">🔴 Urgent</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => { setShowAdd(false); setEditNotice(null); }} className="flex-1 py-3 text-muted font-medium hover:text-main hover:bg-border transition-colors border border-border rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary hover:opacity-90 text-white font-medium py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" />{editNotice ? 'Save Changes' : 'Post Notice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complaint Raise Modal */}
            {showComplaintForm && (
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card-3d w-full max-w-lg rounded-3xl p-8 relative">
                        <button onClick={() => setShowComplaintForm(false)} className="absolute top-6 right-6 text-muted hover:text-main bg-app p-2 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                        <h2 className="text-xl font-semibold text-main tracking-tight mb-2">Raise a <span className="text-warning">Complaint</span></h2>
                        <p className="text-muted text-xs font-medium mb-6">Submit your complaint or request to the hostel management.</p>
                        <form onSubmit={handleRaiseComplaint} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Category</label>
                                <select className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-warning focus:ring-2 focus:ring-warning/20 transition-all" value={complaintForm.category} onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}>
                                    <option value="general">General</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="food">Food / Menu</option>
                                    <option value="cleanliness">Cleanliness</option>
                                    <option value="security">Security</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Subject</label>
                                <input type="text" required className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-warning focus:ring-2 focus:ring-warning/20 transition-all placeholder:text-muted/50" placeholder="Brief subject of your complaint" value={complaintForm.title} onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Details</label>
                                <textarea required rows="4" className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-warning focus:ring-2 focus:ring-warning/20 transition-all resize-none placeholder:text-muted/50" placeholder="Describe your issue in detail..." value={complaintForm.content} onChange={(e) => setComplaintForm({ ...complaintForm, content: e.target.value })} />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowComplaintForm(false)} className="flex-1 py-3 text-muted font-medium hover:text-main hover:bg-border transition-colors border border-border rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 bg-warning hover:opacity-90 text-white font-medium py-3 rounded-xl shadow-lg shadow-warning/20 transition-all flex items-center justify-center gap-2">
                                    <Flag className="w-4 h-4" /> Submit Complaint
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeBoard;
