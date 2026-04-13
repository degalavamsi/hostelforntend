import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Loader2, AlertTriangle, Building2, Eye, EyeOff, Mail, Lock, ShieldCheck, Zap, Globe, Sparkles } from "lucide-react";
import Button from "../components/ui/Button";
import loginBg from "../assets/login-bg.png";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <div className={`p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl animate-in fade-in slide-in-from-right-10 duration-1000 fill-mode-both`} style={{ animationDelay: `${delay}ms` }}>
        <div className="w-10 h-10 bg-primary-600/20 text-primary-400 rounded-2xl flex items-center justify-center mb-4">
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-white font-black text-sm mb-1">{title}</h3>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight leading-relaxed">{description}</p>
    </div>
);

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
        try {
            const result = await login(email, password);
            if (result.success) {
                navigate("/");
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Connection failed. Please check your network.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 selection:bg-primary-500/30 font-sans p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[150px] rounded-full animate-pulse-slow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full animate-float" />

            <div className="flex w-full max-w-[1200px] min-h-[750px] rounded-3xl md:rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-3xl bg-white/5 relative z-10">

                {/* LEFT SECTION: BRANDING & FEATURES */}
                <div className="hidden lg:flex w-[45%] relative bg-slate-950 items-center justify-center p-12 overflow-hidden border-r border-white/5">
                    <div className="absolute inset-0 z-0">
                        <img
                            src={loginBg}
                            className="w-full h-full object-cover opacity-40 brightness-75 transition-transform duration-[20000ms] scale-110 hover:scale-100"
                            alt="Premium Background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/60 to-transparent"></div>
                    </div>

                    <div className="relative z-10 w-full space-y-12">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-600 rounded-[20px] shadow-2xl shadow-primary-900/40">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter">
                                Hostel<span className="text-primary-500">Pro</span>
                            </h1>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
                                Precision Living<br />
                                <span className="text-primary-400">Redefined.</span>
                            </h2>
                            <p className="text-lg text-slate-400 font-medium max-w-sm leading-relaxed">
                                Experience the next generation of smart student housing management.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-4">
                            <FeatureCard 
                                icon={Zap} 
                                title="Instant Pulse" 
                                description="Real-time occupancy and financial analytics at your fingertips."
                                delay={200}
                            />
                            <FeatureCard 
                                icon={Globe} 
                                title="Smart Ecosystem" 
                                description="Centralized control for laundry, utility, and security nodes."
                                delay={400}
                            />
                        </div>

                        <div className="pt-8 flex items-center gap-2">
                             <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden`}>
                                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                                    </div>
                                ))}
                             </div>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Empowering 1,000+ Students</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION: LOGIN FORM */}
                <div className="w-full lg:w-[55%] bg-slate-950 p-6 md:p-20 flex flex-col justify-center relative">
                    <div className="max-w-md mx-auto w-full space-y-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full">
                                <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                                <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Secure Access</span>
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tighter">Welcome Back</h2>
                            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">Identify yourself to continue</p>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 py-4 px-6 rounded-3xl text-sm font-bold flex items-center gap-4 animate-shake">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-primary-500 transition-colors">Identification</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email or Username"
                                        className="w-full bg-white/5 border border-white/10 p-5 pl-14 rounded-3xl text-white placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-primary-500 transition-colors">Credential</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Enter Password"
                                        className="w-full bg-white/5 border border-white/10 p-5 pl-14 pr-14 rounded-3xl text-white placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative w-5 h-5 border-2 border-white/10 rounded-lg group-hover:border-primary-500/50 transition-colors overflow-hidden">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={rememberMe}
                                            onChange={() => setRememberMe(!rememberMe)}
                                        />
                                        <div className={`absolute inset-0 bg-primary-500 transition-transform ${rememberMe ? 'scale-100' : 'scale-0'}`} />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Remember Me</span>
                                </label>

                                <a href="#" className="text-[11px] font-black text-primary-500 uppercase tracking-widest hover:text-primary-400 transition-colors underline underline-offset-4 decoration-primary-500/30">
                                    Reset Access
                                </a>
                            </div>

                            <Button 
                                type="submit" 
                                loading={loading} 
                                className="w-full py-5 rounded-[28px] text-lg tracking-tight"
                            >
                                Authenticate Session
                            </Button>
                        </form>

                        <div className="pt-6 border-t border-white/5 space-y-6">
                            <p className="text-center text-slate-500 text-[11px] font-black uppercase tracking-widest">
                                Global Student Network?{" "}
                                <Link to="/register-request" className="text-primary-500 hover:text-primary-400 transition-colors">
                                    Apply For Membership
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-20 lg:mt-auto text-center opacity-30">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">
                            End-to-End Encrypted. Data Sovereign.
                        </p>
                    </div>
                </div>
            </div>
            
            <style>
                {`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    .animate-shake {
                        animation: shake 0.4s ease-in-out;
                    }
                    input::-ms-reveal, input::-ms-clear { display: none; }
                `}
            </style>
        </div>
    );
}
