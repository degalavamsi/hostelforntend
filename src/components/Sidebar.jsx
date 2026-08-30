import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, DoorOpen, CreditCard, Bell, Utensils, ShieldCheck, LogOut, User as UserIcon, Zap, Settings2, UserCheck, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
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
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-main/20 backdrop-blur-sm z-[100] lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-[280px] bg-surface border-r border-border
                flex flex-col z-[101] overflow-hidden
                transition-transform duration-300 ease-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                
                {/* Brand Header */}
                <div className="h-20 px-6 flex items-center justify-between border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                           <h1 className="text-xl font-bold text-main tracking-tight leading-none">
                               Hostel<span className="text-primary">Pro</span>
                           </h1>
                           <p className="text-[10px] font-medium text-muted mt-0.5">Management System</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-main hover:bg-app lg:hidden transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
                    {filteredItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-primary/8 text-primary font-semibold'
                                    : 'text-muted hover:bg-app hover:text-main'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />}
                                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                                    <span className="text-[13px] tracking-tight">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-border shrink-0">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-muted hover:text-danger hover:bg-danger/5 rounded-xl transition-all duration-200 group"
                    >
                        <LogOut className="w-[18px] h-[18px] group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-[13px] font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
