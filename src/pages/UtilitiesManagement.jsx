import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Zap, Wifi, Droplets, Plus, Pencil, Trash2,
    Save, X, Loader2, Search, Filter, AlertTriangle,
    CheckCircle2, Clock, MapPin, Activity, Settings2
} from 'lucide-react';
import FullPageLoader from '../components/FullPageLoader';

const TABS = { washing: 'washing', water: 'water', wifi: 'wifi', electricity: 'electricity', maintenance: 'maintenance' };

const UtilitiesManagement = () => {
    const [activeTab, setActiveTab] = useState(TABS.washing);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    const fetchData = async () => {
        setLoading(true);
        try {
            if ([TABS.electricity, TABS.maintenance].includes(activeTab)) {
                const res = await api.get('/notices/complaints/all');
                setItems(res.data.filter(c =>
                    activeTab === TABS.maintenance ? c.category === 'maintenance' :
                        (c.title.toLowerCase().includes('elect') || c.content.toLowerCase().includes('power') || c.content.toLowerCase().includes('light'))
                ));
            } else {
                const endpoint = activeTab === TABS.wifi ? '/utilities/wifi' :
                    activeTab === TABS.washing ? '/utilities/washing' : '/utilities/water';
                const res = await api.get(endpoint);
                setItems(res.data);
            }
        } catch (err) {
            console.error('Fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setSearch(''); // Reset search on tab change
    }, [activeTab]);

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            setFormData({ ...item });
        } else {
            // Default values based on tab
            if (activeTab === TABS.washing) {
                setFormData({ machine_number: '', block: '', floor: '', status: 'Available', location: '', timings: '6:00 AM - 10:00 PM' });
            } else if (activeTab === TABS.water) {
                setFormData({ machine_id: '', block: '', floor: '', type: 'RO', status: 'Available', last_maintenance: new Date().toISOString().split('T')[0] });
            } else {
                setFormData({ block: '', floor: '', ssid: '', password: '', speed: '100 Mbps', status: 'Active' });
            }
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = activeTab === TABS.wifi ? '/utilities/wifi' :
                activeTab === TABS.washing ? '/utilities/washing' : '/utilities/water';

            if (editingItem) {
                await api.put(`${endpoint}/${editingItem._id}`, formData);
            } else {
                await api.post(endpoint, formData);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Operation failed. Internal server error.';
            alert(`Error: ${errorMsg}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        try {
            const endpoint = activeTab === TABS.wifi ? '/utilities/wifi' :
                activeTab === TABS.washing ? '/utilities/washing' : '/utilities/water';
            await api.delete(`${endpoint}/${id}`);
            fetchData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const filteredItems = items.filter(item => {
        const searchStr = search.toLowerCase();

        const safeString = (val) => val ? String(val).toLowerCase() : '';

        if ([TABS.electricity, TABS.maintenance].includes(activeTab)) return safeString(item.title).includes(searchStr) || safeString(item.student_name).includes(searchStr);
        if (activeTab === TABS.washing) return safeString(item.machine_number).includes(searchStr) || safeString(item.block).includes(searchStr);
        if (activeTab === TABS.water) return safeString(item.machine_id).includes(searchStr) || safeString(item.block).includes(searchStr);

        return safeString(item.ssid).includes(searchStr) || safeString(item.block).includes(searchStr);
    });

    if (loading) return <FullPageLoader message="Connecting to Subsystems..." />;

    const inputCls = "w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted/50";

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-main tracking-tight">Facility <span className="text-primary">Hub</span>
                    </h1>
                    <p className="text-muted text-xs font-medium uppercase tracking-wider mt-1">Configure and monitor hostel infrastructure.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add New {activeTab === TABS.wifi ? 'WiFi' : activeTab === TABS.washing ? 'Machine' : 'Dispenser'}
                </button>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between border-b border-border pb-4">
                <div className="flex gap-2 w-full overflow-x-auto custom-scrollbar pb-2 xl:pb-0">
                    {[
                        { key: TABS.washing, icon: Zap, label: 'Washing' },
                        { key: TABS.water, icon: Droplets, label: 'Water' },
                        { key: TABS.wifi, icon: Wifi, label: 'WiFi' },
                        { key: TABS.electricity, icon: AlertTriangle, label: 'Electricity' },
                        { key: TABS.maintenance, icon: Settings2, label: 'Maintenance' }
                    ].map(({ key, icon: Icon, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-6 py-2.5 font-semibold text-sm transition-all rounded-xl whitespace-nowrap ${activeTab === key ? 'bg-primary text-white shadow-md'
                                : 'text-muted hover:text-main hover:bg-surface'
                                }`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 card-3d px-4 py-2.5 rounded-xl w-full xl:w-72 shadow-sm focus-within:border-primary/50 transition-colors shrink-0">
                    <Search className="w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        className="bg-transparent border-none focus:ring-0 text-main w-full text-sm font-medium outline-none placeholder:text-muted/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Table/Grid */}
            <div className="card-3d overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted text-[10px] uppercase font-bold tracking-wider">Synchronizing Data...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <Activity className="w-16 h-16 text-muted/30" />
                        <p className="text-muted font-semibold">No records found for this category.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-app">
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider">Identity / Details</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider">Specs / Info</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredItems.map((item) => (
                                    <tr key={item._id} className="hover:bg-app/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs border ${activeTab === TABS.wifi ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    activeTab === TABS.washing ? 'bg-warning/10 text-warning border-warning/20' :
                                                        activeTab === TABS.electricity ? 'bg-danger/10 text-danger border-danger/20' :
                                                            activeTab === TABS.maintenance ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                                                                'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                                                    }`}>
                                                    {activeTab === TABS.wifi ? 'WF' : activeTab === TABS.washing ? 'WM' : activeTab === TABS.electricity ? 'EL' : activeTab === TABS.maintenance ? 'MT' : 'WT'}
                                                </div>
                                                <div>
                                                    <p className="text-main font-semibold text-sm">
                                                        {[TABS.electricity, TABS.maintenance].includes(activeTab) ? item.title :
                                                            activeTab === TABS.wifi ? item.ssid : activeTab === TABS.washing ? `Machine ${item.machine_number}` : `Dispenser ${item.machine_id}`}
                                                    </p>
                                                    <p className="text-muted text-[11px] font-medium">
                                                        {[TABS.electricity, TABS.maintenance].includes(activeTab) ? `Reported by ${item.student_name}` :
                                                            activeTab === TABS.wifi ? 'Floor Network' : activeTab === TABS.washing ? 'Laundry Utility' : `${item.type} Managed`}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {[TABS.electricity, TABS.maintenance].includes(activeTab) ? (
                                                <p className="text-main text-xs line-clamp-1 italic">{item.content}</p>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2 text-main font-semibold text-xs">
                                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                                        Block {item.block}, Floor {item.floor}
                                                    </div>
                                                    {item.location && <p className="text-muted text-[11px] font-medium mt-1">{item.location}</p>}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <p className="text-main text-[11px] font-semibold uppercase tracking-wider">
                                                    {[TABS.electricity, TABS.maintenance].includes(activeTab) ? `Priority: ${item.priority || 'Medium'}` :
                                                        activeTab === TABS.wifi ? `Speed: ${item.speed}` : activeTab === TABS.washing ? `Clock: ${item.timings}` : `Maintained: ${item.last_maintenance}`}
                                                </p>
                                                {activeTab === TABS.wifi && <p className="text-muted text-[10px] font-medium">Pass: {item.password}</p>}
                                                {[TABS.electricity, TABS.maintenance].includes(activeTab) && <p className="text-muted/70 text-[9px] font-bold uppercase tracking-wider">{new Date(item.created_at).toLocaleDateString()}</p>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${['Available', 'Active', 'resolved'].includes(item.status) ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${['Available', 'Active', 'resolved'].includes(item.status) ? 'bg-success' : 'bg-danger'}`}></div>
                                                {item.status?.replace('_', ' ') || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {![TABS.electricity, TABS.maintenance].includes(activeTab) ? (
                                                    <>
                                                        <button onClick={() => handleOpenModal(item)} className="p-2 text-muted hover:text-main hover:bg-border rounded-xl transition-all" title="Edit"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(item._id)} className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </>
                                                ) : (
                                                    <button className="px-4 py-2 bg-app hover:bg-primary text-muted hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border border-border">Action</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CRUD Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="card-3d w-full max-w-lg p-8 relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-muted hover:text-main bg-app hover:bg-border p-2 rounded-xl transition-colors"><X className="w-5 h-5" /></button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 icon-3d text-primary">
                                {activeTab === TABS.wifi ? <Wifi className="w-6 h-6" /> : activeTab === TABS.washing ? <Zap className="w-6 h-6" /> : <Droplets className="w-6 h-6" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-main tracking-tight">{editingItem ? 'Update' : 'Register'} {activeTab === TABS.wifi ? 'WiFi' : activeTab === TABS.washing ? 'Washing Machine' : 'Water Dispenser'}</h2>
                                <p className="text-muted text-xs font-medium uppercase tracking-wider mt-1">Infrastructure Control Panel</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Block Name</label>
                                    <input type="text" required placeholder="A, B, C..." className={inputCls} value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Floor Level</label>
                                    <input type="number" required placeholder="0, 1, 2..." className={inputCls} value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} />
                                </div>
                            </div>

                            {activeTab === TABS.wifi ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">SSID (WiFi Name)</label>
                                        <input type="text" required className={inputCls} value={formData.ssid} onChange={(e) => setFormData({ ...formData, ssid: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Network Password</label>
                                        <input type="text" required className={inputCls} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Est. Speed</label>
                                            <input type="text" required placeholder="e.g. 100 Mbps" className={inputCls} value={formData.speed} onChange={(e) => setFormData({ ...formData, speed: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Service Status</label>
                                            <select className={inputCls} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="Active">Active</option>
                                                <option value="Maintenance">Maintenance</option>
                                                <option value="Disabled">Disabled</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : activeTab === TABS.washing ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Machine #</label>
                                            <input type="text" required className={inputCls} value={formData.machine_number} onChange={(e) => setFormData({ ...formData, machine_number: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Current Status</label>
                                            <select className={inputCls} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="Available">Available</option>
                                                <option value="Occupied">Occupied</option>
                                                <option value="Under Maintenance">Under Maintenance</option>
                                                <option value="Broken">Broken</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Exact Location (e.g. Near Laundry Room)</label>
                                        <input type="text" required className={inputCls} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Operating Timings</label>
                                        <input type="text" required className={inputCls} value={formData.timings} onChange={(e) => setFormData({ ...formData, timings: e.target.value })} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Machine Name / ID</label>
                                            <input type="text" required className={inputCls} value={formData.machine_id} onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Water Type</label>
                                            <select className={inputCls} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                                <option value="RO">RO Purifier</option>
                                                <option value="Mineral">Mineral Water</option>
                                                <option value="Cold">Cold Water</option>
                                                <option value="Combined">Combined System</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Last Maintenance</label>
                                            <input type="date" required className={inputCls} value={formData.last_maintenance} onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Active Status</label>
                                            <select className={inputCls} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="Available">Available</option>
                                                <option value="Maintenance">Maintenance</option>
                                                <option value="Offline">Offline</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 text-muted font-medium hover:text-main hover:bg-border transition-colors border border-border rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary hover:opacity-90 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" /> {editingItem ? 'Save Updates' : 'Confirm Registration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UtilitiesManagement;
