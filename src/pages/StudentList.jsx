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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-main tracking-tight">Student <span className="text-primary">Records</span></h1>
                    <p className="text-muted text-xs font-medium uppercase tracking-wider mt-1">Manage admissions and room allocations.</p>
                </div>
                <div className="flex items-center gap-3 bg-app border border-border px-4 py-2.5 rounded-full w-full md:w-72 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Search className="w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        className="bg-transparent border-none focus:ring-0 text-main w-full text-sm outline-none placeholder:text-muted"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="card-3d rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-app">
                            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Room & Deposit</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {students.map((student) => (
                            <tr key={student._id} className="hover:bg-app transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                            {student.username?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-main font-semibold text-sm tracking-tight">{student.username || 'Requested'}</p>
                                            <p className="text-muted text-xs">{student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        <div className="text-main font-medium text-sm">
                                            Room: <span className="text-primary font-semibold">{student.room_number || 'NA'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="text-muted text-xs font-medium uppercase tracking-wider">
                                                ₹{student.deposit || 0}
                                            </div>
                                            <select
                                                className="card-3d text-xs text-muted rounded-md px-2 py-1 outline-none focus:border-primary transition-colors w-fit font-medium uppercase tracking-wider"
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
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-2">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1.5 w-fit uppercase ${student.status === 'approved' ? 'bg-success/10 text-success' :
                                            student.status === 'pending' ? 'bg-warning/10 text-warning' :
                                                'bg-danger/10 text-danger'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${student.status === 'approved' ? 'bg-success' :
                                                student.status === 'pending' ? 'bg-warning' :
                                                    'bg-danger'
                                                }`}></div>
                                            {student.status?.replace('_', ' ')}
                                        </span>
                                        {dues.some(d => d.student_id === student._id) && (
                                            <span className="px-2.5 py-1 bg-danger/10 text-danger rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center justify-center w-fit">
                                                DUE PENDING
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {student.status === 'pending' && (
                                            <button
                                                onClick={() => handleApprove(student._id)}
                                                className="p-2 text-success hover:bg-success/10 rounded-xl transition-all"
                                                title="Approve"
                                            >
                                                <UserCheck className="w-4 h-4" />
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
                                                className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                                                title="Allocate"
                                            >
                                                <Search className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setViewStudent(student)}
                                            className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleResetPassword(student._id)}
                                            className="p-2 text-warning hover:bg-warning/10 rounded-xl transition-all"
                                            title="Reset"
                                        >
                                            <Lock className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRemove(student._id)}
                                            className="p-2 text-danger hover:bg-danger/10 rounded-xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && (
                    <div className="p-12 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted font-medium">Loading student records...</p>
                    </div>
                )}
                {!loading && students.length === 0 && (
                    <div className="p-12 text-center">
                        <Users className="w-16 h-16 text-muted mx-auto mb-4 opacity-30" />
                        <p className="text-muted text-sm font-medium">No students found matching your search.</p>
                    </div>
                )}
            </div>

            {selectedStudent && (
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card-3d rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-border bg-app">
                            <h2 className="text-2xl font-semibold text-main tracking-tight">Allocate <span className="text-primary">Room</span></h2>
                            <p className="text-muted text-xs font-medium uppercase tracking-wider mt-1">Assign room and deposit for {selectedStudent.username}</p>
                        </div>
                        <form onSubmit={handleAllocateRoom} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Room Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-app border border-border rounded-xl p-3 text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                                    placeholder="Enter room number (e.g. 101)"
                                    value={allocationData.room_number}
                                    onChange={(e) => setAllocationData({ ...allocationData, room_number: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Bed #</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-app border border-border rounded-xl p-3 text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                                        placeholder="A1"
                                        value={allocationData.bed_number}
                                        onChange={(e) => setAllocationData({ ...allocationData, bed_number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Rent (₹)</label>
                                    <input
                                        type="number" required
                                        className="w-full bg-app border border-border rounded-xl p-3 text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                                        placeholder="5000"
                                        value={allocationData.rent_amount}
                                        onChange={(e) => setAllocationData({ ...allocationData, rent_amount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Security Deposit (₹)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-app border border-border rounded-xl p-3 text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                                    placeholder="Enter deposit amount"
                                    value={allocationData.deposit}
                                    onChange={(e) => setAllocationData({ ...allocationData, deposit: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Join Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-app border border-border rounded-xl p-3 text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                                    value={allocationData.join_date}
                                    onChange={(e) => setAllocationData({ ...allocationData, join_date: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudent(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-muted hover:text-main bg-app hover:bg-border transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-primary hover:opacity-90 text-white rounded-xl font-medium shadow-lg shadow-primary/20 transition-all"
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
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card-3d rounded-3xl w-full max-w-2xl overflow-hidden">
                        <div className="p-8 border-b border-border bg-app flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-main tracking-tight">Student <span className="text-primary">Details</span></h2>
                                <p className="text-muted text-sm font-medium mt-1">{viewStudent.email}</p>
                            </div>
                            <button onClick={() => setViewStudent(null)} className="p-2 text-muted hover:text-main hover:bg-border rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                            {/* Profile row */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-2xl bg-app overflow-hidden border border-border shrink-0">
                                    {viewStudent.photo_path ? (
                                        <img
                                            src={`${API_URL}/uploads/documents/${viewStudent.photo_path}`}
                                            alt="Student Photo"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary/40 bg-primary/5">
                                            {viewStudent.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-semibold text-main tracking-tight">{viewStudent.username}</h3>
                                    <p className="text-muted font-medium">{viewStudent.phone || 'No phone'}</p>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${viewStudent.status === 'approved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
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
                                    <div key={label} className="p-4 bg-app rounded-xl border border-border">
                                        <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">{label}</p>
                                        <p className="text-main font-semibold text-sm">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Documents */}
                            <div>
                                <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-4">Documents</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-5 rounded-xl border ${viewStudent.photo_path ? 'bg-success/5 border-success/20' : 'bg-app border-border'}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Camera className={`w-4 h-4 ${viewStudent.photo_path ? 'text-success' : 'text-muted'}`} />
                                            <span className="text-xs font-medium text-muted uppercase tracking-wider">Photo</span>
                                        </div>
                                        {viewStudent.photo_path ? (
                                            <a
                                                href={`${API_URL}/uploads/documents/${viewStudent.photo_path}`}
                                                target="_blank" rel="noreferrer"
                                                className="flex items-center gap-2 text-success text-sm font-semibold hover:opacity-80 transition-opacity"
                                            >
                                                <Eye className="w-4 h-4" /> View Photo
                                            </a>
                                        ) : (
                                            <p className="text-muted text-sm font-medium">Not uploaded</p>
                                        )}
                                    </div>
                                    <div className={`p-5 rounded-xl border ${viewStudent.id_proof_path ? 'bg-success/5 border-success/20' : 'bg-app border-border'}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className={`w-4 h-4 ${viewStudent.id_proof_path ? 'text-success' : 'text-muted'}`} />
                                            <span className="text-xs font-medium text-muted uppercase tracking-wider">ID Proof</span>
                                        </div>
                                        {viewStudent.id_proof_path ? (
                                            <a
                                                href={`${API_URL}/uploads/documents/${viewStudent.id_proof_path}`}
                                                target="_blank" rel="noreferrer"
                                                className="flex items-center gap-2 text-success text-sm font-semibold hover:opacity-80 transition-opacity"
                                            >
                                                <Eye className="w-4 h-4" /> View ID Proof
                                            </a>
                                        ) : (
                                            <p className="text-muted text-sm font-medium">Not uploaded</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border flex justify-end bg-app">
                            <button
                                onClick={() => setViewStudent(null)}
                                className="px-6 py-2.5 card-3d hover:bg-border text-main font-medium rounded-xl transition-all"
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
