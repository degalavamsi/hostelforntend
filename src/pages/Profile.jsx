import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import {
    User, Mail, Phone, Lock, Shield, ShieldCheck,
    Loader2, Save, Upload, FileText, Eye, Camera, X, CheckCircle2
} from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const isStudent = user?.roles?.includes('student');

    const [profile, setProfile] = useState(null);
    const [profileData, setProfileData] = useState({ username: '', phone: '', block: '', floor: '' });
    const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [files, setFiles] = useState({ photo: null, id_proof: null });
    const [loaderFile, setLoaderFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [docLoading, setDocLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const showMsg = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile');
                setProfile(res.data);
                setProfileData({
                    username: res.data.username || '',
                    phone: res.data.phone || '',
                    block: res.data.block || '',
                    floor: res.data.floor || ''
                });
            } catch (err) {
                console.error('Failed to fetch profile', err);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/auth/profile', profileData);
            showMsg('Profile updated successfully!');
        } catch (err) {
            showMsg('Failed to update profile', 'error');
        }
        setLoading(false);
    };

    const handleUploadDocuments = async (e) => {
        e.preventDefault();
        if (!files.photo && !files.id_proof) return showMsg('Please select a file to upload', 'error');
        setDocLoading(true);
        try {
            const data = new FormData();
            if (files.photo) data.append('photo', files.photo);
            if (files.id_proof) data.append('id_proof', files.id_proof);
            await api.post('/auth/upload-documents', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showMsg('Documents uploaded successfully!');
            // Refresh profile
            const res = await api.get('/auth/profile');
            setProfile(res.data);
            setFiles({ photo: null, id_proof: null });
        } catch (err) {
            showMsg('Failed to upload documents', 'error');
        }
        setDocLoading(false);
    };

    const handleUploadLoader = async (e) => {
        e.preventDefault();
        if (!loaderFile) return showMsg('Please select an image', 'error');
        setLoading(true);
        try {
            const data = new FormData();
            data.append('loader_image', loaderFile);
            await api.post('/auth/upload-loader', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showMsg('Loader Image updated successfully!');
            setLoaderFile(null);
        } catch (err) {
            showMsg('Failed to update loader image', 'error');
        }
        setLoading(false);
    };

    const validatePassword = (pass) => {
        if (pass.length < 8) return "Password must be at least 8 characters long.";
        if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
        if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
        if (!/[0-9]/.test(pass)) return "Password must contain at least one digit.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one special character.";
        return "";
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            return showMsg('Passwords do not match', 'error');
        }

        const passwordError = validatePassword(passwordData.new_password);
        if (passwordError) {
            return showMsg(passwordError, 'error');
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password', passwordData);
            showMsg('Password changed successfully!');
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            showMsg(err.response?.data?.msg || 'Failed to change password', 'error');
        }
        setLoading(false);
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return (
        <div className="w-full space-y-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Resident <span className="text-primary-500">Profile</span></h1>
                    <p className="text-slate-400 mt-1">Manage your profile, documents and security.</p>
                </div>
            </div>

            {msg.text && (
                <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold ${msg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                    {msg.type === 'error' ? <X className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {msg.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Avatar & Basic Info */}
                <div className="space-y-6">
                    {/* Avatar */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 flex flex-col items-center gap-4 shadow-2xl">
                        <div className="w-28 h-28 rounded-[24px] overflow-hidden bg-slate-800 border-2 border-slate-700 relative group">
                            {profile?.photo_path ? (
                                <img
                                    src={`${API_URL}/uploads/documents/${profile.photo_path}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-600">
                                    {profile?.username?.[0]?.toUpperCase() || <User className="w-10 h-10" />}
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black text-white">{profile?.username}</h3>
                            <p className="text-slate-500 text-xs uppercase font-black tracking-widest mt-1">{profile?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
                                {user?.roles?.[0]}
                            </span>
                        </div>
                    </div>

                    {/* Hostel Details (student only) */}
                    {isStudent && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-7 shadow-2xl space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Stay Details</h3>
                            {[
                                { label: 'Room', value: profile?.room_number || 'Not assigned' },
                                { label: 'Bed', value: profile?.bed_number || 'Not assigned' },
                                { label: 'Rent', value: profile?.rent_amount ? `₹${profile.rent_amount}/month` : 'Not set' },
                                { label: 'Deposit', value: profile?.deposit ? `₹${profile.deposit}` : 'Not set' },
                                { label: 'Joined', value: profile?.join_date ? new Date(profile.join_date).toLocaleDateString() : 'Not set' },
                                { label: 'Deposit Status', value: profile?.deposit_refund_status?.replace('_', ' ') || 'not paid' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
                                    <span className="text-slate-500 text-xs font-black uppercase tracking-widest">{label}</span>
                                    <span className="text-white text-sm font-bold">{value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile update */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400"><User className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-lg font-black text-white">Personal Info</h2>
                                <p className="text-slate-500 text-xs">Update your name and phone number</p>
                            </div>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {isStudent && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Block</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors"
                                            value={profileData.block}
                                            onChange={(e) => setProfileData({ ...profileData, block: e.target.value })}
                                            placeholder="e.g. A"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Floor</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-primary-500 transition-colors"
                                            value={profileData.floor}
                                            onChange={(e) => setProfileData({ ...profileData, floor: e.target.value })}
                                            placeholder="e.g. 1"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email (read-only)</label>
                                <input
                                    type="email" disabled
                                    className="w-full bg-slate-800/50 border border-slate-800 rounded-2xl p-4 text-slate-500 outline-none cursor-not-allowed"
                                    value={profile?.email || ''}
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full md:w-auto px-8 bg-primary-600 hover:bg-primary-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-primary-900/20 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                            </button>
                        </form>
                    </div>

                    {/* Document Upload */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-500/10 rounded-xl text-green-400"><ShieldCheck className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-lg font-black text-white">My Documents</h2>
                                <p className="text-slate-500 text-xs">Upload or update your photo and ID proof</p>
                            </div>
                        </div>

                        {/* Existing docs */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className={`p-5 rounded-2xl border ${profile?.photo_path ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Camera className={`w-4 h-4 ${profile?.photo_path ? 'text-green-400' : 'text-slate-500'}`} />
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Photo</span>
                                </div>
                                {profile?.photo_path ? (
                                    <div className="space-y-2">
                                        <img
                                            src={`${API_URL}/uploads/documents/${profile.photo_path}`}
                                            alt="ID"
                                            className="w-full h-20 object-cover rounded-xl"
                                        />
                                        <a
                                            href={`${API_URL}/uploads/documents/${profile.photo_path}`}
                                            target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1 text-green-400 text-xs font-bold"
                                        >
                                            <Eye className="w-3 h-3" /> View
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-slate-600 text-xs">Not uploaded</p>
                                )}
                            </div>
                            <div className={`p-5 rounded-2xl border ${profile?.id_proof_path ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className={`w-4 h-4 ${profile?.id_proof_path ? 'text-green-400' : 'text-slate-500'}`} />
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ID Proof</span>
                                </div>
                                {profile?.id_proof_path ? (
                                    <div className="space-y-2">
                                        <div className="w-full h-20 bg-slate-800 rounded-xl flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-green-400" />
                                        </div>
                                        <a
                                            href={`${API_URL}/uploads/documents/${profile.id_proof_path}`}
                                            target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1 text-green-400 text-xs font-bold"
                                        >
                                            <Eye className="w-3 h-3" /> View
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-slate-600 text-xs">Not uploaded</p>
                                )}
                            </div>
                        </div>

                        {/* Upload form */}
                        <form onSubmit={handleUploadDocuments} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">New Photo</label>
                                    <input
                                        type="file" accept="image/*"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-slate-400 text-xs outline-none file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary-600/20 file:text-primary-400 hover:file:bg-primary-600/30 transition-all"
                                        onChange={(e) => setFiles({ ...files, photo: e.target.files[0] })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">New ID Proof</label>
                                    <input
                                        type="file" accept=".pdf,image/*"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-slate-400 text-xs outline-none file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary-600/20 file:text-primary-400 hover:file:bg-primary-600/30 transition-all"
                                        onChange={(e) => setFiles({ ...files, id_proof: e.target.files[0] })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit" disabled={docLoading}
                                className="w-full md:w-auto px-8 bg-green-600/20 hover:bg-green-600/30 text-green-400 font-black border border-green-500/20 py-4 rounded-2xl transition-all flex items-center gap-2"
                            >
                                {docLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /> Upload Documents</>}
                            </button>
                        </form>
                    </div>

                    {/* Admin Global Settings */}
                    {!isStudent && (
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-primary-500/20 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary-500/5 pulse"></div>
                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400"><Camera className="w-5 h-5" /></div>
                                    <div>
                                        <h2 className="text-lg font-black text-white">Global Loader Logo</h2>
                                        <p className="text-slate-500 text-xs">Upload a custom logo to act as the bouncing loader</p>
                                    </div>
                                </div>
                                <form onSubmit={handleUploadLoader} className="flex gap-4 items-end">
                                    <div className="space-y-2 flex-1">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Image File</label>
                                        <input
                                            type="file" accept="image/*"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-slate-400 text-xs outline-none file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary-600/20 file:text-primary-400 hover:file:bg-primary-600/30 transition-all"
                                            onChange={(e) => setLoaderFile(e.target.files[0])}
                                        />
                                    </div>
                                    <button
                                        type="submit" disabled={loading}
                                        className="px-6 bg-primary-600 hover:bg-primary-500 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-primary-900/20"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Change Password */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><Lock className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-lg font-black text-white">Change Password</h2>
                                <p className="text-slate-500 text-xs">Update your account password</p>
                            </div>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {[
                                { key: 'old_password', label: 'Current Password' },
                                { key: 'new_password', label: 'New Password' },
                                { key: 'confirm_password', label: 'Confirm New Password' }
                            ].map(({ key, label }) => (
                                <div key={key} className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</label>
                                    <input
                                        type="password" required
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-rose-500 transition-colors"
                                        value={passwordData[key]}
                                        onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                                    />
                                </div>
                            ))}
                            <button
                                type="submit" disabled={loading}
                                className="w-full md:w-auto px-8 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-black border border-rose-500/20 py-4 rounded-2xl transition-all flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
