import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-app overflow-x-hidden">
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
            
            <div className="flex-1 flex flex-col min-w-0 bg-mesh">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto w-full page-enter">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
