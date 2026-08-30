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
            <div className="flex items-center justify-between border-b border-border pb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-main tracking-tight">Resident <span className="text-primary">Profile</span></h1>
                    <p className="text-muted text-xs font-medium uppercase tracking-wider mt-1">Manage your profile, documents and security.</p>
                </div>
            </div>

            {msg.text && (
                <div className={`flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold ${msg.type === 'error' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'
                    }`}>
                    {msg.type === 'error' ? <X className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    {msg.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Avatar & Basic Info */}
                <div className="space-y-6">
                    {/* Avatar */}
                    <div className="card-3d rounded-3xl p-8 flex flex-col items-center gap-4">
                        <div className="w-28 h-28 rounded-3xl overflow-hidden bg-app border-2 border-border relative group flex items-center justify-center">
                            {profile?.photo_path ? (
                                <img
                                    src={`${API_URL}/uploads/documents/${profile.photo_path}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-4xl font-bold text-muted">
                                    {profile?.username?.[0]?.toUpperCase() || <User className="w-12 h-12" />}
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-main">{profile?.username}</h3>
                            <p className="text-muted text-[10px] uppercase font-bold tracking-wider mt-1">{profile?.email}</p>
                            <span className="inline-block mt-3 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                {user?.roles?.[0]}
                            </span>
                        </div>
                    </div>

                    {/* Hostel Details (student only) */}
                    {isStudent && (
                        <div className="card-3d rounded-3xl p-7 space-y-4">
                            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Stay Details</h3>
                            {[
                                { label: 'Room', value: profile?.room_number || 'Not assigned' },
                                { label: 'Bed', value: profile?.bed_number || 'Not assigned' },
                                { label: 'Rent', value: profile?.rent_amount ? `₹${profile.rent_amount}/month` : 'Not set' },
                                { label: 'Deposit', value: profile?.deposit ? `₹${profile.deposit}` : 'Not set' },
                                { label: 'Joined', value: profile?.join_date ? new Date(profile.join_date).toLocaleDateString() : 'Not set' },
                                { label: 'Deposit Status', value: profile?.deposit_refund_status?.replace('_', ' ') || 'not paid' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                                    <span className="text-muted text-[10px] font-bold uppercase tracking-wider">{label}</span>
                                    <span className="text-main text-sm font-semibold">{value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile update */}
                    <div className="card-3d rounded-3xl p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary"><User className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-xl font-semibold text-main tracking-tight">Personal Info</h2>
                                <p className="text-muted text-xs font-medium mt-1">Update your name and phone number</p>
                            </div>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {isStudent && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Block</label>
                                        <input
                                            type="text"
                                            className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted/50"
                                            value={profileData.block}
                                            onChange={(e) => setProfileData({ ...profileData, block: e.target.value })}
                                            placeholder="e.g. A"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Floor</label>
                                        <input
                                            type="text"
                                            className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted/50"
                                            value={profileData.floor}
                                            onChange={(e) => setProfileData({ ...profileData, floor: e.target.value })}
                                            placeholder="e.g. 1"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Email (read-only)</label>
                                <input
                                    type="email" disabled
                                    className="w-full bg-app/50 border border-border rounded-xl p-3.5 text-muted font-medium outline-none cursor-not-allowed opacity-70"
                                    value={profile?.email || ''}
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full md:w-auto px-8 bg-primary hover:opacity-90 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                            </button>
                        </form>
                    </div>

                    {/* Document Upload */}
                    <div className="card-3d rounded-3xl p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-success/10 rounded-2xl text-success"><ShieldCheck className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-xl font-semibold text-main tracking-tight">My Documents</h2>
                                <p className="text-muted text-xs font-medium mt-1">Upload or update your photo and ID proof</p>
                            </div>
                        </div>

                        {/* Existing docs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className={`p-5 rounded-2xl border ${profile?.photo_path ? 'bg-success/5 border-success/20' : 'bg-app border-border'}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Camera className={`w-4 h-4 ${profile?.photo_path ? 'text-success' : 'text-muted'}`} />
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Photo</span>
                                </div>
                                {profile?.photo_path ? (
                                    <div className="space-y-3">
                                        <img
                                            src={`${API_URL}/uploads/documents/${profile.photo_path}`}
                                            alt="ID"
                                            className="w-full h-24 object-cover rounded-xl border border-border"
                                        />
                                        <a
                                            href={`${API_URL}/uploads/documents/${profile.photo_path}`}
                                            target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1.5 text-success text-xs font-semibold hover:underline"
                                        >
                                            <Eye className="w-4 h-4" /> View Document
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-muted text-xs font-medium">Not uploaded</p>
                                )}
                            </div>
                            <div className={`p-5 rounded-2xl border ${profile?.id_proof_path ? 'bg-success/5 border-success/20' : 'bg-app border-border'}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className={`w-4 h-4 ${profile?.id_proof_path ? 'text-success' : 'text-muted'}`} />
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">ID Proof</span>
                                </div>
                                {profile?.id_proof_path ? (
                                    <div className="space-y-3">
                                        <div className="w-full h-24 bg-app rounded-xl flex items-center justify-center border border-border">
                                            <FileText className="w-8 h-8 text-success" />
                                        </div>
                                        <a
                                            href={`${API_URL}/uploads/documents/${profile.id_proof_path}`}
                                            target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1.5 text-success text-xs font-semibold hover:underline"
                                        >
                                            <Eye className="w-4 h-4" /> View Document
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-muted text-xs font-medium">Not uploaded</p>
                                )}
                            </div>
                        </div>

                        {/* Upload form */}
                        <form onSubmit={handleUploadDocuments} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">New Photo</label>
                                    <input
                                        type="file" accept="image/*"
                                        className="w-full bg-app border border-border rounded-xl p-2.5 text-main text-sm font-medium outline-none file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                                        onChange={(e) => setFiles({ ...files, photo: e.target.files[0] })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">New ID Proof</label>
                                    <input
                                        type="file" accept=".pdf,image/*"
                                        className="w-full bg-app border border-border rounded-xl p-2.5 text-main text-sm font-medium outline-none file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                                        onChange={(e) => setFiles({ ...files, id_proof: e.target.files[0] })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit" disabled={docLoading}
                                className="w-full md:w-auto px-8 bg-success hover:bg-success/90 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-success/20"
                            >
                                {docLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /> Upload Documents</>}
                            </button>
                        </form>
                    </div>

                    {/* Admin Global Settings */}
                    {!isStudent && (
                        <div className="card-3d border-primary/20 rounded-3xl p-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Camera className="w-6 h-6" /></div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-main tracking-tight">Global Loader Logo</h2>
                                        <p className="text-muted text-xs font-medium mt-1">Upload a custom logo to act as the bouncing loader</p>
                                    </div>
                                </div>
                                <form onSubmit={handleUploadLoader} className="flex flex-col sm:flex-row gap-4 sm:items-end">
                                    <div className="space-y-2 flex-1">
                                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Image File</label>
                                        <input
                                            type="file" accept="image/*"
                                            className="w-full bg-app border border-border rounded-xl p-2.5 text-main text-sm font-medium outline-none file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                                            onChange={(e) => setLoaderFile(e.target.files[0])}
                                        />
                                    </div>
                                    <button
                                        type="submit" disabled={loading}
                                        className="px-8 bg-primary hover:opacity-90 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Change Password */}
                    <div className="card-3d rounded-3xl p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-danger/10 rounded-2xl text-danger"><Lock className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-xl font-semibold text-main tracking-tight">Change Password</h2>
                                <p className="text-muted text-xs font-medium mt-1">Update your account password</p>
                            </div>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            {[
                                { key: 'old_password', label: 'Current Password' },
                                { key: 'new_password', label: 'New Password' },
                                { key: 'confirm_password', label: 'Confirm New Password' }
                            ].map(({ key, label }) => (
                                <div key={key} className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">{label}</label>
                                    <input
                                        type="password" required
                                        className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-danger focus:ring-2 focus:ring-danger/20 transition-all"
                                        value={passwordData[key]}
                                        onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                                    />
                                </div>
                            ))}
                            <button
                                type="submit" disabled={loading}
                                className="w-full md:w-auto px-8 bg-danger/10 hover:bg-danger/20 text-danger font-medium border border-danger/20 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
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
