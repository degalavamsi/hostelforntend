import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-slate-950 selection:bg-primary-500/30">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-900/10 via-slate-950 to-slate-950">
                <Navbar />
                <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
