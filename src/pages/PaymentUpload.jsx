import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    CreditCard, Upload, History, Edit2, BellRing,
    CheckCircle2, Clock, AlertCircle, DollarSign, Loader2, Eye, Check, X,
    QrCode, Smartphone, Send
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

const PaymentUpload = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showRentModal, setShowRentModal] = useState(false);
    const [file, setFile] = useState(null);
    const [statusModal, setStatusModal] = useState({ show: false, pay: null, amount_paid: '', status: 'pending' });
    const [reminderModal, setReminderModal] = useState({ show: false, pay: null, upi_id: '', message: '', qrFile: null, sending: false });

    const [paymentData, setPaymentData] = useState({
        month: 'January',
        year: '2026',
        amount: ''
    });
    const [rentParams, setRentParams] = useState({
        month: 'January',
        year: '2026',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        student_id: 'all',
        upi_id: ''
    });
    const [rentQrFile, setRentQrFile] = useState(null);
    const [rentQrUrl, setRentQrUrl] = useState('');
    const [approvedStudents, setApprovedStudents] = useState([]);

    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('manager');

    const fetchPayments = async () => {
        try {
            const endpoint = isAdmin ? '/payments/all' : '/payments/history';
            const res = await api.get(endpoint);
            setPayments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchApprovedStudents = async () => {
        if (isAdmin) {
            try {
                const res = await api.get('/students/search?status=approved');
                setApprovedStudents(res.data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        fetchPayments();
        fetchApprovedStudents();
    }, [isAdmin]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a receipt file');

        setUploading(true);
        const formData = new FormData();
        formData.append('receipt', file);
        formData.append('month', paymentData.month);
        formData.append('year', paymentData.year);
        formData.append('amount', paymentData.amount);

        try {
            await api.post('/payments/upload-receipt', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchPayments();
            setFile(null);
            setPaymentData({ ...paymentData, amount: '' });
            alert('Receipt uploaded successfully!');
        } catch (err) {
            alert(err.response?.data?.msg || 'Upload failed. Ensure you are an approved student.');
        }
        setUploading(false);
    };

    const handleVerify = async (id) => {
        try {
            await api.post(`/payments/verify/${id}`);
            fetchPayments();
            alert('Payment verified successfully');
        } catch (err) {
            alert('Verification failed');
        }
    };

    const handleGenerateRent = async (e) => {
        e.preventDefault();
        try {
            // Upload QR first if provided
            let qr_url = rentQrUrl;
            if (rentQrFile && !rentQrUrl) {
                const qrForm = new FormData();
                qrForm.append('qr_image', rentQrFile);
                qrForm.append('upi_id', rentParams.upi_id);
                qrForm.append('message', 'Rent generated');
                // Use a temp payment id of 'bulk' for naming
                const uploadRes = await api.post('/payments/bulk/remind', qrForm, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }).catch(() => null);
                // We skip individual upload error silently — just pass upi_id
            }
            const res = await api.post('/payments/generate-monthly-rent', {
                ...rentParams,
                upi_id: rentParams.upi_id,
                qr_url: rentQrUrl
            });
            alert(res.data.msg);
            setShowRentModal(false);
            setRentQrFile(null);
            setRentQrUrl('');
            fetchPayments();
        } catch (err) {
            alert('Rent generation failed');
        }
    };

    const openStatusModal = (pay) => {
        setStatusModal({
            show: true,
            pay,
            amount_paid: pay.amount_paid || 0,
            status: pay.status || 'unpaid'
        });
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/payments/${statusModal.pay._id}/status`, {
                amount_paid: statusModal.amount_paid,
                status: statusModal.status
            });
            fetchPayments();
            setStatusModal({ show: false, pay: null, amount_paid: '', status: 'pending' });
        } catch (err) { alert('Status update failed'); }
    };

    const handleRemind = (pay) => {
        setReminderModal({ show: true, pay, upi_id: '', message: '', qrFile: null, sending: false });
    };

    const handleSendReminder = async (e) => {
        e.preventDefault();
        setReminderModal(prev => ({ ...prev, sending: true }));
        try {
            const formData = new FormData();
            formData.append('upi_id', reminderModal.upi_id);
            formData.append('message', reminderModal.message);
            if (reminderModal.qrFile) {
                formData.append('qr_image', reminderModal.qrFile);
            }
            await api.post(`/payments/${reminderModal.pay._id}/remind`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setReminderModal({ show: false, pay: null, upi_id: '', message: '', qrFile: null, sending: false });
            alert('✅ Reminder sent with QR code to student!');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to send reminder.');
            setReminderModal(prev => ({ ...prev, sending: false }));
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
    );

    return (
        <div className="w-full space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-extrabold text-white tracking-tight">
                        {isAdmin ? 'Payment Management' : 'Your Payments'}
                    </h1>
                    <p className="text-slate-400 text-[10px] font-medium tracking-tight">
                        {isAdmin ? 'Verify receipts, update balances, and remind students.' : 'Upload monthly receipts and track your status.'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowRentModal(true)}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl font-extrabold flex items-center gap-2 shadow-lg shadow-primary-900/20 transition-all text-sm"
                    >
                        <DollarSign className="w-5 h-5" /> Generate Rent
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {!isAdmin && (
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-6 shadow-xl">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-primary-400" /> New Payment
                            </h2>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <select
                                    className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none focus:ring-1 focus:ring-primary-500"
                                    value={paymentData.type || 'rent'}
                                    onChange={(e) => setPaymentData({ ...paymentData, type: e.target.value })}
                                >
                                    <option value="rent">Rent Payment</option>
                                    <option value="deposit">Security Deposit</option>
                                </select>
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none focus:ring-1 focus:ring-primary-500"
                                        value={paymentData.month}
                                        onChange={(e) => setPaymentData({ ...paymentData, month: e.target.value })}
                                    >
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none focus:ring-1 focus:ring-primary-500"
                                        value={paymentData.year}
                                        onChange={(e) => setPaymentData({ ...paymentData, year: e.target.value })}
                                    >
                                        {['2025', '2026', '2027'].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="number" placeholder="Amount" required
                                        className="w-full bg-slate-800 border-none rounded-2xl p-4 pl-12 text-white outline-none focus:ring-1 focus:ring-primary-500"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-primary-500/50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file" required
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                    <div className="space-y-2">
                                        <CreditCard className="w-8 h-8 text-slate-500 mx-auto" />
                                        <p className="text-slate-400 text-sm font-medium">
                                            {file ? file.name : 'Choose receipt'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="submit" disabled={uploading}
                                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload Receipt'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className={`${isAdmin ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
                    <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-slate-800">
                                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Details</th>
                                    {isAdmin && <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Student</th>}
                                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Amount & Due</th>
                                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {payments.map((pay) => (
                                    <tr key={pay._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <p className="text-white font-bold">{pay.month} {pay.year}</p>
                                            <p className="text-slate-500 text-xs mt-1">Ref: {new Date(pay.created_at).toLocaleDateString()}</p>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-8 py-6">
                                                <p className="text-white font-bold text-sm">
                                                    {pay.student_name || 'Unknown'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {pay.student_room && pay.student_room !== '—' && (
                                                        <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-lg text-[10px] font-black">
                                                            Room {pay.student_room}
                                                        </span>
                                                    )}
                                                    {pay.student_bed && (
                                                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-black">
                                                            Bed {pay.student_bed}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-xs w-28">
                                                    <span className="text-slate-500 font-bold tracking-widest uppercase">Total</span>
                                                    <span className="text-white font-black">₹{pay.amount}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs w-28">
                                                    <span className="text-green-500/70 font-bold tracking-widest uppercase">Paid</span>
                                                    <span className="text-green-400 font-black">₹{pay.amount_paid || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] w-28 border-t border-slate-700/50 pt-1 mt-1">
                                                    <span className="text-red-400/70 font-bold tracking-widest uppercase">Bal</span>
                                                    <span className="text-red-400 font-black">₹{pay.balance !== undefined ? pay.balance : pay.amount}</span>
                                                </div>
                                                {pay.due_date && (
                                                    <p className="text-slate-500 text-[9px] uppercase font-bold tracking-tighter pt-1.5">
                                                        Due: {new Date(pay.due_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${pay.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                                                pay.status === 'partial' ? 'bg-blue-500/10 text-blue-400' :
                                                    pay.status === 'verified' ? 'bg-green-500/10 text-green-400' :
                                                        'bg-red-500/10 text-red-400'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${pay.status === 'paid' || pay.status === 'verified' ? 'bg-green-400' :
                                                    pay.status === 'partial' ? 'bg-blue-400' :
                                                        'bg-red-400'
                                                    }`}></div>
                                                {(pay.status === 'pending' && !pay.is_paid) ? 'UNPAID' : pay.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {pay.receipt_path && (
                                                    <a
                                                        href={`${import.meta.env.VITE_API_URL || '/api'}/uploads/receipts/${pay.receipt_path}`}

                                                        target="_blank" rel="noreferrer"
                                                        className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                                                        title="View Receipt"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {isAdmin && (
                                                    <>
                                                        <button onClick={() => openStatusModal(pay)} className="p-2.5 bg-blue-500/10 text-blue-400 hover:text-white hover:bg-blue-500 rounded-xl transition-all" title="Update Status & Balance">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleRemind(pay)} className="p-2.5 bg-amber-500/10 text-amber-400 hover:text-white hover:bg-amber-500 rounded-xl transition-all" title="Send Payment Reminder with QR">
                                                            <BellRing className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {payments.length === 0 && (
                            <div className="p-20 text-center">
                                <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium text-lg">No payment records found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            {statusModal.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative">
                        <button onClick={() => setStatusModal({ show: false, pay: null, amount_paid: '', status: 'pending' })} className="absolute top-6 right-6 text-slate-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-black text-white mb-2">Update <span className="text-blue-500">Status</span></h2>
                        <p className="text-slate-400 text-sm mb-6">Modify the payment progress for {statusModal.pay?.student_name}.</p>
                        <form onSubmit={handleUpdateStatus} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount Paid (₹)</label>
                                <input type="number" required className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500" value={statusModal.amount_paid} onChange={(e) => setStatusModal({ ...statusModal, amount_paid: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                                <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500" value={statusModal.status} onChange={(e) => setStatusModal({ ...statusModal, status: e.target.value })}>
                                    <option value="unpaid">Unpaid</option>
                                    <option value="partial">Partial Payment</option>
                                    <option value="paid">Fully Paid</option>
                                    <option value="verified">Verified</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all">Save Progress</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Rent Generation Modal */}
            {showRentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                        <div className="p-8 border-b border-slate-800 bg-white/5 sticky top-0 z-10 rounded-t-[32px] backdrop-blur">
                            <h2 className="text-2xl font-bold text-white">Generate <span className="text-primary-500">Rent</span></h2>
                            <p className="text-slate-400 text-sm mt-1">Create monthly rent records for all approved students.</p>
                        </div>
                        <form onSubmit={handleGenerateRent} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Select Student</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={rentParams.student_id}
                                    onChange={(e) => setRentParams({ ...rentParams, student_id: e.target.value })}
                                >
                                    <option value="all">All Approved Students</option>
                                    {approvedStudents.map(s => (
                                        <option key={s.user_id} value={s.user_id}>{s.username} (Room {s.room_number || 'NA'})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Month</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                        value={rentParams.month}
                                        onChange={(e) => setRentParams({ ...rentParams, month: e.target.value })}
                                    >
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Year</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                        value={rentParams.year}
                                        onChange={(e) => setRentParams({ ...rentParams, year: e.target.value })}
                                    >
                                        {['2025', '2026', '2027'].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Amount (₹)</label>
                                <input
                                    type="number" required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Total amount"
                                    value={rentParams.amount}
                                    onChange={(e) => setRentParams({ ...rentParams, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
                                <input
                                    type="date" required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={rentParams.due_date}
                                    onChange={(e) => setRentParams({ ...rentParams, due_date: e.target.value })}
                                />
                            </div>

                            {/* ── Payment Details for Notification ── */}
                            <div className="border-t border-white/5 pt-5 space-y-4">
                                <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Smartphone className="w-3 h-3" /> Payment Info for Notification (optional)
                                </p>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest">UPI / PhonePe ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. hostel@paytm or 98765@upi"
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-3 text-white placeholder:text-slate-700 outline-none focus:border-amber-500 transition-colors text-sm"
                                        value={rentParams.upi_id}
                                        onChange={e => setRentParams({ ...rentParams, upi_id: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                                        <QrCode className="w-3 h-3" /> QR Code Photo
                                    </label>
                                    <label className={`flex items-center gap-3 w-full border border-dashed rounded-2xl p-3 cursor-pointer transition-all ${rentQrFile ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-amber-500/30'}`}>
                                        <input type="file" accept="image/*" className="hidden"
                                            onChange={e => { setRentQrFile(e.target.files[0]); setRentQrUrl(''); }} />
                                        <QrCode className={`w-5 h-5 ${rentQrFile ? 'text-amber-400' : 'text-slate-700'}`} />
                                        <span className={`text-xs font-bold ${rentQrFile ? 'text-amber-400' : 'text-slate-600'}`}>
                                            {rentQrFile ? rentQrFile.name : 'Click to upload QR photo (PhonePe, GPay, Paytm)'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button" onClick={() => setShowRentModal(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-900/20 transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 💸 Payment Reminder with QR Modal */}
            {reminderModal.show && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setReminderModal(m => ({ ...m, show: false }))} className="absolute top-6 right-6 text-slate-500 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
                                <BellRing className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-white">Send Payment <span className="text-amber-400">Reminder</span></h2>
                                <p className="text-slate-500 text-[10px] font-medium tracking-tight mt-0.5">
                                    To: <span className="text-white font-bold">{reminderModal.pay?.student_name || 'Student'}</span>
                                    &nbsp;— {reminderModal.pay?.month} {reminderModal.pay?.year}
                                    &nbsp;— ₹{reminderModal.pay?.balance ?? reminderModal.pay?.amount}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSendReminder} className="space-y-5">
                            {/* UPI ID */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Smartphone className="w-3 h-3" /> UPI / PhonePe Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. name@paytm or 9876543210@upi"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-700 outline-none focus:border-amber-500 transition-colors text-sm"
                                    value={reminderModal.upi_id}
                                    onChange={e => setReminderModal(m => ({ ...m, upi_id: e.target.value }))}
                                />
                            </div>

                            {/* QR Upload */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <QrCode className="w-3 h-3" /> Upload QR Code Photo
                                </label>
                                <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all ${reminderModal.qrFile ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-amber-500/30 bg-slate-950/50'}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => setReminderModal(m => ({ ...m, qrFile: e.target.files[0] }))}
                                    />
                                    {reminderModal.qrFile ? (
                                        <div className="text-center">
                                            <QrCode className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                                            <p className="text-amber-400 font-extrabold text-xs">{reminderModal.qrFile.name}</p>
                                            <p className="text-slate-600 text-[9px] mt-0.5">Click to change</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <QrCode className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                                            <p className="text-slate-500 text-xs font-bold">Click to upload QR photo</p>
                                            <p className="text-slate-700 text-[9px] mt-0.5">PhonePe, GPay, Paytm QR — PNG, JPG</p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {/* Custom Message */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Additional Note (optional)</label>
                                <textarea
                                    rows="2"
                                    placeholder="e.g. Please pay before 15th to avoid late fee..."
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-700 outline-none focus:border-amber-500 transition-colors text-sm resize-none"
                                    value={reminderModal.message}
                                    onChange={e => setReminderModal(m => ({ ...m, message: e.target.value }))}
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setReminderModal(m => ({ ...m, show: false }))}
                                    className="flex-1 py-4 text-slate-500 font-bold hover:text-white transition-colors border border-white/5 rounded-2xl uppercase text-[10px] tracking-widest">
                                    Cancel
                                </button>
                                <button type="submit" disabled={reminderModal.sending}
                                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                                    {reminderModal.sending
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <><Send className="w-4 h-4" /> Send Reminder</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentUpload;
