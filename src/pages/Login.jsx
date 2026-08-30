import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Loader2, AlertTriangle, Eye, EyeOff, Mail, Lock, ShieldCheck, Zap, Globe, Sparkles, Github, CheckCircle2, ArrowRight } from "lucide-react";
import loginBg from "../assets/login-bg.png";

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.error) {
            setError(location.state.error);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleGitHubLogin = () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || "e1d1fd21f347af9b9c5bdf87dd91750312bf26c9";
        const redirectUri = `${window.location.origin}/github-callback`;
        const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
        window.location.href = githubUrl;
    };

    useEffect(() => {
        const id = "google-jssdk";
        if (document.getElementById(id)) {
            if (window.google) renderGoogleButton();
            return;
        }
        const script = document.createElement("script");
        script.id = id;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        script.onload = () => renderGoogleButton();
    }, []);

    const renderGoogleButton = () => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: "934861811446-gh1jmhn021ttc08ti3cjeavaloeghcal.apps.googleusercontent.com",
                callback: handleGoogleCredentialResponse,
            });
            window.google.accounts.id.renderButton(
                document.getElementById("googleSignInButton"),
                { theme: "outline", size: "large", width: 400, shape: "pill" }
            );
        }
    };

    const handleGoogleCredentialResponse = async (response) => {
        setLoading(true);
        setError("");
        try {
            const result = await loginWithGoogle(response.credential);
            if (result.success) navigate("/");
            else setError(result.message);
        } catch (err) {
            setError("Google login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const result = await login(identifier, password);
            if (result.success) navigate("/");
            else setError(result.message);
        } catch (err) {
            setError("Connection failed. Please check your network.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-main font-sans">
            
            {/* ───── LEFT: Branding Panel ───── */}
            <div className="hidden lg:flex w-[45%] relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 40%, #6366f1 100%)'}}>
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-xl" />
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full" />

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Top: Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            HostelPro
                        </h1>
                    </div>

                    {/* Center: Headline */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                                Smart Hostel<br/>
                                Management<br/>
                                <span className="text-white/80">Made Simple.</span>
                            </h2>
                            <p className="text-lg text-white/70 mt-6 max-w-md leading-relaxed">
                                Streamline admissions, payments, and facility management — all in one powerful platform.
                            </p>
                        </div>

                        {/* Feature pills */}
                        <div className="flex flex-wrap gap-3">
                            {[
                                { icon: Zap, text: 'Real-time Analytics' },
                                { icon: Globe, text: 'Cloud-based' },
                                { icon: ShieldCheck, text: 'Secure & Reliable' },
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
                                    <f.icon className="w-4 h-4" />
                                    {f.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom: Social proof */}
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2.5">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-9 h-9 rounded-full border-2 border-white/30 overflow-hidden bg-white/20">
                                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <p className="text-white/70 text-sm font-medium">
                            Trusted by <span className="text-white font-bold">1,000+</span> students
                        </p>
                    </div>
                </div>
            </div>

            {/* ───── RIGHT: Login Form ───── */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-surface">
                <div className="max-w-[420px] w-full space-y-8">
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-main">HostelPro</h1>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-main tracking-tight">Welcome back</h2>
                        <p className="text-muted text-sm mt-2">Enter your credentials to access your account</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-danger/5 border border-danger/15 text-danger rounded-xl text-sm animate-shake">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-main">Email, Username, or Phone</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your email, username, or phone"
                                    className="input-premium !pl-11"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-main">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Enter your password"
                                    className="input-premium !pl-11 !pr-11"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <div className={`w-4.5 h-4.5 border rounded-md flex items-center justify-center transition-all ${rememberMe ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}>
                                    <input type="checkbox" className="sr-only" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                                    {rememberMe && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-sm text-muted">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary w-full !py-3 !text-sm"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Sign In
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <span className="relative px-4 bg-white dark:bg-surface text-xs text-muted font-medium">or continue with</span>
                    </div>

                    {/* Social Login */}
                    <div className="flex flex-col gap-3">
                        <div id="googleSignInButton" className="w-full flex justify-center"></div>
                        
                        <button
                            type="button"
                            onClick={handleGitHubLogin}
                            className="w-full py-3 px-4 bg-app border border-border hover:border-muted/30 rounded-xl font-medium text-main flex items-center justify-center gap-3 transition-all text-sm hover:shadow-sm"
                        >
                            <Github className="w-5 h-5" />
                            Continue with GitHub
                        </button>
                    </div>

                    <p className="text-center text-muted text-sm">
                        Don't have an account?{" "}
                        <Link to="/register-request" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                            Request Access
                        </Link>
                    </p>
                </div>
            </div>
            
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.4s ease-in-out; }
                input::-ms-reveal, input::-ms-clear { display: none; }
            `}</style>
        </div>
    );
}
