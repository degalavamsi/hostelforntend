import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Wifi, Zap, Droplets, Bell, MapPin, Activity,
    ShieldCheck, Clock, Signal, Info, Loader2, AlertCircle
} from 'lucide-react';
import FullPageLoader from '../components/FullPageLoader';

const FacilitiesDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [wifi, setWifi] = useState([]);
    const [washing, setWashing] = useState([]);
    const [water, setWater] = useState([]);
    const [notices, setNotices] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                api.get('/auth/profile'),
                api.get('/utilities/wifi'),
                api.get('/utilities/washing'),
                api.get('/utilities/water'),
                api.get('/notices')
            ]);

            const [profileRes, wifiRes, washingRes, waterRes, noticesRes] = results.map(r => r.status === 'fulfilled' ? r.value : { data: null });

            if (profileRes.data) setProfile(profileRes.data);
            if (wifiRes.data) setWifi(wifiRes.data);
            if (washingRes.data) setWashing(washingRes.data);
            if (waterRes.data) setWater(waterRes.data);
            if (noticesRes.data) setNotices(noticesRes.data);
        } catch (err) {
            console.error('Fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <FullPageLoader message="Loading Facilities..." />;

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500 pb-10 px-4 md:px-0">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                        Facilities <span className="text-primary-500">Dashboard</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-medium tracking-tight">Real-time status of your floor and hostel utilities.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-2xl w-fit">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight leading-none">Your Location</p>
                        <p className="text-white font-bold text-xs">Block {profile?.block || 'NA'} • Floor {profile?.floor || 'NA'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: WiFi & Common Utilities */}
                <div className="lg:col-span-1 space-y-6">
                    {/* WiFi Networks */}
                    <div className="space-y-6">
                        {wifi.map(w => (
                            <div key={w._id} className="bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent border border-blue-500/20 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] group-hover:bg-blue-500/20 transition-all"></div>
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                                        <Wifi className="w-6 h-6" />
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${w?.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {w.status || w.service_status || 'Offline'}
                                    </span>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">{w.ssid || w.network_name || 'Unknown'}</h3>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Block {w.block} • Floor {w.floor}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group/row hover:border-blue-500/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="w-4 h-4 text-blue-400" />
                                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-tight">Password</span>
                                            </div>
                                            <span className="text-white font-bold text-sm tracking-wider select-all">{w.password || w.network_password || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Signal className="w-4 h-4 text-blue-400" />
                                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-tight">Speed</span>
                                            </div>
                                            <span className="text-white font-bold text-sm">{w.speed || w.est_speed || '—'}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-3 italic">
                                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <p className="text-blue-400/80 text-[10px] leading-relaxed font-bold">Only residents of Block {w.block} Floor {w.floor} are authorized.</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {wifi.length === 0 && (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-10 shadow-2xl relative overflow-hidden text-center opacity-50">
                                <Wifi className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                                <p className="text-slate-500 font-bold text-sm">No WiFi Configured in Hostel.</p>
                            </div>
                        )}
                    </div>

                    {/* Announcement Feed */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl space-y-6 flex flex-col h-[400px]">
                        <div className="flex items-center gap-3 px-2">
                            <Bell className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-black text-white">Live Pulse</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                            {notices.map(notice => (
                                <div key={notice._id} className={`p-5 rounded-2xl border transition-all hover:bg-white/5 ${notice.priority === 'urgent' ? 'bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-900/10' : 'bg-slate-800/20 border-white/5'
                                    }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-bold text-sm tracking-tight ${notice.priority === 'urgent' ? 'text-rose-400' : 'text-slate-200'}`}>
                                            {notice.title}
                                        </h4>
                                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 text-[11px] leading-relaxed mb-3">{notice.content}</p>
                                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-tight text-slate-600 border-t border-white/5 pt-3">
                                        <span>Official Update</span>
                                        <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {notices.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <Bell className="w-16 h-16 mb-4" />
                                    <p className="text-xs uppercase font-black tracking-widest">No active notices</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Machines & Utilities */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Washing Machines Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-amber-500" />
                                <h2 className="text-xl font-black text-white">Washing Ecosystem</h2>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Refresh Real-time</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {washing.map(machine => (
                                <div key={machine._id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-amber-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                                                <Zap className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-black text-lg tracking-tighter">Machine {machine.machine_number}</h3>
                                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">{machine.location || `Floor ${machine.floor}`}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border ${machine.status === 'Available' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            machine.status === 'Occupied' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                            }`}>
                                            {machine.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="p-3 bg-white/5 rounded-xl text-center border border-white/5">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-tight mb-1">Position</p>
                                            <p className="text-xs text-white font-bold italic">Block {machine.block}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-xl text-center border border-white/5">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-tight mb-1">Operating</p>
                                            <p className="text-xs text-white font-bold italic truncate">{machine.timings}</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-3 bg-white/5 hover:bg-amber-600 text-slate-400 hover:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-white/5 hover:border-amber-500 shadow-xl group/btn">
                                        Reserve Machine <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity ml-1">→</span>
                                    </button>
                                </div>
                            ))}
                            {washing.length === 0 && (
                                <div className="col-span-2 py-12 bg-slate-800/10 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-700">
                                    <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
                                    <p className="text-sm font-bold opacity-30">No machines listed for this area.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Drinking Water Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <Droplets className="w-5 h-5 text-cyan-500" />
                            <h2 className="text-xl font-black text-white">Hydration Stations</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {water.map(station => (
                                <div key={station._id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/30 transition-all group flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400">
                                            <Droplets className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black text-lg tracking-tighter">{station.machine_id}</h3>
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-tight">Block {station.block} • Floor {station.floor}</p>
                                            <p className="text-cyan-500/80 text-[10px] h-4 mt-1 font-bold">{station.type} System</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase mb-1 tracking-tight ${station.status === 'Available' ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'
                                            }`}>
                                            {station.status}
                                        </div>
                                        <p className="text-[7px] text-slate-600 font-bold uppercase tracking-tight">Clean: {station.last_maintenance}</p>
                                    </div>
                                </div>
                            ))}
                            {water.length === 0 && (
                                <div className="col-span-2 py-12 bg-slate-800/10 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-700">
                                    <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
                                    <p className="text-sm font-bold opacity-30">No hydration stations located.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacilitiesDashboard;
