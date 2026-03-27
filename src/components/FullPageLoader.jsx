import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const FullPageLoader = () => {
    return (
        <div className="fixed inset-0 min-h-screen bg-slate-950 flex flex-col items-center justify-center z-[9999]">
            <div className="absolute inset-0 bg-primary-900/10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Outer glowing pulse rings */}
                <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full scale-150 animate-[ping_3s_ease-in-out_infinite]"></div>
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full scale-110 animate-[pulse_2s_ease-in-out_infinite]"></div>

                {/* Logo Image */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary-500/30 p-4 shadow-[0_0_40px_-10px_rgba(14,165,233,0.5)] bg-slate-900/80 backdrop-blur-md overflow-hidden flex items-center justify-center animate-[bounce_2s_ease-in-out_infinite]">
                    <img
                        src="/assets/codegnan-logo.png"
                        alt="Loading"
                        className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://codegnan.com/wp-content/uploads/2023/11/codegnan-logo-new.webp";
                        }}
                    />
                </div>

                {/* Rotating indicator ring */}
                <div className="absolute w-40 h-40 md:w-48 md:h-48 border-t-4 border-r-4 border-primary-500 rounded-full animate-spin shadow-xl"></div>
                <div className="absolute w-44 h-44 md:w-52 md:h-52 border-b-4 border-l-4 border-cyan-400 rounded-full animate-[spin_3s_linear_infinite_reverse] opacity-60"></div>
            </div>
        </div>
    );
};

export default FullPageLoader;
