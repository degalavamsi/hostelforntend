import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import {
    Users, CheckCircle2, XCircle, Search, Eye, FileText,
    Trash2, UserCheck, Mail, Phone, ExternalLink, Loader2, Lock, X, Camera
} from 'lucide-react';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [dues, setDues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [viewStudent, setViewStudent] = useState(null); // for detail modal
    const [allocationData, setAllocationData] = useState({
        room_number: '',
        bed_number: '',
        rent_amount: '',
        deposit: '',
        join_date: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        try {
            const [studentRes, duesRes] = await Promise.all([
                api.get(`/students/search?q=${search}`),
                api.get('/payments/dues')
            ]);
            setStudents(studentRes.data);
            setDues(duesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDepositStatus = async (studentId, status) => {
        try {
            await api.put(`/students/update-deposit-status/${studentId}`, { status });
            fetchData();
        } catch (err) {
            console.error('Failed to update deposit status', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search]);

    const handleApprove = async (id) => {
        try {
            await api.post(`/students/approve/${id}`);
            fetchData();
        } catch (err) {
            alert('Approval failed');
        }
    };

    const handleRemove = async (id) => {
        if (window.confirm('Are you sure you want to remove this student?')) {
            try {
                await api.post(`/students/remove/${id}`);
                fetchData();
            } catch (err) {
                alert('Removal failed');
            }
        }
    };

    const handleAllocateRoom = async (e) => {
        e.preventDefault();
        try {
            await api.post('/students/allocate-room', {
                student_id: selectedStudent._id,
                ...allocationData
            });
            alert('Room allocated successfully');
            setSelectedStudent(null);
            fetchData();
        } catch (err) {
            alert('Allocation failed');
        }
    };

    const validatePassword = (pass) => {
        if (pass.length < 8) return "Password must be at least 8 characters long.";
        if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
        if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
        if (!/[0-9]/.test(pass)) return "Password must contain at least one digit.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one special character.";
        return "";
    };

    const handleResetPassword = async (id) => {
        const newPassword = window.prompt('Enter new password for student (8+ chars, with upper, lower, digit, special):');
        if (newPassword) {
            const passwordError = validatePassword(newPassword);
            if (passwordError) {
                alert(passwordError);
                return;
            }
            try {
                await api.post('/auth/admin/reset-password', { student_id: id, new_password: newPassword });
                alert('Password reset successfully');
            } catch (err) {
                alert(err.response?.data?.msg || 'Reset failed');
            }
        }
    };

    const API_URL = import.meta.env.VITE_API_URL;

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Student <span className="text-primary-500">Records</span></h1>
                    <p className="text-slate-500 text-[10px] font-medium tracking-tight">Manage admissions and room allocations.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl w-72 shadow-xl shadow-black/20">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        className="bg-transparent border-none focus:ring-0 text-slate-200 w-full text-xs"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 bg-white/5">
                            <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tight">Student</th>
                            <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tight">Room & Deposit</th>
                            <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tight">Status</th>
                            <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-tight text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {students.map((student) => (
                            <tr key={student._id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary-600/20 text-primary-400 rounded-lg flex items-center justify-center font-black text-xs border border-primary-500/20">
                                            {student.username?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm tracking-tight">{student.username || 'Requested'}</p>
                                            <p className="text-slate-500 text-[10px] tracking-tight">{student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="space-y-1.5">
                                        <div className="text-slate-200 font-bold text-xs">
                                            Room: <span className="text-primary-400">{student.room_number || 'NA'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-slate-500 text-[8px] font-black uppercase tracking-tight">
                                                ₹{student.deposit || 0}
                                            </div>
                                            <select
                                                className="bg-slate-950 border border-slate-800 text-[7px] text-slate-400 rounded-md px-1 py-0.5 outline-none focus:border-primary-500 transition-colors w-fit font-black uppercase tracking-tighter"
                                                value={student.deposit_refund_status || 'not_paid'}
                                                onChange={(e) => handleUpdateDepositStatus(student._id, e.target.value)}
                                            >
                                                <option value="not_paid">NOT PAID</option>
                                                <option value="paid">PAID</option>
                                                <option value="partially_refunded">PARTIAL</option>
                                                <option value="refunded">REFUND</option>
                                            </select>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex flex-col gap-1.5">
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black tracking-tight inline-flex items-center gap-1.5 border ${student.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/10' :
                                            student.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/10' :
                                                'bg-red-500/10 text-red-400 border-red-500/10'
                                            }`}>
                                            <div className={`w-1 h-1 rounded-full ${student.status === 'approved' ? 'bg-green-400' :
                                                student.status === 'pending' ? 'bg-amber-400' :
                                                    'bg-red-400'
                                                }`}></div>
                                            {student.status?.toUpperCase()}
                                        </span>
                                        {dues.some(d => d.student_id === student._id) && (
                                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-[7px] font-black uppercase tracking-tight animate-pulse flex items-center gap-1 justify-center w-fit">
                                                DUE PENDING
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {student.status === 'pending' && (
                                            <button
                                                onClick={() => handleApprove(student._id)}
                                                className="p-1.5 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                                                title="Approve"
                                            >
                                                <UserCheck className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {student.status === 'approved' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setAllocationData({
                                                        room_number: student.room_number || '',
                                                        bed_number: student.bed_number || '',
                                                        rent_amount: student.rent_amount || '',
                                                        deposit: student.deposit || '',
                                                        join_date: student.join_date?.split('T')[0] || new Date().toISOString().split('T')[0]
                                                    });
                                                }}
                                                className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                                                title="Allocate"
                                            >
                                                <Search className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setViewStudent(student)}
                                            className="p-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white rounded-lg transition-all"
                                            title="View"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleResetPassword(student._id)}
                                            className="p-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all"
                                            title="Reset"
                                        >
                                            <Lock className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleRemove(student._id)}
                                            className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && (
                    <div className="p-12 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                        <p className="text-slate-400 font-medium">Loading student records...</p>
                    </div>
                )}
                {!loading && students.length === 0 && (
                    <div className="p-12 text-center">
                        <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">No students found matching your search.</p>
                    </div>
                )}
            </div>

            {selectedStudent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-slate-800 bg-white/5">
                            <h2 className="text-2xl font-black text-white">Allocate <span className="text-primary-500">Room</span></h2>
                            <p className="text-slate-400 text-sm mt-1">Assign room and deposit for {selectedStudent.username}</p>
                        </div>
                        <form onSubmit={handleAllocateRoom} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-400 uppercase tracking-tight">Room Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="Enter room number (e.g. 101)"
                                    value={allocationData.room_number}
                                    onChange={(e) => setAllocationData({ ...allocationData, room_number: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-400 uppercase tracking-tight text-[10px]">Bed #</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="A1"
                                        value={allocationData.bed_number}
                                        onChange={(e) => setAllocationData({ ...allocationData, bed_number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-400 uppercase tracking-tight text-[10px]">Rent (₹)</label>
                                    <input
                                        type="number" required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="5000"
                                        value={allocationData.rent_amount}
                                        onChange={(e) => setAllocationData({ ...allocationData, rent_amount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-400 uppercase tracking-tight">Security Deposit (₹)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="Enter deposit amount"
                                    value={allocationData.deposit}
                                    onChange={(e) => setAllocationData({ ...allocationData, deposit: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-400 uppercase tracking-tight">Join Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    value={allocationData.join_date}
                                    onChange={(e) => setAllocationData({ ...allocationData, join_date: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudent(null)}
                                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-900/20 transition-all"
                                >
                                    Allocate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Student Detail Modal */}
            {viewStudent && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-slate-800 bg-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-white">Student <span className="text-primary-500">Details</span></h2>
                                <p className="text-slate-500 text-sm mt-1">{viewStudent.email}</p>
                            </div>
                            <button onClick={() => setViewStudent(null)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                            {/* Profile row */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-[20px] bg-slate-800 overflow-hidden border-2 border-slate-700 shrink-0">
                                    {viewStudent.photo_path ? (
                                        <img
                                            src={`${API_URL}/uploads/documents/${viewStudent.photo_path}`}
                                            alt="Student Photo"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-600">
                                            {viewStudent.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white">{viewStudent.username}</h3>
                                    <p className="text-slate-500">{viewStudent.phone || 'No phone'}</p>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${viewStudent.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        {viewStudent.status}
                                    </span>
                                </div>
                            </div>

                            {/* Stay Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Room', value: viewStudent.room_number || 'Not assigned' },
                                    { label: 'Bed', value: viewStudent.bed_number || 'Not assigned' },
                                    { label: 'Monthly Rent', value: viewStudent.rent_amount ? `₹${viewStudent.rent_amount}` : 'Not set' },
                                    { label: 'Deposit', value: viewStudent.deposit ? `₹${viewStudent.deposit}` : 'Not set' },
                                    { label: 'Deposit Status', value: viewStudent.deposit_refund_status?.replace('_', ' ') || 'not paid' },
                                    { label: 'Join Date', value: viewStudent.join_date ? new Date(viewStudent.join_date).toLocaleDateString() : 'Not set' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                                        <p className="text-white font-bold text-sm">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Documents */}
                            <div>
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Documents</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-5 rounded-2xl border ${viewStudent.photo_path ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Camera className={`w-4 h-4 ${viewStudent.photo_path ? 'text-green-400' : 'text-slate-500'}`} />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Photo</span>
                                        </div>
                                        {viewStudent.photo_path ? (
                                            <a
                                                href={`${API_URL}/uploads/documents/${viewStudent.photo_path}`}
                                                target="_blank" rel="noreferrer"
                                                className="flex items-center gap-2 text-green-400 text-sm font-bold hover:text-green-300 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" /> View Photo
                                            </a>
                                        ) : (
                                            <p className="text-slate-600 text-sm">Not uploaded</p>
                                        )}
                                    </div>
                                    <div className={`p-5 rounded-2xl border ${viewStudent.id_proof_path ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className={`w-4 h-4 ${viewStudent.id_proof_path ? 'text-green-400' : 'text-slate-500'}`} />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ID Proof</span>
                                        </div>
                                        {viewStudent.id_proof_path ? (
                                            <a
                                                href={`${API_URL}/uploads/documents/${viewStudent.id_proof_path}`}
                                                target="_blank" rel="noreferrer"
                                                className="flex items-center gap-2 text-green-400 text-sm font-bold hover:text-green-300 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" /> View ID Proof
                                            </a>
                                        ) : (
                                            <p className="text-slate-600 text-sm">Not uploaded</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-800 flex justify-end">
                            <button
                                onClick={() => setViewStudent(null)}
                                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;
