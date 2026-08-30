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
                    <h1 className="text-2xl font-semibold text-main tracking-tight">
                        Facilities <span className="text-primary">Dashboard</span>
                    </h1>
                    <p className="text-muted text-xs font-medium uppercase tracking-wider mt-1">Real-time status of your floor and hostel utilities.</p>
                </div>
                <div className="flex items-center gap-3 card-3d px-4 py-2.5 w-fit">
                    <div className="w-8 h-8 icon-3d text-primary">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-wider leading-none">Your Location</p>
                        <p className="text-main font-semibold text-xs mt-1">Block {profile?.block || 'NA'} • Floor {profile?.floor || 'NA'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: WiFi & Common Utilities */}
                <div className="lg:col-span-1 space-y-6">
                    {/* WiFi Networks */}
                    <div className="space-y-6">
                        {wifi.map(w => (
                            <div key={w._id} className="card-3d p-8 group overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] group-hover:bg-primary/20 transition-all"></div>
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="w-12 h-12 icon-3d text-primary">
                                        <Wifi className="w-6 h-6" />
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${w?.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] ${w?.status === 'Active' ? 'bg-success shadow-success' : 'bg-danger shadow-danger'}`}></div>
                                        {w.status || w.service_status || 'Offline'}
                                    </span>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-main tracking-tight">{w.ssid || w.network_name || 'Unknown'}</h3>
                                        <p className="text-muted text-[10px] font-bold uppercase tracking-wider mt-1">Block {w.block} • Floor {w.floor}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-app/50 rounded-2xl border border-border group/row hover:border-primary/30 transition-all shadow-inner">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="w-4 h-4 text-primary" />
                                                <span className="text-muted text-[10px] font-bold uppercase tracking-wider">Password</span>
                                            </div>
                                            <span className="text-main font-semibold text-sm tracking-wider select-all text-glow">{w.password || w.network_password || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-app/50 rounded-2xl border border-border shadow-inner">
                                            <div className="flex items-center gap-3">
                                                <Signal className="w-4 h-4 text-primary" />
                                                <span className="text-muted text-[10px] font-bold uppercase tracking-wider">Speed</span>
                                            </div>
                                            <span className="text-main font-semibold text-sm">{w.speed || w.est_speed || '—'}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 italic">
                                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <p className="text-primary/80 text-[10px] leading-relaxed font-semibold">Only residents of Block {w.block} Floor {w.floor} are authorized.</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {wifi.length === 0 && (
                            <div className="card-3d p-10 text-center opacity-80">
                                <Wifi className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
                                <p className="text-muted font-semibold text-sm">No WiFi Configured in Hostel.</p>
                            </div>
                        )}
                    </div>

                    {/* Announcement Feed */}
                    <div className="card-3d p-8 space-y-6 flex flex-col h-[400px]">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 icon-3d-warning text-warning">
                                <Bell className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-main text-glow">Live Pulse</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                            {notices.map(notice => (
                                <div key={notice._id} className={`p-5 rounded-2xl border transition-all hover:bg-app/50 ${notice.priority === 'urgent' ? 'bg-danger/5 border-danger/20' : 'bg-app/30 border-border'
                                    }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-semibold text-sm tracking-tight ${notice.priority === 'urgent' ? 'text-danger' : 'text-main'}`}>
                                            {notice.title}
                                        </h4>
                                        <Clock className="w-3.5 h-3.5 text-muted" />
                                    </div>
                                    <p className="text-muted text-[11px] font-medium leading-relaxed mb-3">{notice.content}</p>
                                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted/70 border-t border-border/50 pt-3">
                                        <span>Official Update</span>
                                        <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {notices.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                    <Bell className="w-12 h-12 mb-4 text-muted" />
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted">No active notices</p>
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
                                <div className="w-10 h-10 icon-3d-warning text-warning">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-semibold text-main text-glow">Washing Ecosystem</h2>
                            </div>
                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Refresh Real-time</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {washing.map(machine => (
                                <div key={machine._id} className="card-3d p-6 group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 icon-3d-warning text-warning">
                                                <Zap className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-main font-bold text-lg tracking-tight">Machine {machine.machine_number}</h3>
                                                <p className="text-muted text-[10px] font-bold uppercase tracking-wider">{machine.location || `Floor ${machine.floor}`}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${machine.status === 'Available' ? 'bg-success/10 text-success border-success/20' :
                                            machine.status === 'Occupied' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                'bg-danger/10 text-danger border-danger/20'
                                            }`}>
                                            {machine.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="p-3 bg-app/50 rounded-xl text-center border border-border">
                                            <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Position</p>
                                            <p className="text-xs text-main font-semibold">Block {machine.block}</p>
                                        </div>
                                        <div className="p-3 bg-app/50 rounded-xl text-center border border-border">
                                            <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Operating</p>
                                            <p className="text-xs text-main font-semibold truncate">{machine.timings}</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-3 bg-app hover:bg-warning hover:text-white text-main rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-border shadow-sm group/btn">
                                        Reserve Machine <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity ml-1">→</span>
                                    </button>
                                </div>
                            ))}
                            {washing.length === 0 && (
                                <div className="col-span-2 py-12 bg-app/30 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-muted">
                                    <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                                    <p className="text-sm font-semibold opacity-80">No machines listed for this area.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Drinking Water Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 icon-3d text-primary">
                                <Droplets className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-semibold text-main text-glow">Hydration Stations</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {water.map(station => (
                                <div key={station._id} className="card-3d p-6 group flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 icon-3d text-primary">
                                            <Droplets className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-main font-bold text-lg tracking-tight">{station.machine_id}</h3>
                                            <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Block {station.block} • Floor {station.floor}</p>
                                            <p className="text-cyan-500/80 text-[10px] h-4 mt-1 font-semibold">{station.type} System</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase mb-1.5 tracking-wider inline-block ${station.status === 'Available' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                                            }`}>
                                            {station.status}
                                        </div>
                                        <p className="text-[8px] text-muted font-bold uppercase tracking-wider">Clean: {station.last_maintenance}</p>
                                    </div>
                                </div>
                            ))}
                            {water.length === 0 && (
                                <div className="col-span-2 py-12 bg-app/30 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-muted">
                                    <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                                    <p className="text-sm font-semibold opacity-80">No hydration stations located.</p>
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
