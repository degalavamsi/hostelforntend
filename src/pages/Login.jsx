import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Loader2, AlertTriangle, Building2, Eye, EyeOff, Mail, Lock, Utensils, Bed, Wifi, ShieldCheck, Thermometer, WashingMachine, Droplets } from "lucide-react";
import magicalBg from "../assets/magical-bg.png";

const AmenityRotator = () => {
    const amenities = [
        { icon: Utensils, label: "Premium Dining", color: "text-orange-400" },
        { icon: Bed, label: "Luxury Stay", color: "text-sky-400" },
        { icon: Wifi, label: "High-speed WiFi", color: "text-indigo-400" },
        { icon: ShieldCheck, label: "24/7 Security", color: "text-emerald-400" },
        { icon: Thermometer, label: "Hot Water", color: "text-rose-400" },
        { icon: WashingMachine, label: "Laundry Care", color: "text-blue-400" },
        { icon: Droplets, label: "Pure Water", color: "text-cyan-400" }
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % amenities.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const ActiveIcon = amenities[index].icon;

    return (
        <div className="flex flex-col items-center justify-center h-32 relative">
            <div key={index} className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
                <div className={`p-6 rounded-full bg-white/5 border border-white/10 mb-4 shadow-2xl`}>
                    <ActiveIcon className={`w-12 h-12 ${amenities[index].color} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`} />
                </div>
                <p className="text-sm font-black tracking-[0.2em] uppercase text-white/40">
                    {amenities[index].label}
                </p>
            </div>
        </div>
    );
};

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const result = await login(email, password);
        if (result.success) {
            navigate("/");
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans p-4">
            {/* Global CSS to fix double eye icon */}
            <style>
                {`
          input::-ms-reveal,
          input::-ms-clear {
            display: none;
          }
          input::-webkit-contacts-auto-fill-button, 
          input::-webkit-credentials-auto-fill-button {
            visibility: hidden;
            display: none !important;
            pointer-events: none;
            position: absolute;
            right: 0;
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}
            </style>

            <div className="flex w-full max-w-[1100px] h-[650px] rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border border-white/10 backdrop-blur-3xl bg-white/5 relative z-10 shrink-0">

                {/* LEFT LOGIN SECTION */}
                <div className="w-full lg:w-1/2 bg-slate-900/40 backdrop-blur-2xl p-10 md:p-14 flex flex-col justify-center relative z-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-sky-500 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">
                            Hostel<span className="text-sky-400">Pro</span>
                        </h1>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400 font-medium tracking-tight">Access your smart living dashboard.</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="Email or Username"
                                className="w-full p-4 pl-12 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Password"
                                className="w-full p-4 pl-12 pr-12 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors z-30"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold px-1">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-300 transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded-md border-white/10 bg-white/5 accent-sky-500 cursor-pointer"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                />
                                Remember me
                            </label>

                            <a href="#" className="text-sky-400 hover:text-sky-300 transition-colors">
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white p-4 rounded-2xl font-black shadow-lg shadow-sky-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-xs font-bold">
                            New to the hostel?{" "}
                            <Link to="/register-request" className="text-sky-400 hover:text-sky-300 transition-colors">
                                Join Today
                            </Link>
                        </p>
                    </div>

                    <div className="mt-auto pt-8 border-t border-white/5 text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                            © 2024 HostelPro. System Secure.
                        </p>
                    </div>
                </div>

                {/* RIGHT ANIMATION SECTION */}
                <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
                    {/* Background Image with Fixed Fidelity */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={magicalBg}
                            className="w-full h-full object-cover opacity-60 brightness-75 contrast-125 scale-110"
                            alt="Branding Background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-slate-900/40 to-slate-950/80"></div>
                    </div>

                    <div className="absolute w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px] animate-pulse"></div>

                    <div className="text-center z-10 p-12 space-y-10 animate-in fade-in slide-in-from-right-10 duration-1000 w-full">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
                                Smart Hostel<br />Management
                            </h2>
                            <p className="text-lg font-medium text-sky-200/40 tracking-[0.1em] uppercase">
                                Revolutionizing Student Living
                            </p>
                        </div>

                        <div className="relative py-4">
                            <AmenityRotator />
                        </div>

                        <div className="pt-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                                <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Ecosystem Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
