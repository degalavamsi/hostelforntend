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

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Facility <span className="text-primary-500">Hub</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-medium tracking-tight">Configure and monitor hostel infrastructure.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl font-extrabold text-[10px] uppercase tracking-tight flex items-center gap-2 shadow-lg shadow-primary-900/20 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add New {activeTab === TABS.wifi ? 'WiFi' : activeTab === TABS.washing ? 'Machine' : 'Dispenser'}
                </button>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
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
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-extrabold text-[10px] uppercase tracking-tight transition-all ${activeTab === key
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl w-full md:w-72">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        className="bg-transparent border-none focus:ring-0 text-slate-200 w-full text-xs"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Table/Grid */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="p-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                        <p className="text-slate-500 text-[10px] uppercase font-black tracking-tight">Synchronizing Data...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <Activity className="w-16 h-16 text-slate-800" />
                        <p className="text-slate-500 font-bold">No records found for this category.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tight">Identity / Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tight">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tight">Specs / Info</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tight">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tight text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredItems.map((item) => (
                                    <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border ${activeTab === TABS.wifi ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    activeTab === TABS.washing ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        activeTab === TABS.electricity ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                            activeTab === TABS.maintenance ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                                'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                                    }`}>
                                                    {activeTab === TABS.wifi ? 'WF' : activeTab === TABS.washing ? 'WM' : activeTab === TABS.electricity ? 'EL' : activeTab === TABS.maintenance ? 'MT' : 'WT'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm tracking-tight">
                                                        {[TABS.electricity, TABS.maintenance].includes(activeTab) ? item.title :
                                                            activeTab === TABS.wifi ? item.ssid : activeTab === TABS.washing ? `Machine ${item.machine_number}` : `Dispenser ${item.machine_id}`}
                                                    </p>
                                                    <p className="text-slate-500 text-[10px] tracking-tight">
                                                        {[TABS.electricity, TABS.maintenance].includes(activeTab) ? `Reported by ${item.student_name}` :
                                                            activeTab === TABS.wifi ? 'Floor Network' : activeTab === TABS.washing ? 'Laundry Utility' : `${item.type} Managed`}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {[TABS.electricity, TABS.maintenance].includes(activeTab) ? (
                                                <p className="text-slate-300 text-xs line-clamp-1 italic">{item.content}</p>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2 text-slate-300 font-bold text-xs tracking-tight">
                                                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                                                        Block {item.block}, Floor {item.floor}
                                                    </div>
                                                    {item.location && <p className="text-slate-500 text-[10px] mt-1">{item.location}</p>}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-slate-300 text-[10px] font-black uppercase tracking-tight">
                                                    {[TABS.electricity, TABS.maintenance].includes(activeTab) ? `Priority: ${item.priority || 'Medium'}` :
                                                        activeTab === TABS.wifi ? `Speed: ${item.speed}` : activeTab === TABS.washing ? `Clock: ${item.timings}` : `Maintained: ${item.last_maintenance}`}
                                                </p>
                                                {activeTab === TABS.wifi && <p className="text-slate-500 text-[9px]">Pass: {item.password}</p>}
                                                {[TABS.electricity, TABS.maintenance].includes(activeTab) && <p className="text-slate-700 text-[8px] font-black uppercase tracking-tighter">{new Date(item.created_at).toLocaleDateString()}</p>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight flex items-center gap-1.5 w-fit ${['Available', 'Active', 'resolved'].includes(item.status) ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${['Available', 'Active', 'resolved'].includes(item.status) ? 'bg-green-400' : 'bg-rose-400'}`}></div>
                                                {item.status?.replace('_', ' ') || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {![TABS.electricity, TABS.maintenance].includes(activeTab) ? (
                                                    <>
                                                        <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Edit"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </>
                                                ) : (
                                                    <button className="px-4 py-2 bg-white/5 hover:bg-primary-600 text-slate-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-tight transition-all border border-white/5">Action</button>
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
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-slate-900 border border-white/5 w-full max-w-lg rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-primary-600/20 rounded-2xl text-primary-500">
                                {activeTab === TABS.wifi ? <Wifi className="w-6 h-6" /> : activeTab === TABS.washing ? <Zap className="w-6 h-6" /> : <Droplets className="w-6 h-6" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">{editingItem ? 'Update' : 'Register'} {activeTab === TABS.wifi ? 'WiFi' : activeTab === TABS.washing ? 'Washing Machine' : 'Water Dispenser'}</h2>
                                <p className="text-slate-500 text-[10px] font-medium tracking-tight uppercase">Infrastructure Control Panel</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Block Name</label>
                                    <input type="text" required placeholder="A, B, C..." className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-700 outline-none focus:border-primary-500 transition-colors" value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Floor Level</label>
                                    <input type="number" required placeholder="0, 1, 2..." className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-700 outline-none focus:border-primary-500 transition-colors" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} />
                                </div>
                            </div>

                            {activeTab === TABS.wifi ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">SSID (WiFi Name)</label>
                                        <input type="text" required className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.ssid} onChange={(e) => setFormData({ ...formData, ssid: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Network Password</label>
                                        <input type="text" required className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Est. Speed</label>
                                            <input type="text" required placeholder="e.g. 100 Mbps" className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.speed} onChange={(e) => setFormData({ ...formData, speed: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Service Status</label>
                                            <select className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
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
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Machine #</label>
                                            <input type="text" required className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.machine_number} onChange={(e) => setFormData({ ...formData, machine_number: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Current Status</label>
                                            <select className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="Available">Available</option>
                                                <option value="Occupied">Occupied</option>
                                                <option value="Under Maintenance">Under Maintenance</option>
                                                <option value="Broken">Broken</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Exact Location (e.g. Near Laundry Room)</label>
                                        <input type="text" required className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Operating Timings</label>
                                        <input type="text" required className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.timings} onChange={(e) => setFormData({ ...formData, timings: e.target.value })} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Machine Name / ID</label>
                                            <input type="text" required className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.machine_id} onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Water Type</label>
                                            <select className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                                <option value="RO">RO Purifier</option>
                                                <option value="Mineral">Mineral Water</option>
                                                <option value="Cold">Cold Water</option>
                                                <option value="Combined">Combined System</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Last Maintenance</label>
                                            <input type="date" required className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.last_maintenance} onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight ml-1">Active Status</label>
                                            <select className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="Available">Available</option>
                                                <option value="Maintenance">Maintenance</option>
                                                <option value="Offline">Offline</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:text-white transition-colors border border-white/5 rounded-2xl uppercase text-[10px] tracking-widest">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
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
