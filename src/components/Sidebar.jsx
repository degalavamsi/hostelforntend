import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, DoorOpen, CreditCard, Bell, Utensils, ShieldCheck, LogOut, User as UserIcon, Zap, Settings2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'student'] },
        { name: 'Students', path: '/students', icon: Users, roles: ['admin', 'manager'] },
        { name: 'Rooms', path: '/rooms', icon: DoorOpen, roles: ['admin', 'manager', 'student'] },
        { name: 'Payments', path: '/payments', icon: CreditCard, roles: ['admin', 'manager', 'student'] },
        { name: 'Notices', path: '/notices', icon: Bell, roles: ['admin', 'manager', 'student'] },
        { name: 'Food Menu', path: '/menu', icon: Utensils, roles: ['admin', 'manager', 'student'] },
        { name: 'Facilities', path: '/facilities', icon: Zap, roles: ['admin', 'manager', 'student'] },
        { name: 'Utilities', path: '/utilities', icon: Settings2, roles: ['admin', 'manager'] },
        { name: 'Visitor Log', path: '/visitors', icon: UserCheck, roles: ['admin', 'manager', 'student'] },
        { name: 'Profile', path: '/profile', icon: UserIcon, roles: ['admin', 'manager', 'student'] },
    ];

    const filteredItems = menuItems.filter(item =>
        item.roles.some(role => user?.roles?.includes(role))
    );

    return (
        <aside className="w-72 bg-slate-950 border-r border-white/5 flex flex-col h-screen sticky top-0 z-40 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-700" />
            
            <div className="p-8 flex items-center gap-4">
                <div className="p-2.5 bg-primary-600 rounded-2xl shadow-lg shadow-primary-900/20">
                    <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                   <h1 className="text-2xl font-black text-white tracking-tighter leading-none">
                      Hostel<span className="text-primary-500">Pro</span>
                   </h1>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Version 2.0</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 py-8 overflow-y-auto custom-scrollbar">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                ? 'bg-primary-600/10 text-primary-400 border border-primary-500/10 shadow-[inner_0_0_20px_rgba(99,102,241,0.05)]'
                                : 'text-slate-500 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                            }`
                        }
                    >
                        <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 tracking-widest`} />
                        <span className="font-bold tracking-tight">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 border-t border-white/5 bg-slate-900/20">
                <button
                    onClick={logout}
                    className="flex items-center gap-4 w-full px-5 py-4 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all duration-300 group border border-transparent hover:border-rose-500/20"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black uppercase text-[11px] tracking-[0.2em]">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
