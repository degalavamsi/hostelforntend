import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { User, Bell, Search, Clock, CreditCard, X, Trash2, MessageSquareReply, QrCode, Smartphone, ChevronRight, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [studentResponses, setStudentResponses] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' | 'responses'
    const [detailNotif, setDetailNotif] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);

    const apiBase = import.meta.env.VITE_API_URL || '/api';


    const fetchNotifications = async () => {
        try {
            const fetchList = [
                api.get('/notifications'),
                api.get('/notifications/unread-count')
            ];
            if (isAdmin) fetchList.push(api.get('/notifications/responses'));
            const results = await Promise.allSettled(fetchList);
            if (results[0].status === 'fulfilled') setNotifications(results[0].value.data || []);
            if (results[1].status === 'fulfilled') setUnreadCount(results[1].value.data.count);
            if (isAdmin && results[2] && results[2].status === 'fulfilled') setStudentResponses(results[2].value.data || []);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/read/${id}`);
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            await api.delete(`/notifications/${id}`);
            if (detailNotif?._id === id) setDetailNotif(null);
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    const openDetail = (n) => {
        setDetailNotif(n);
        setReplyText(n.response || '');
        if (!n.is_read) markAsRead(n._id);
    };

    const markAdminRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await api.post(`/notifications/responses/read/${id}`);
            setStudentResponses(prev => prev.filter(r => r._id !== id));
        } catch (err) { console.error('Failed to dismiss response', err); }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setReplying(true);
        try {
            await api.post(`/notifications/${detailNotif._id}/respond`, { response: replyText });
            setDetailNotif(prev => ({ ...prev, response: replyText }));
            fetchNotifications();
        } catch (err) { console.error(err); }
        setReplying(false);
    };

    const typeIcon = (type) => {
        if (type === 'rent_due' || type === 'payment_reminder') return <CreditCard className="w-5 h-5" />;
        return <Bell className="w-5 h-5" />;
    };

    const typeColor = (type, isRead) => {
        if (!isRead) return 'bg-primary-600 text-white';
        return 'bg-slate-800 text-slate-500';
    };

    return (
        <header className="h-20 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-50">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl w-96 transition-all focus-within:border-primary-500/50 shadow-inner shadow-black/40">
                <Search className="w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search for anything..."
                    className="bg-transparent border-none focus:ring-0 text-slate-200 w-full placeholder:text-slate-600 font-medium text-sm"
                />
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => { setShowNotifications(!showNotifications); setDetailNotif(null); }}
                        className={`p-3 rounded-2xl transition-all relative ${showNotifications ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}
                    >
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 border-2 border-slate-950 rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-[49]" onClick={() => { setShowNotifications(false); setDetailNotif(null); }} />
                            <div className="absolute right-0 mt-6 w-[420px] bg-slate-900 border border-white/10 rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-6 duration-300 z-[50]">

                                {/* ──── DETAIL VIEW ──── */}
                                {detailNotif ? (
                                    <div className="flex flex-col">
                                        <div className="p-5 border-b border-slate-800 bg-white/5 flex items-center gap-3">
                                            <button onClick={() => setDetailNotif(null)} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
                                                <ChevronRight className="w-4 h-4 rotate-180" />
                                            </button>
                                            <h3 className="text-white font-extrabold text-sm">Notification Detail</h3>
                                        </div>

                                        <div className="p-6 space-y-5 max-h-[500px] overflow-y-auto">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-primary-600/20 text-primary-400 rounded-2xl flex items-center justify-center border border-primary-500/20">
                                                    {typeIcon(detailNotif.type)}
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">{detailNotif.type?.replace('_', ' ')}</p>
                                                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(detailNotif.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-white font-bold text-sm leading-relaxed">{detailNotif.message}</p>

                                            {detailNotif.upi_id && (
                                                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                                                    <p className="text-[9px] font-extrabold text-green-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                        <Smartphone className="w-3 h-3" /> UPI / PhonePe
                                                    </p>
                                                    <p className="text-green-300 font-extrabold text-sm tracking-tight">{detailNotif.upi_id}</p>
                                                    <p className="text-slate-500 text-[9px] mt-1">Copy this ID to pay via any UPI app</p>
                                                </div>
                                            )}

                                            {detailNotif.qr_url && (
                                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-center">
                                                    <p className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
                                                        <QrCode className="w-3 h-3" /> Scan to Pay
                                                    </p>
                                                    <img
                                                        src={`${apiBase}${detailNotif.qr_url}`}
                                                        alt="Payment QR"
                                                        className="w-48 h-48 object-contain rounded-xl mx-auto border border-white/10 cursor-pointer hover:scale-105 transition-transform"
                                                        onClick={() => window.open(`${apiBase}${detailNotif.qr_url}`, '_blank')}
                                                    />
                                                    <p className="text-slate-600 text-[9px] mt-2">Tap to open full screen</p>
                                                </div>
                                            )}

                                            <div className="space-y-2 border-t border-white/5 pt-4">
                                                <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <MessageSquareReply className="w-3 h-3" /> {detailNotif.response ? 'Your Response' : 'Reply / Acknowledge'}
                                                </p>
                                                {detailNotif.response && (
                                                    <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-3">
                                                        <p className="text-primary-300 text-sm font-bold">{detailNotif.response}</p>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder={detailNotif.response ? 'Update your response...' : 'Type acknowledgement or query...'}
                                                        className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-slate-700 text-xs outline-none focus:border-primary-500 transition-colors"
                                                        value={replyText}
                                                        onChange={e => setReplyText(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleReply()}
                                                    />
                                                    <button
                                                        onClick={handleReply}
                                                        disabled={replying || !replyText.trim()}
                                                        className="p-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white rounded-2xl transition-all"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => deleteNotification(detailNotif._id, e)}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 text-rose-400 hover:text-white hover:bg-rose-500 rounded-2xl border border-rose-500/20 transition-all text-[10px] font-extrabold uppercase tracking-widest"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Delete Notification
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ──── LIST VIEW ──── */
                                    <>
                                        {/* Tabs (admin only) */}
                                        <div className="p-4 border-b border-slate-800 bg-white/5">
                                            <div className="flex gap-1 bg-slate-950/60 rounded-2xl p-1">
                                                <button
                                                    onClick={() => setActiveTab('notifications')}
                                                    className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                                >
                                                    <Bell className="w-3 h-3 inline mr-1" />
                                                    Alerts {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-[8px] px-1 rounded-full">{unreadCount}</span>}
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setActiveTab('responses')}
                                                        className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'responses' ? 'bg-green-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                                    >
                                                        <MessageSquare className="w-3 h-3 inline mr-1" />
                                                        Student Replies {studentResponses.length > 0 && <span className="ml-1 bg-green-500 text-white text-[8px] px-1 rounded-full">{studentResponses.length}</span>}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notifications Tab */}
                                        {activeTab === 'notifications' && (
                                            <div className="max-h-[380px] overflow-y-auto">
                                                {notifications?.length > 0 ? (
                                                    notifications.map((n) => (
                                                        <div
                                                            key={n._id}
                                                            className={`p-4 border-b border-slate-800/50 hover:bg-white/5 transition-colors cursor-pointer group ${!n.is_read ? 'bg-primary-500/5' : ''}`}
                                                            onClick={() => openDetail(n)}
                                                        >
                                                            <div className="flex gap-3 items-start">
                                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeColor(n.type, n.is_read)}`}>
                                                                    {typeIcon(n.type)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-sm leading-snug truncate ${!n.is_read ? 'text-white font-bold' : 'text-slate-400'}`}>
                                                                        {n.message}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        {(n.upi_id || n.qr_url) && (
                                                                            <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-lg">
                                                                                <QrCode className="w-2.5 h-2.5" /> QR
                                                                            </span>
                                                                        )}
                                                                        {n.response && (
                                                                            <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-primary-400 uppercase tracking-widest bg-primary-500/10 px-1.5 py-0.5 rounded-lg">
                                                                                <MessageSquareReply className="w-2.5 h-2.5" /> Replied
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[9px] text-slate-600 flex items-center gap-1">
                                                                            <Clock className="w-2.5 h-2.5" />
                                                                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-center gap-2">
                                                                    {!n.is_read && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
                                                                    <button
                                                                        onClick={(e) => deleteNotification(n._id, e)}
                                                                        className="p-1 text-slate-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-10 text-center text-slate-600 uppercase text-[10px] font-extrabold tracking-[0.2em]">
                                                        No notifications
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Student Responses Tab (admin only) */}
                                        {activeTab === 'responses' && isAdmin && (
                                            <div className="max-h-[380px] overflow-y-auto">
                                                {studentResponses?.length > 0 ? (
                                                    studentResponses.map((r) => (
                                                        <div
                                                            key={r._id}
                                                            onClick={(e) => { e.stopPropagation(); openDetail(r); }}
                                                            className="p-4 border-b border-slate-800/50 hover:bg-white/5 transition-colors cursor-pointer group"
                                                        >
                                                            <div className="flex gap-3 items-start">
                                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-green-600/20 text-green-400">
                                                                    <MessageSquare className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-[9px] font-extrabold text-green-400 uppercase tracking-widest">{r.student_name}</p>
                                                                        <button onClick={(e) => markAdminRead(r._id, e)} className="text-[9px] font-bold text-slate-500 hover:text-green-400 bg-slate-800/50 hover:bg-slate-800 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1">
                                                                            <CheckCircle2 className="w-3 h-3" /> Dismiss
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-slate-500 text-xs truncate">{r.message}</p>
                                                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                                                                        <p className="text-white text-xs font-bold leading-tight">"{r.response}"</p>
                                                                    </div>
                                                                    <p className="text-slate-600 text-[8px] flex items-center gap-1">
                                                                        <Clock className="w-2.5 h-2.5" />
                                                                        {r.responded_at ? new Date(r.responded_at).toLocaleString() : '—'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-10 text-center text-slate-600 uppercase text-[10px] font-extrabold tracking-[0.2em]">
                                                        No student replies yet
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="p-3 text-center border-t border-slate-800">
                                            <p className="text-slate-600 text-[10px] font-bold">Click a notification to view details &amp; reply</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-5 pl-8 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-white leading-none mb-1">{user?.username}</p>
                        <p className="text-[9px] text-primary-500 uppercase font-black tracking-widest">{user?.roles?.[0]}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg shadow-primary-900/10 relative group cursor-pointer hover:scale-110 active:scale-95 transition-all">
                        <User className="text-white w-6 h-6" />
                        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
