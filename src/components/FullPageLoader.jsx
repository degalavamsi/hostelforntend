import React from 'react';
import { Loader2 } from 'lucide-react';

const FullPageLoader = () => {
    return (
        <div className="fixed inset-0 min-h-screen bg-app flex flex-col items-center justify-center z-[9999]">
            {/* Ambient gradient blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-[100px] animate-float" />

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Spinner */}
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-[3px] border-border" />
                    <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
                    <div className="absolute inset-2 rounded-full border-[2px] border-transparent border-b-accent animate-[spin_1.5s_linear_infinite_reverse]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                    </div>
                </div>

                {/* Brand */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-main tracking-tight">
                        Hostel<span className="text-primary">Pro</span>
                    </h2>
                    <p className="text-sm text-muted font-medium">Loading your workspace...</p>
                </div>
            </div>
        </div>
    );
};

export default FullPageLoader;
