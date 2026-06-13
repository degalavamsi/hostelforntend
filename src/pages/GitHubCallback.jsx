import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Loader2, ShieldAlert } from "lucide-react";

export default function GitHubCallback() {
    const [searchParams] = useSearchParams();
    const { loginWithGitHub } = useAuth();
    const navigate = useNavigate();
    const triggered = useRef(false);

    useEffect(() => {
        if (triggered.current) return;
        triggered.current = true;

        const code = searchParams.get("code");
        if (!code) {
            navigate("/login", { state: { error: "No authorization code received from GitHub." } });
            return;
        }

        const handleGitHubLogin = async () => {
            try {
                const result = await loginWithGitHub(code);
                if (result.success) {
                    navigate("/");
                } else {
                    navigate("/login", { state: { error: result.message || "GitHub authentication failed." } });
                }
            } catch (err) {
                navigate("/login", { state: { error: "An unexpected error occurred during GitHub login." } });
            }
        };

        handleGitHubLogin();
    }, [searchParams, loginWithGitHub, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white font-sans p-6 relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[150px] rounded-full animate-pulse-slow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full animate-float" />

            <div className="relative z-10 flex flex-col items-center space-y-6 bg-white/5 border border-white/10 backdrop-blur-3xl p-10 rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] max-w-sm w-full text-center">
                <div className="p-4 bg-primary-600/10 rounded-2xl">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight text-white">GitHub Auth</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        Securing your session...
                    </p>
                </div>
            </div>
        </div>
    );
}
