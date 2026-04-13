import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, User, Mail, Lock, Phone, AlertCircle, Loader2, Sparkles, CheckCircle2, ArrowRight, Camera, FileText } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-slate-950 to-slate-950" />
                
                <div className="glass-morphism p-12 rounded-[48px] max-w-lg w-full text-center space-y-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative z-10 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-primary-600/20 text-primary-400 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary-900/20">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white tracking-tighter">Request Vaulted</h2>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            Your application is now being reviewed by the Warden. You will be notified via email once approved.
                        </p>
                    </div>
                    <Link to="/login" className="block">
                        <Button variant="primary" className="w-full py-5 rounded-3xl">
                            Return To Hub
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-2 md:p-4 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-900/10 via-slate-950 to-slate-950 relative overflow-hidden">
             {/* Decorative Elements */}
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse-slow" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary-600/5 blur-[100px] rounded-full animate-float" />

            <div className="glass-morphism p-6 md:p-16 rounded-3xl md:rounded-[48px] max-w-3xl w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative z-10">
                <div className="mb-6 md:mb-12 space-y-2 md:space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full scale-90 md:scale-100 origin-left">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary-400" />
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Secure Registration</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Initialize <span className="text-primary-500">Access</span></h1>
                    <p className="text-slate-500 font-bold uppercase text-[8px] md:text-[11px] tracking-[0.15em]">Enter the Hostel Pro Ecosystem</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input 
                            label="Full Identity" 
                            icon={User} 
                            placeholder="Johnathan Doe"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                        <Input 
                            label="Contact Node" 
                            icon={Phone} 
                            placeholder="+91 00000 00000"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>

                    <Input 
                        label="Electronic Mail" 
                        icon={Mail} 
                        type="email"
                        placeholder="identity@university.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <Input 
                        label="Private Credential" 
                        icon={Lock} 
                        type="password"
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Profile Visual</label>
                            <label className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all border-dashed">
                                <div className="w-12 h-12 bg-primary-600/10 rounded-xl flex items-center justify-center text-primary-400">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{files.photo ? files.photo.name : 'Choose Image'}</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">JPG, PNG (Max 5MB)</p>
                                </div>
                                <input
                                    type="file" required accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setFiles({ ...files, photo: e.target.files[0] })}
                                />
                            </label>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Validation</label>
                            <label className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all border-dashed">
                                <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{files.id_proof ? files.id_proof.name : 'Upload Document'}</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">PDF, JPG (Max 10MB)</p>
                                </div>
                                <input
                                    type="file" required accept=".pdf,image/*"
                                    className="hidden"
                                    onChange={(e) => setFiles({ ...files, id_proof: e.target.files[0] })}
                                />
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-3xl text-sm font-bold animate-in slide-in-from-bottom-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        loading={loading} 
                        className="w-full py-6 rounded-[32px] text-lg hover:shadow-primary-500/10"
                        icon={ArrowRight}
                    >
                        Submit Membership Request
                    </Button>
                </form>

                <p className="text-center text-slate-500 mt-10 font-bold uppercase text-[11px] tracking-[0.2em]">
                    Already member of the collective?{' '}
                    <Link to="/login" className="text-primary-500 hover:text-primary-400 border-b border-primary-500/20 hover:border-primary-400 transition-all pb-0.5">
                        Pulse Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterRequest;
