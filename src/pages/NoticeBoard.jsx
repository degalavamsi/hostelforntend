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
        ? { wrap: 'bg-gradient-to-br from-red-500/20 to-red-950/20', inner: 'bg-red-500/5', icon: 'bg-red-500/20 text-red-500', label: 'text-red-400' }
        : { wrap: 'bg-white/5', inner: '', icon: 'bg-primary-500/20 text-primary-400', label: 'text-primary-400' };

    const statusBadge = (status) => {
        const map = {
            open: 'bg-amber-500/10 text-amber-400',
            in_progress: 'bg-blue-500/10 text-blue-400',
            resolved: 'bg-green-500/10 text-green-400'
        };
        return map[status] || 'bg-slate-800 text-slate-400';
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Broadcast <span className="text-primary-500">Center</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-medium tracking-tight">Hostel announcements & complaints.</p>
                </div>
                <div className="flex items-center gap-2">
                    {isAdmin && tab === TABS.notices && (
                        <button
                            onClick={openAddNotice}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition-all shadow-lg shadow-primary-900/20 text-[10px] uppercase tracking-tight"
                        >
                            <Plus className="w-3.5 h-3.5" /> Post Notice
                        </button>
                    )}
                    {!isAdmin && tab === TABS.complaints && (
                        <button
                            onClick={() => setShowComplaintForm(true)}
                            className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition-all text-[10px] uppercase tracking-tight"
                        >
                            <Flag className="w-3.5 h-3.5" /> Raise Complaint
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
                {[
                    { key: TABS.notices, icon: Bell, label: 'Notices' },
                    { key: TABS.complaints, icon: MessageSquarePlus, label: isAdmin ? 'Complaints' : 'My Complaints' }
                ].map(({ key, icon: Icon, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-tight transition-all ${tab === key
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                            : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                ))}
            </div>

            {/* ── NOTICES TAB ── */}
            {tab === TABS.notices && (
                <div className="space-y-5">
                    {noticeLoading && <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 text-primary-500 animate-spin" /></div>}
                    {!noticeLoading && notices.length === 0 && (
                        <div className="p-20 text-center bg-slate-900/30 rounded-[32px] border border-slate-800">
                            <Bell className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold">No notices posted yet.</p>
                        </div>
                    )}
                    {notices.map((notice) => {
                        const s = priorityStyle(notice.priority);
                        return (
                            <div key={notice._id} className={`p-0.5 rounded-3xl ${s.wrap}`}>
                                <div className={`backdrop-blur-xl rounded-[23px] p-5 border border-white/5 flex gap-4 ${s.inner}`}>
                                    <div className={`shrink-0 w-10 h-10 p-2.5 rounded-xl flex items-center justify-center ${s.icon}`}>
                                        {notice.priority === 'urgent' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 space-y-0.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-sm font-black text-white tracking-tight">{notice.title}</h3>
                                            {isAdmin && (
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button onClick={() => openEditNotice(notice)} className="p-1.5 text-slate-600 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all" title="Edit"><Pencil className="w-3 h-3" /></button>
                                                    <button onClick={() => handleDeleteNotice(notice._id)} className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Delete"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-slate-400 leading-normal text-xs">{notice.content}</p>
                                        <div className="pt-2 flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-tight">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(notice.created_at).toLocaleDateString('en-IN')}</span>
                                            <span className={s.label}>• {notice.priority}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── COMPLAINTS TAB ── */}
            {tab === TABS.complaints && (
                <div className="space-y-5">
                    {complaintLoading && <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 text-primary-500 animate-spin" /></div>}
                    {!complaintLoading && complaints.length === 0 && (
                        <div className="p-20 text-center bg-slate-900/30 rounded-[32px] border border-slate-800">
                            <MessageSquarePlus className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold">No complaints yet.</p>
                            {!isAdmin && <button onClick={() => setShowComplaintForm(true)} className="mt-4 px-6 py-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl font-black text-sm">Raise Your First Complaint</button>}
                        </div>
                    )}
                    {complaints.map((c) => (
                        <div key={c._id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 flex gap-4 hover:border-amber-500/20 transition-all">
                            <div className="shrink-0 p-3 rounded-xl bg-amber-500/10 text-amber-400 h-fit">
                                <Flag className="w-4 h-4" />
                            </div>
                            <div className="flex-1 space-y-0.5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-black text-white tracking-tight">{c.title}</h3>
                                        {isAdmin && c.student_name && (
                                            <p className="text-slate-500 text-[9px] mt-0.5 font-bold uppercase tracking-tight">By: <span className="text-slate-300">{c.student_name}</span></p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tight ${statusBadge(c.status)}`}>
                                            {c.status?.replace('_', ' ')}
                                        </span>
                                        {isAdmin && (
                                            <select
                                                value={c.status}
                                                onChange={(e) => handleUpdateComplaintStatus(c._id, e.target.value)}
                                                className="bg-slate-800 border border-slate-700 text-white text-[9px] font-black uppercase tracking-tighter rounded-lg px-1.5 py-1 outline-none"
                                            >
                                                <option value="open">OPEN</option>
                                                <option value="in_progress">WORK</option>
                                                <option value="resolved">DONE</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-xs leading-normal">{c.content}</p>
                                <div className="flex items-center gap-3 pt-1 text-[10px] font-black text-slate-600 uppercase tracking-tight">
                                    <span><Calendar className="w-3 h-3 inline mr-1" />{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                                    <span>• {c.category}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Notice Add/Edit Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-[32px] p-10 shadow-2xl relative">
                        <button onClick={() => { setShowAdd(false); setEditNotice(null); }} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                        <h2 className="text-2xl font-black text-white mb-7">{editNotice ? 'Edit Notice' : 'Post New Notice'}</h2>
                        <form onSubmit={handleNoticeSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Title</label>
                                <input type="text" required className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Content</label>
                                <textarea required rows="4" className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors resize-none" value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority</label>
                                <select className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={noticeForm.priority} onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}>
                                    <option value="normal">Normal</option>
                                    <option value="urgent">🔴 Urgent</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => { setShowAdd(false); setEditNotice(null); }} className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition-colors border border-slate-800 rounded-2xl">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" />{editNotice ? 'Save Changes' : 'Post Notice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complaint Raise Modal */}
            {showComplaintForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-[32px] p-10 shadow-2xl relative">
                        <button onClick={() => setShowComplaintForm(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                        <h2 className="text-2xl font-black text-white mb-2">Raise a <span className="text-amber-400">Complaint</span></h2>
                        <p className="text-slate-500 text-sm mb-7">Submit your complaint or request to the hostel management.</p>
                        <form onSubmit={handleRaiseComplaint} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                                <select className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-amber-500 transition-colors" value={complaintForm.category} onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}>
                                    <option value="general">General</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="food">Food / Menu</option>
                                    <option value="cleanliness">Cleanliness</option>
                                    <option value="security">Security</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject</label>
                                <input type="text" required className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-amber-500 transition-colors" placeholder="Brief subject of your complaint" value={complaintForm.title} onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Details</label>
                                <textarea required rows="4" className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-amber-500 transition-colors resize-none" placeholder="Describe your issue in detail..." value={complaintForm.content} onChange={(e) => setComplaintForm({ ...complaintForm, content: e.target.value })} />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowComplaintForm(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition-colors border border-slate-800 rounded-2xl">Cancel</button>
                                <button type="submit" className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/20 font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
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
