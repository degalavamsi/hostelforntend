import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, User, Mail, Lock, Phone, AlertCircle, Loader2 } from 'lucide-react';

const RegisterRequest = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
    });
    const [files, setFiles] = useState({ photo: null, id_proof: null });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const validatePassword = (pass) => {
        if (pass.length < 8) return "Password must be at least 8 characters long.";
        if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
        if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
        if (!/[0-9]/.test(pass)) return "Password must contain at least one digit.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one special character.";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (files.photo) data.append('photo', files.photo);
        if (files.id_proof) data.append('id_proof', files.id_proof);

        try {
            await api.post('/auth/register-request', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed. Please check your details.');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] max-w-md w-full text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-3xl flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Request Sent!</h2>
                    <p className="text-slate-400 leading-relaxed">
                        Your registration request has been submitted. Please wait for the warden to approve your account.
                    </p>
                    <Link to="/login" className="block w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[40px] max-w-xl w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-[60px]"></div>

                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Join <span className="text-primary-500">Hostel Pro</span></h1>
                    <p className="text-slate-400 font-medium">Fill in your details for registration approval.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 ml-1">Full Name</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors"
                                placeholder="John Doe"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 ml-1">Phone Number</label>
                            <input
                                type="text" required
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors"
                                placeholder="+91 00000 00000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                            <input
                                type="email" required
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600 outline-none transition-all text-sm font-medium"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                            <input
                                type="password" required
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600 outline-none transition-all text-sm font-medium"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 ml-1">Profile Photo</label>
                            <input
                                type="file" required accept="image/*"
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-3 text-white text-xs outline-none focus:border-primary-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-600/20 file:text-primary-400 hover:file:bg-primary-600/30"
                                onChange={(e) => setFiles({ ...files, photo: e.target.files[0] })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 ml-1">ID Proof</label>
                            <input
                                type="file" required accept=".pdf,image/*"
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-3 text-white text-xs outline-none focus:border-primary-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-600/20 file:text-primary-400 hover:file:bg-primary-600/30"
                                onChange={(e) => setFiles({ ...files, id_proof: e.target.files[0] })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
                    </button>
                </form>

                <p className="text-center text-slate-400 mt-8 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterRequest;
