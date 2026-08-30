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
            pending: 'bg-warning/10 text-warning border-warning/20',
            approved: 'bg-success/10 text-success border-success/20',
            denied: 'bg-danger/10 text-danger border-danger/20',
        };
        return map[status] || map.pending;
    };

    const inputCls = "w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted/50";

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-main tracking-tight">Visitor <span className="text-primary">Management</span></h1>
                    <p className="text-muted text-xs font-medium uppercase tracking-wider mt-1">{isAdmin ? 'Monitor and approve guest entries.' : 'Submit and track your visitor requests.'}</p>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <div className="flex items-center gap-3 card-3d px-4 py-2.5 rounded-xl w-64 shadow-sm focus-within:border-primary/50 transition-colors">
                            <Search className="w-4 h-4 text-muted" />
                            <input
                                type="text" placeholder="Search visitor..."
                                className="bg-transparent border-none focus:ring-0 text-main w-full text-sm font-medium outline-none placeholder:text-muted/50"
                                value={search} onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    )}
                    {isAdmin ? (
                        <button onClick={() => setShowAddModal(true)}
                            className="bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
                            <Plus className="w-4 h-4" /> Log Entry
                        </button>
                    ) : (
                        <button onClick={() => setShowRequestModal(true)}
                            className="bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
                            <Plus className="w-4 h-4" /> Request Visitor
                        </button>
                    )}
                </div>
            </div>

            {/* Admin Tabs */}
            {isAdmin && (
                <div className="flex gap-2 border-b border-border w-full">
                    {[
                        { key: 'all', label: 'All Visitors', icon: Users },
                        { key: 'pending', label: `Pending Requests ${pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}`, icon: ShieldAlert }
                    ].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-[1px] ${activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-main'}`}>
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="p-20 flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted text-[10px] uppercase font-bold tracking-wider">Loading...</p>
                </div>
            ) : (
                <>
                    {/* ADMIN: All Visitor Logs */}
                    {isAdmin && activeTab === 'all' && (
                        <div className="card-3d rounded-3xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-app">
                                            <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider">Visitor</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider">Room / Relation</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider">Visit Date & Time</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredVisitors.map((v) => (
                                            <tr key={v._id} className="hover:bg-app/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-sm border border-primary/20">
                                                            {v.visitor_name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-main font-semibold text-sm">{v.visitor_name}</p>
                                                            <p className="text-muted text-[10px] font-medium">{v.phone || 'No phone'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-primary font-semibold text-sm">{v.student_room ? `Room ${v.student_room}` : v.relation || '—'}</p>
                                                    {v.purpose && <p className="text-muted text-[10px] font-medium mt-0.5">{v.purpose}</p>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1.5">
                                                        {v.visit_date && <p className="text-main text-xs font-semibold">{v.visit_date}</p>}
                                                        {v.time_in && <div className="flex items-center gap-1.5 text-[10px] text-success font-bold uppercase tracking-wider">
                                                            <LogIn className="w-3.5 h-3.5" /> {new Date(v.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>}
                                                        {v.time_out && <div className="flex items-center gap-1.5 text-[10px] text-danger font-bold uppercase tracking-wider">
                                                            <LogOutIcon className="w-3.5 h-3.5" /> {new Date(v.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${statusBadge(v.status || (v.time_out ? 'exited' : 'in'))}`}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                        {v.status === 'approved' && !v.time_out ? 'In Building' : v.status || (v.time_out ? 'Exited' : 'Active')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {!v.time_out && v.status !== 'denied' && (
                                                        <button onClick={() => handleLogExit(v._id)}
                                                            className="px-4 py-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 ml-auto">
                                                            <LogOutIcon className="w-4 h-4" /> Log Exit
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredVisitors.length === 0 && (
                                <div className="p-16 text-center">
                                    <Users className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                                    <p className="text-muted text-sm font-semibold">No visitor logs found.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ADMIN: Pending Requests */}
                    {isAdmin && activeTab === 'pending' && (
                        <div className="space-y-4">
                            {pendingRequests.length === 0 && (
                                <div className="p-16 text-center card-3d rounded-3xl">
                                    <CheckCircle2 className="w-16 h-16 text-success/50 mx-auto mb-4" />
                                    <p className="text-muted text-sm font-semibold">No pending visitor requests.</p>
                                </div>
                            )}
                            {pendingRequests.map((v) => (
                                <div key={v._id} className="card-3d border-warning/30 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:border-warning/50 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-warning/10 text-warning rounded-2xl flex items-center justify-center font-bold text-xl border border-warning/20">
                                            {v.visitor_name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-main font-bold text-lg">{v.visitor_name}</h3>
                                            <div className="flex flex-wrap gap-4 text-[11px]">
                                                <span className="flex items-center gap-1.5 text-muted font-semibold"><Phone className="w-3.5 h-3.5" /> {v.phone}</span>
                                                <span className="flex items-center gap-1.5 text-danger font-semibold"><Heart className="w-3.5 h-3.5" /> {v.relation}</span>
                                                <span className="flex items-center gap-1.5 text-blue-500 font-semibold"><Calendar className="w-3.5 h-3.5" /> {v.visit_date}</span>
                                                <span className="flex items-center gap-1.5 text-indigo-500 font-semibold"><Clock className="w-3.5 h-3.5" /> {v.entry_time} – {v.exit_time}</span>
                                            </div>
                                            {v.purpose && <p className="text-muted text-[11px] font-medium">{v.purpose}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleApprove(v._id, 'approved')}
                                            className="flex items-center gap-2 px-5 py-3 bg-success/10 text-success hover:bg-success hover:text-white rounded-xl font-bold text-xs transition-all border border-success/20 uppercase tracking-wider">
                                            <CheckCircle2 className="w-4 h-4" /> Approve
                                        </button>
                                        <button onClick={() => handleApprove(v._id, 'denied')}
                                            className="flex items-center gap-2 px-5 py-3 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-xl font-bold text-xs transition-all border border-danger/20 uppercase tracking-wider">
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
                                <div className="p-16 text-center card-3d rounded-3xl">
                                    <ClipboardList className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                                    <p className="text-main text-sm font-semibold">No visitor requests yet.</p>
                                    <p className="text-muted text-[11px] font-medium mt-1">Click "Request Visitor" to submit a new one.</p>
                                </div>
                            )}
                            {myRequests.map((v) => (
                                <div key={v._id} className={`bg-surface border rounded-3xl p-6 shadow-floating hover:shadow-lg transition-all ${v.status === 'approved' ? 'border-success/30' : v.status === 'denied' ? 'border-danger/30' : 'border-warning/30'}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-lg border border-primary/20">
                                                    {v.visitor_name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-main font-bold text-base">{v.visitor_name}</h3>
                                                    <p className="text-muted text-[11px] font-semibold">{v.relation}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-[11px]">
                                                <span className="flex items-center gap-1.5 text-muted font-semibold"><Phone className="w-3.5 h-3.5" /> {v.phone}</span>
                                                <span className="flex items-center gap-1.5 text-blue-500 font-semibold"><Calendar className="w-3.5 h-3.5" /> {v.visit_date}</span>
                                                <span className="flex items-center gap-1.5 text-indigo-500 font-semibold"><Clock className="w-3.5 h-3.5" /> {v.entry_time} – {v.exit_time}</span>
                                            </div>
                                            {v.purpose && <p className="text-muted text-[11px] font-medium">{v.purpose}</p>}
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${statusBadge(v.status)}`}>
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
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
                    <div className="card-3d rounded-3xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-app flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold text-main tracking-tight">Log <span className="text-primary">Visitor</span></h2>
                                <p className="text-muted text-xs font-medium mt-1">Direct admin entry log.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-muted hover:text-main hover:bg-border rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleLogEntry} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Visitor Name</label>
                                <input type="text" required className={inputCls} placeholder="Full name" value={newVisitor.visitor_name} onChange={e => setNewVisitor({ ...newVisitor, visitor_name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Room #</label>
                                    <input type="text" required className={inputCls} placeholder="Room" value={newVisitor.student_room} onChange={e => setNewVisitor({ ...newVisitor, student_room: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Phone</label>
                                    <input type="text" className={inputCls} placeholder="Contact" value={newVisitor.phone} onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Purpose</label>
                                <textarea className={inputCls} rows="2" placeholder="Reason..." value={newVisitor.purpose} onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3.5 rounded-xl font-medium text-muted border border-border hover:bg-border transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-primary hover:opacity-90 text-white rounded-xl font-medium shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* STUDENT: Visitor Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
                    <div className="card-3d rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-border bg-app flex justify-between items-center shrink-0 rounded-t-3xl">
                            <div>
                                <h2 className="text-xl font-semibold text-main tracking-tight">Visitor <span className="text-primary">Request</span></h2>
                                <p className="text-muted text-xs font-medium mt-1">Submit a visitor pre-registration for approval.</p>
                            </div>
                            <button onClick={() => setShowRequestModal(false)} className="p-2 text-muted hover:text-main hover:bg-border rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            <form onSubmit={handleSubmitRequest} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Visitor Name *</label>
                                    <input type="text" required className={inputCls} placeholder="Full name of your visitor" value={visitorRequest.visitor_name} onChange={e => setVisitorRequest({ ...visitorRequest, visitor_name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Phone *</label>
                                        <input type="tel" required className={inputCls} placeholder="Visitor's number" value={visitorRequest.phone} onChange={e => setVisitorRequest({ ...visitorRequest, phone: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Relation *</label>
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
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Visit Date *</label>
                                    <input type="date" required className={inputCls} min={new Date().toISOString().split('T')[0]} value={visitorRequest.visit_date} onChange={e => setVisitorRequest({ ...visitorRequest, visit_date: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Entry Time *</label>
                                        <input type="time" required className={inputCls} value={visitorRequest.entry_time} onChange={e => setVisitorRequest({ ...visitorRequest, entry_time: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Exit Time *</label>
                                        <input type="time" required className={inputCls} value={visitorRequest.exit_time} onChange={e => setVisitorRequest({ ...visitorRequest, exit_time: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Purpose (optional)</label>
                                    <textarea className={inputCls} rows="2" placeholder="Reason for visit..." value={visitorRequest.purpose} onChange={e => setVisitorRequest({ ...visitorRequest, purpose: e.target.value })} />
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-border/50">
                                    <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-3.5 rounded-xl font-medium text-muted border border-border hover:bg-border transition-colors">Cancel</button>
                                    <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-primary hover:opacity-90 text-white rounded-xl font-medium shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserCheck className="w-5 h-5" /> Submit Request</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorLog;
