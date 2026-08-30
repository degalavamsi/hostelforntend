import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { User, Bell, Search, Clock, CreditCard, X, Trash2, MessageSquareReply, QrCode, Smartphone, ChevronRight, Send, MessageSquare, CheckCircle2, Menu } from 'lucide-react';
import api from '../services/api';

const Navbar = ({ onMenuClick }) => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [studentResponses, setStudentResponses] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState('notifications');
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
        if (type === 'rent_due' || type === 'payment_reminder') return <CreditCard className="w-4 h-4" />;
        return <Bell className="w-4 h-4" />;
    };

    const typeColor = (type, isRead) => {
        if (!isRead) return 'bg-primary/10 text-primary';
        return 'bg-app text-muted';
    };

    return (
        <header className="h-16 bg-surface/90 backdrop-blur-lg flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 border-b border-border">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onMenuClick}
                    className="p-2 rounded-lg text-muted hover:text-main hover:bg-app lg:hidden transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                
                {/* Search */}
                <div className="hidden md:flex items-center gap-3 bg-app border border-border px-4 py-2 rounded-xl w-64 xl:w-80 transition-all focus-within:border-primary/30 focus-within:shadow-sm">
                    <Search className="w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none text-main w-full placeholder:text-muted/50 font-medium text-sm outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => { setShowNotifications(!showNotifications); setDetailNotif(null); }}
                        className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-main hover:bg-app'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-danger rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-[49]" onClick={() => { setShowNotifications(false); setDetailNotif(null); }} />
                            <div className="absolute right-0 mt-2 w-[400px] card-3d rounded-2xl overflow-hidden animate-scale-in z-[50]">

                                {/* ──── DETAIL VIEW ──── */}
                                {detailNotif ? (
                                    <div className="flex flex-col">
                                        <div className="p-4 border-b border-border flex items-center gap-3">
                                            <button onClick={() => setDetailNotif(null)} className="p-1.5 rounded-lg bg-app text-muted hover:text-main transition-colors">
                                                <ChevronRight className="w-4 h-4 rotate-180" />
                                            </button>
                                            <h3 className="text-main font-semibold text-sm">Notification Detail</h3>
                                        </div>

                                        <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor(detailNotif.type, false)}`}>
                                                    {typeIcon(detailNotif.type)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">{detailNotif.type?.replace('_', ' ')}</p>
                                                    <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(detailNotif.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-main text-sm leading-relaxed">{detailNotif.message}</p>

                                            {detailNotif.upi_id && (
                                                <div className="bg-success/5 border border-success/15 rounded-xl p-4">
                                                    <p className="text-[11px] font-semibold text-success uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                        <Smartphone className="w-3 h-3" /> UPI / PhonePe
                                                    </p>
                                                    <p className="text-success font-bold text-sm">{detailNotif.upi_id}</p>
                                                    <p className="text-muted text-[11px] mt-1">Copy this ID to pay via any UPI app</p>
                                                </div>
                                            )}

                                            {detailNotif.qr_url && (
                                                <div className="bg-warning/5 border border-warning/15 rounded-xl p-4 text-center">
                                                    <p className="text-[11px] font-semibold text-warning uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
                                                        <QrCode className="w-3 h-3" /> Scan to Pay
                                                    </p>
                                                    <img
                                                        src={`${apiBase}${detailNotif.qr_url}`}
                                                        alt="Payment QR"
                                                        className="w-44 h-44 object-contain rounded-lg mx-auto border border-border cursor-pointer hover:scale-105 transition-transform"
                                                        onClick={() => window.open(`${apiBase}${detailNotif.qr_url}`, '_blank')}
                                                    />
                                                    <p className="text-muted text-[11px] mt-2">Tap to open full screen</p>
                                                </div>
                                            )}

                                            <div className="space-y-2 border-t border-border pt-4">
                                                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                                    <MessageSquareReply className="w-3 h-3" /> {detailNotif.response ? 'Your Response' : 'Reply / Acknowledge'}
                                                </p>
                                                {detailNotif.response && (
                                                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
                                                        <p className="text-primary text-sm font-medium">{detailNotif.response}</p>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder={detailNotif.response ? 'Update your response...' : 'Type acknowledgement...'}
                                                        className="input-premium flex-1 !py-2.5 !text-xs"
                                                        value={replyText}
                                                        onChange={e => setReplyText(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleReply()}
                                                    />
                                                    <button
                                                        onClick={handleReply}
                                                        disabled={replying || !replyText.trim()}
                                                        className="p-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white rounded-xl transition-all"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => deleteNotification(detailNotif._id, e)}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 text-danger hover:bg-danger/5 rounded-xl border border-danger/15 transition-all text-xs font-semibold"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ──── LIST VIEW ──── */
                                    <>
                                        {/* Tabs */}
                                        <div className="p-3 border-b border-border">
                                            <div className="flex gap-1 bg-app rounded-lg p-1">
                                                <button
                                                    onClick={() => setActiveTab('notifications')}
                                                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'notifications' ? 'bg-surface text-main shadow-sm' : 'text-muted hover:text-main'}`}
                                                >
                                                    <Bell className="w-3.5 h-3.5 inline mr-1.5" />
                                                    Alerts {unreadCount > 0 && <span className="ml-1 bg-danger text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>}
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setActiveTab('responses')}
                                                        className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'responses' ? 'bg-surface text-main shadow-sm' : 'text-muted hover:text-main'}`}
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
                                                        Replies {studentResponses.length > 0 && <span className="ml-1 bg-success text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{studentResponses.length}</span>}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notifications Tab */}
                                        {activeTab === 'notifications' && (
                                            <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                                                {notifications?.length > 0 ? (
                                                    notifications.map((n) => (
                                                        <div
                                                            key={n._id}
                                                            className={`p-4 border-b border-border/50 hover:bg-app/50 transition-colors cursor-pointer group ${!n.is_read ? 'bg-primary/3' : ''}`}
                                                            onClick={() => openDetail(n)}
                                                        >
                                                            <div className="flex gap-3 items-start">
                                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColor(n.type, n.is_read)}`}>
                                                                    {typeIcon(n.type)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-sm leading-snug truncate ${!n.is_read ? 'text-main font-semibold' : 'text-muted'}`}>
                                                                        {n.message}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1.5">
                                                                        {(n.upi_id || n.qr_url) && (
                                                                            <span className="badge bg-warning/10 text-warning text-[9px]">
                                                                                <QrCode className="w-2.5 h-2.5" /> QR
                                                                            </span>
                                                                        )}
                                                                        {n.response && (
                                                                            <span className="badge bg-primary/10 text-primary text-[9px]">
                                                                                <MessageSquareReply className="w-2.5 h-2.5" /> Replied
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[11px] text-muted flex items-center gap-1">
                                                                            <Clock className="w-2.5 h-2.5" />
                                                                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-center gap-2">
                                                                    {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full" />}
                                                                    <button
                                                                        onClick={(e) => deleteNotification(n._id, e)}
                                                                        className="p-1 text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-12 text-center text-muted text-sm font-medium">
                                                        No notifications yet
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Student Responses Tab (admin only) */}
                                        {activeTab === 'responses' && isAdmin && (
                                            <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                                                {studentResponses?.length > 0 ? (
                                                    studentResponses.map((r) => (
                                                        <div
                                                            key={r._id}
                                                            onClick={(e) => { e.stopPropagation(); openDetail(r); }}
                                                            className="p-4 border-b border-border/50 hover:bg-app/50 transition-colors cursor-pointer group"
                                                        >
                                                            <div className="flex gap-3 items-start">
                                                                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-success/10 text-success">
                                                                    <MessageSquare className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-xs font-semibold text-success">{r.student_name}</p>
                                                                        <button onClick={(e) => markAdminRead(r._id, e)} className="text-[11px] font-medium text-muted hover:text-success bg-app px-2 py-0.5 rounded-md transition-colors flex items-center gap-1">
                                                                            <CheckCircle2 className="w-3 h-3" /> Dismiss
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-muted text-xs truncate">{r.message}</p>
                                                                    <div className="bg-success/5 border border-success/10 rounded-lg px-3 py-2">
                                                                        <p className="text-main text-xs font-medium">"{r.response}"</p>
                                                                    </div>
                                                                    <p className="text-muted text-[11px] flex items-center gap-1">
                                                                        <Clock className="w-2.5 h-2.5" />
                                                                        {r.responded_at ? new Date(r.responded_at).toLocaleString() : '—'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-12 text-center text-muted text-sm font-medium">
                                                        No student replies yet
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="p-3 text-center border-t border-border">
                                            <p className="text-muted text-[11px] font-medium">Click a notification to view details & reply</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-border">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-main leading-none">{user?.username}</p>
                        <p className="text-[11px] text-muted capitalize mt-0.5">{user?.roles?.[0]}</p>
                    </div>
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white cursor-pointer hover:shadow-md transition-shadow">
                        <User className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
