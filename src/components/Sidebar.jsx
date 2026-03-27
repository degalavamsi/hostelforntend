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
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3">
                <div className="p-2 bg-primary-600 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Hostel Pro
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 py-4">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-primary-600/10 text-primary-400 border border-primary-600/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200 uppercase text-xs font-bold tracking-widest"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
