import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertTriangle, ArrowLeft, Mail, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import api from "../services/api";

export default function ForgotPassword() {
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password, 3: Success
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await api.post("/auth/forgot-password", { identifier });
            if (response.status === 200) {
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to request OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await api.post("/auth/reset-password", {
                identifier,
                otp,
                new_password: newPassword
            });
            if (response.status === 200) {
                setStep(3);
                setTimeout(() => navigate("/login"), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to reset password. Please check your OTP and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-main font-sans">
            <div className="max-w-[420px] w-full space-y-8">
                {/* Branding */}
                <div className="flex flex-col items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-main">HostelPro</h1>
                </div>

                <div className="bg-white dark:bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                    {step === 1 && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-main mb-1">Reset Password</h2>
                                <p className="text-muted text-sm">Enter your registered email, username, or phone to receive an OTP.</p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 p-4 mb-6 bg-danger/5 border border-danger/15 text-danger rounded-xl text-sm">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleRequestOtp} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-main">Email, Username, or Phone</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter your identifier"
                                            className="input-premium !pl-11"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-main mb-1">Verify OTP</h2>
                                <p className="text-muted text-sm">We've sent an OTP to your registered email address.</p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 p-4 mb-6 bg-danger/5 border border-danger/15 text-danger rounded-xl text-sm">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-main">6-Digit OTP</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        placeholder="123456"
                                        className="input-premium text-center tracking-widest text-lg font-semibold"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-main">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="Enter strong password"
                                            className="input-premium !pl-11"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-muted mt-1">Must be at least 8 chars, with uppercase, lowercase, number, and special char.</p>
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-success" />
                            </div>
                            <h2 className="text-xl font-bold text-main mb-2">Password Reset Successful!</h2>
                            <p className="text-muted text-sm mb-6">Your password has been securely updated.</p>
                            <p className="text-xs text-muted">Redirecting to login...</p>
                        </div>
                    )}
                </div>

                <div className="text-center mt-6">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-main transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
