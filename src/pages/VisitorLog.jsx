import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import {
    Users, LogIn, LogOut as LogOutIcon, Clock,
    Search, Plus, Loader2, Calendar, UserCheck,
    X, CheckCircle2, XCircle, Phone, Heart, MapPin,
    ClipboardList, ShieldAlert
} from 'lucide-react';

const VisitorLog = () => {
    const { user } = useAuth();
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');

    const [activeTab, setActiveTab] = useState(isAdmin ? 'all' : 'my');
    const [visitors, setVisitors] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newVisitor, setNewVisitor] = useState({
        visitor_name: '', student_room: '', purpose: '', phone: ''
    });
    const [visitorRequest, setVisitorRequest] = useState({
        visitor_name: '', phone: '', relation: '',
        visit_date: '', entry_time: '', exit_time: '', purpose: ''
    });

    const fetchAll = async () => {
        setLoading(true);
        try {
            if (isAdmin) {
                const [allRes, pendingRes] = await Promise.all([
                    api.get('/visitors/all'),
                    api.get('/visitors/pending')
                ]);
                setVisitors(allRes.data || []);
                setPendingRequests(pendingRes.data || []);
            } else {
                const res = await api.get('/visitors/my-requests');
                setMyRequests(res.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleLogEntry = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/visitors/log', newVisitor);
            setShowAddModal(false);
            setNewVisitor({ visitor_name: '', student_room: '', purpose: '', phone: '' });
            fetchAll();
        } catch (err) {
            alert('Logging failed');
        } finally { setSubmitting(false); }
    };

    const handleLogExit = async (id) => {
        try {
            await api.post(`/visitors/exit/${id}`);
            fetchAll();
        } catch (err) { alert('Exit logging failed'); }
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/visitors/request', visitorRequest);
            setShowRequestModal(false);
            setVisitorRequest({ visitor_name: '', phone: '', relation: '', visit_date: '', entry_time: '', exit_time: '', purpose: '' });
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.msg || 'Request failed');
        } finally { setSubmitting(false); }
    };

    const handleApprove = async (id, status) => {
        try {
            await api.put(`/visitors/approve/${id}`, { status });
            fetchAll();
        } catch (err) { alert('Action failed'); }
    };

    const filteredVisitors = visitors.filter(v =>
        v.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
        v.student_room?.toLowerCase().includes(search.toLowerCase())
    );

    const statusBadge = (status) => {
        const map = {
            pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            approved: 'bg-green-500/10 text-green-400 border-green-500/20',
            denied: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        };
        return map[status] || map.pending;
    };

    const inputCls = "w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-700 outline-none focus:border-primary-500 transition-colors text-sm";

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Visitor <span className="text-primary-500">Management</span></h1>
                    <p className="text-slate-500 text-[10px] font-medium tracking-tight">{isAdmin ? 'Monitor and approve guest entries.' : 'Submit and track your visitor requests.'}</p>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl w-56">
                            <Search className="w-4 h-4 text-slate-500" />
                            <input
                                type="text" placeholder="Search visitor..."
                                className="bg-transparent border-none focus:ring-0 text-slate-200 w-full text-xs"
                                value={search} onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    )}
                    {isAdmin ? (
                        <button onClick={() => setShowAddModal(true)}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all uppercase tracking-tight">
                            <Plus className="w-4 h-4" /> Log Entry
                        </button>
                    ) : (
                        <button onClick={() => setShowRequestModal(true)}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all uppercase tracking-tight">
                            <Plus className="w-4 h-4" /> Request Visitor
                        </button>
                    )}
                </div>
            </div>

            {/* Admin Tabs */}
            {isAdmin && (
                <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
                    {[
                        { key: 'all', label: 'All Visitors', icon: Users },
                        { key: 'pending', label: `Pending Requests ${pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}`, icon: ShieldAlert }
                    ].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-extrabold text-[10px] uppercase tracking-tight transition-all ${activeTab === key ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                            <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="p-20 flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                    <p className="text-slate-500 text-xs uppercase font-extrabold tracking-tight">Loading...</p>
                </div>
            ) : (
                <>
                    {/* ADMIN: All Visitor Logs */}
                    {isAdmin && activeTab === 'all' && (
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-white/5">
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Visitor</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Room / Relation</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Visit Date & Time</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Status</th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-tight text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {filteredVisitors.map((v) => (
                                        <tr key={v._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-primary-600/20 text-primary-400 rounded-xl flex items-center justify-center font-extrabold text-xs border border-primary-500/20">
                                                        {v.visitor_name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">{v.visitor_name}</p>
                                                        <p className="text-slate-500 text-[10px]">{v.phone || 'No phone'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-primary-400 font-bold text-sm">{v.student_room ? `Room ${v.student_room}` : v.relation || '—'}</p>
                                                {v.purpose && <p className="text-slate-500 text-[10px] mt-0.5">{v.purpose}</p>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    {v.visit_date && <p className="text-slate-300 text-xs font-bold">{v.visit_date}</p>}
                                                    {v.time_in && <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold uppercase">
                                                        <LogIn className="w-3 h-3" /> {new Date(v.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>}
                                                    {v.time_out && <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold uppercase">
                                                        <LogOutIcon className="w-3 h-3" /> {new Date(v.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-tight inline-flex items-center gap-1.5 border ${statusBadge(v.status || (v.time_out ? 'exited' : 'in'))}`}>
                                                    <div className="w-1 h-1 rounded-full bg-current"></div>
                                                    {v.status === 'approved' && !v.time_out ? 'In Building' : v.status || (v.time_out ? 'Exited' : 'Active')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {!v.time_out && v.status !== 'denied' && (
                                                    <button onClick={() => handleLogExit(v._id)}
                                                        className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all font-extrabold text-[9px] uppercase tracking-tight flex items-center gap-1.5 ml-auto">
                                                        <LogOutIcon className="w-3 h-3" /> Log Exit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredVisitors.length === 0 && (
                                <div className="p-12 text-center">
                                    <Users className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-500 text-sm font-bold">No visitor logs found.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ADMIN: Pending Requests */}
                    {isAdmin && activeTab === 'pending' && (
                        <div className="space-y-4">
                            {pendingRequests.length === 0 && (
                                <div className="p-16 text-center bg-slate-900/50 border border-white/5 rounded-3xl">
                                    <CheckCircle2 className="w-16 h-16 text-green-500/20 mx-auto mb-4" />
                                    <p className="text-slate-500 text-sm font-bold">No pending visitor requests.</p>
                                </div>
                            )}
                            {pendingRequests.map((v) => (
                                <div key={v._id} className="bg-slate-900/50 border border-amber-500/20 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-2xl">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center font-extrabold text-xl border border-amber-500/20">
                                            {v.visitor_name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-white font-extrabold text-base">{v.visitor_name}</h3>
                                            <div className="flex flex-wrap gap-3 text-[10px]">
                                                <span className="flex items-center gap-1.5 text-slate-400 font-bold"><Phone className="w-3 h-3" /> {v.phone}</span>
                                                <span className="flex items-center gap-1.5 text-rose-400 font-bold"><Heart className="w-3 h-3" /> {v.relation}</span>
                                                <span className="flex items-center gap-1.5 text-blue-400 font-bold"><Calendar className="w-3 h-3" /> {v.visit_date}</span>
                                                <span className="flex items-center gap-1.5 text-indigo-400 font-bold"><Clock className="w-3 h-3" /> {v.entry_time} – {v.exit_time}</span>
                                            </div>
                                            {v.purpose && <p className="text-slate-500 text-[10px]">{v.purpose}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleApprove(v._id, 'approved')}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-2xl font-extrabold text-xs transition-all border border-green-500/20 uppercase tracking-tight">
                                            <CheckCircle2 className="w-4 h-4" /> Approve
                                        </button>
                                        <button onClick={() => handleApprove(v._id, 'denied')}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl font-extrabold text-xs transition-all border border-rose-500/20 uppercase tracking-tight">
                                            <XCircle className="w-4 h-4" /> Deny
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* STUDENT: My Requests */}
                    {!isAdmin && (
                        <div className="space-y-4">
                            {myRequests.length === 0 && (
                                <div className="p-16 text-center bg-slate-900/50 border border-white/5 rounded-3xl">
                                    <ClipboardList className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-500 text-sm font-bold">No visitor requests yet.</p>
                                    <p className="text-slate-600 text-[10px] mt-1">Click "Request Visitor" to submit a new one.</p>
                                </div>
                            )}
                            {myRequests.map((v) => (
                                <div key={v._id} className={`bg-slate-900/50 border rounded-3xl p-6 shadow-2xl ${v.status === 'approved' ? 'border-green-500/20' : v.status === 'denied' ? 'border-rose-500/20' : 'border-amber-500/20'}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-primary-600/20 text-primary-400 rounded-2xl flex items-center justify-center font-extrabold text-lg border border-primary-500/20">
                                                    {v.visitor_name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-extrabold text-base">{v.visitor_name}</h3>
                                                    <p className="text-slate-500 text-[10px]">{v.relation}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-[10px]">
                                                <span className="flex items-center gap-1.5 text-slate-400"><Phone className="w-3 h-3" /> {v.phone}</span>
                                                <span className="flex items-center gap-1.5 text-blue-400"><Calendar className="w-3 h-3" /> {v.visit_date}</span>
                                                <span className="flex items-center gap-1.5 text-indigo-400"><Clock className="w-3 h-3" /> {v.entry_time} – {v.exit_time}</span>
                                            </div>
                                            {v.purpose && <p className="text-slate-600 text-[10px]">{v.purpose}</p>}
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-tight border whitespace-nowrap ${statusBadge(v.status)}`}>
                                            {v.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ADMIN: Log Entry Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-sm shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-extrabold text-white">Log <span className="text-primary-500">Visitor</span></h2>
                                <p className="text-slate-500 text-[10px] mt-0.5">Direct admin entry log.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleLogEntry} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Visitor Name</label>
                                <input type="text" required className={inputCls} placeholder="Full name" value={newVisitor.visitor_name} onChange={e => setNewVisitor({ ...newVisitor, visitor_name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Room #</label>
                                    <input type="text" required className={inputCls} placeholder="Room" value={newVisitor.student_room} onChange={e => setNewVisitor({ ...newVisitor, student_room: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Phone</label>
                                    <input type="text" className={inputCls} placeholder="Contact" value={newVisitor.phone} onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Purpose</label>
                                <textarea className={inputCls} rows="2" placeholder="Reason..." value={newVisitor.purpose} onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-2xl font-bold text-slate-500 border border-slate-800 text-[10px] uppercase tracking-widest">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-extrabold shadow-lg transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* STUDENT: Visitor Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center sticky top-0">
                            <div>
                                <h2 className="text-lg font-extrabold text-white">Visitor <span className="text-primary-500">Request</span></h2>
                                <p className="text-slate-500 text-[10px] mt-0.5">Submit a visitor pre-registration for approval.</p>
                            </div>
                            <button onClick={() => setShowRequestModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Visitor Name *</label>
                                <input type="text" required className={inputCls} placeholder="Full name of your visitor" value={visitorRequest.visitor_name} onChange={e => setVisitorRequest({ ...visitorRequest, visitor_name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Phone *</label>
                                    <input type="tel" required className={inputCls} placeholder="Visitor's number" value={visitorRequest.phone} onChange={e => setVisitorRequest({ ...visitorRequest, phone: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Relation *</label>
                                    <select required className={inputCls} value={visitorRequest.relation} onChange={e => setVisitorRequest({ ...visitorRequest, relation: e.target.value })}>
                                        <option value="">Select relation</option>
                                        <option value="Parent">Parent</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Friend">Friend</option>
                                        <option value="Relative">Relative</option>
                                        <option value="Guardian">Guardian</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Visit Date *</label>
                                <input type="date" required className={inputCls} min={new Date().toISOString().split('T')[0]} value={visitorRequest.visit_date} onChange={e => setVisitorRequest({ ...visitorRequest, visit_date: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Entry Time *</label>
                                    <input type="time" required className={inputCls} value={visitorRequest.entry_time} onChange={e => setVisitorRequest({ ...visitorRequest, entry_time: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Exit Time *</label>
                                    <input type="time" required className={inputCls} value={visitorRequest.exit_time} onChange={e => setVisitorRequest({ ...visitorRequest, exit_time: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Purpose (optional)</label>
                                <textarea className={inputCls} rows="2" placeholder="Reason for visit..." value={visitorRequest.purpose} onChange={e => setVisitorRequest({ ...visitorRequest, purpose: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-3 rounded-2xl font-bold text-slate-500 border border-slate-800 text-[10px] uppercase tracking-widest">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-extrabold shadow-lg transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserCheck className="w-4 h-4" /> Submit Request</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorLog;
