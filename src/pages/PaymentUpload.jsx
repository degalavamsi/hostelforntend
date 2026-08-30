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
                if (uploadRes && uploadRes.data && uploadRes.data.qr_url) {
                    qr_url = uploadRes.data.qr_url;
                }
            }
            const res = await api.post('/payments/generate-monthly-rent', {
                ...rentParams,
                upi_id: rentParams.upi_id,
                qr_url: qr_url
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
                <div>
                    <h1 className="text-2xl font-semibold text-main tracking-tight">
                        {isAdmin ? 'Payment Management' : 'Your Payments'}
                    </h1>
                    <p className="text-muted text-xs font-medium uppercase tracking-wider mt-1">
                        {isAdmin ? 'Verify receipts, update balances, and remind students.' : 'Upload monthly receipts and track your status.'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowRentModal(true)}
                        className="bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all text-sm"
                    >
                        <DollarSign className="w-5 h-5" /> Generate Rent
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {!isAdmin && (
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card-3d rounded-3xl p-8 space-y-6">
                            <h2 className="text-xl font-semibold text-main tracking-tight flex items-center gap-2">
                                <Upload className="w-5 h-5 text-primary" /> New Payment
                            </h2>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <select
                                    className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={paymentData.type || 'rent'}
                                    onChange={(e) => setPaymentData({ ...paymentData, type: e.target.value })}
                                >
                                    <option value="rent">Rent Payment</option>
                                    <option value="deposit">Security Deposit</option>
                                </select>
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={paymentData.month}
                                        onChange={(e) => setPaymentData({ ...paymentData, month: e.target.value })}
                                    >
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={paymentData.year}
                                        onChange={(e) => setPaymentData({ ...paymentData, year: e.target.value })}
                                    >
                                        {['2025', '2026', '2027'].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input
                                        type="number" placeholder="Amount" required
                                        className="w-full bg-app border border-border rounded-xl p-3.5 pl-11 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="border-2 border-dashed border-border bg-app rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file" required
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                    <div className="space-y-2">
                                        <CreditCard className="w-8 h-8 text-muted mx-auto" />
                                        <p className="text-muted text-sm font-medium">
                                            {file ? file.name : 'Choose receipt'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="submit" disabled={uploading}
                                    className="w-full bg-primary hover:opacity-90 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload Receipt'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className={`${isAdmin ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
                    <div className="card-3d rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-app border-b border-border">
                                        <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">Details</th>
                                        {isAdmin && <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">Student</th>}
                                        <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">Amount & Due</th>
                                        <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {payments.map((pay) => (
                                        <tr key={pay._id} className="hover:bg-app/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="text-main font-semibold text-sm">{pay.month} {pay.year}</p>
                                                <p className="text-muted text-[10px] mt-1 font-medium">Ref: {new Date(pay.created_at).toLocaleDateString()}</p>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4">
                                                    <p className="text-main font-semibold text-sm">
                                                        {pay.student_name || 'Unknown'}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        {pay.student_room && pay.student_room !== '—' && (
                                                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold tracking-tight">
                                                                Room {pay.student_room}
                                                            </span>
                                                        )}
                                                        {pay.student_bed && (
                                                            <span className="px-2 py-0.5 bg-border text-muted rounded text-[10px] font-bold tracking-tight">
                                                                Bed {pay.student_bed}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-xs w-28">
                                                        <span className="text-muted font-medium uppercase tracking-wider">Total</span>
                                                        <span className="text-main font-semibold">₹{pay.amount}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs w-28">
                                                        <span className="text-success font-medium uppercase tracking-wider">Paid</span>
                                                        <span className="text-success font-semibold">₹{pay.amount_paid || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] w-28 border-t border-border pt-1 mt-1">
                                                        <span className="text-danger font-medium uppercase tracking-wider">Bal</span>
                                                        <span className="text-danger font-semibold">₹{pay.balance !== undefined ? pay.balance : pay.amount}</span>
                                                    </div>
                                                    {pay.due_date && (
                                                        <p className="text-muted text-[10px] uppercase font-medium tracking-wider pt-1.5">
                                                            Due: {new Date(pay.due_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${pay.status === 'paid' ? 'bg-success/10 text-success' :
                                                    pay.status === 'partial' ? 'bg-primary/10 text-primary' :
                                                        pay.status === 'verified' ? 'bg-success/10 text-success' :
                                                            'bg-danger/10 text-danger'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${pay.status === 'paid' || pay.status === 'verified' ? 'bg-success' :
                                                        pay.status === 'partial' ? 'bg-primary' :
                                                            'bg-danger'
                                                        }`}></div>
                                                    {(pay.status === 'pending' && !pay.is_paid) ? 'UNPAID' : pay.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {pay.receipt_path && (
                                                        <a
                                                            href={`${import.meta.env.VITE_API_URL || '/api'}/uploads/receipts/${pay.receipt_path}`}
                                                            target="_blank" rel="noreferrer"
                                                            className="p-2 bg-app text-muted hover:text-main hover:bg-border rounded-lg transition-all"
                                                            title="View Receipt"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {isAdmin && (
                                                        <>
                                                            <button onClick={() => openStatusModal(pay)} className="p-2 bg-primary/10 text-primary hover:text-white hover:bg-primary rounded-lg transition-all" title="Update Status & Balance">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleRemind(pay)} className="p-2 bg-warning/10 text-warning hover:text-white hover:bg-warning rounded-lg transition-all" title="Send Payment Reminder with QR">
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
                        </div>
                        {payments.length === 0 && (
                            <div className="p-16 text-center">
                                <AlertCircle className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
                                <p className="text-muted font-medium text-sm">No payment records found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            {statusModal.show && (
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card-3d w-full max-w-sm rounded-3xl p-8 relative">
                        <button onClick={() => setStatusModal({ show: false, pay: null, amount_paid: '', status: 'pending' })} className="absolute top-6 right-6 text-muted hover:text-main bg-app p-2 rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-semibold text-main tracking-tight mb-2">Update <span className="text-primary">Status</span></h2>
                        <p className="text-muted text-xs font-medium mb-6">Modify the payment progress for {statusModal.pay?.student_name}.</p>
                        <form onSubmit={handleUpdateStatus} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Amount Paid (₹)</label>
                                <input type="number" required className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={statusModal.amount_paid} onChange={(e) => setStatusModal({ ...statusModal, amount_paid: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Status</label>
                                <select className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" value={statusModal.status} onChange={(e) => setStatusModal({ ...statusModal, status: e.target.value })}>
                                    <option value="unpaid">Unpaid</option>
                                    <option value="partial">Partial Payment</option>
                                    <option value="paid">Fully Paid</option>
                                    <option value="verified">Verified</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-primary hover:opacity-90 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all">Save Progress</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Rent Generation Modal */}
            {showRentModal && (
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card-3d rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col custom-scrollbar">
                        <div className="p-6 border-b border-border bg-app sticky top-0 z-10 rounded-t-3xl backdrop-blur flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-semibold text-main tracking-tight">Generate <span className="text-primary">Rent</span></h2>
                                <p className="text-muted text-[10px] uppercase tracking-wider font-medium mt-1">Create monthly rent records.</p>
                            </div>
                            <button onClick={() => setShowRentModal(false)} className="text-muted hover:text-main bg-border/50 p-2 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleGenerateRent} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Select Student</label>
                                <select
                                    className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Month</label>
                                    <select
                                        className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        value={rentParams.month}
                                        onChange={(e) => setRentParams({ ...rentParams, month: e.target.value })}
                                    >
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Year</label>
                                    <select
                                        className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        value={rentParams.year}
                                        onChange={(e) => setRentParams({ ...rentParams, year: e.target.value })}
                                    >
                                        {['2025', '2026', '2027'].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Amount (₹)</label>
                                <input
                                    type="number" required
                                    className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Total amount"
                                    value={rentParams.amount}
                                    onChange={(e) => setRentParams({ ...rentParams, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Due Date</label>
                                <input
                                    type="date" required
                                    className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={rentParams.due_date}
                                    onChange={(e) => setRentParams({ ...rentParams, due_date: e.target.value })}
                                />
                            </div>

                            {/* ── Payment Details for Notification ── */}
                            <div className="border-t border-border pt-5 space-y-4">
                                <p className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                    <Smartphone className="w-3.5 h-3.5" /> Payment Info for Notification (optional)
                                </p>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">UPI / PhonePe ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. hostel@paytm or 98765@upi"
                                        className="w-full bg-app border border-border rounded-xl p-3 text-main text-sm font-medium placeholder:text-muted/50 focus:border-warning focus:ring-2 focus:ring-warning/20 outline-none transition-all"
                                        value={rentParams.upi_id}
                                        onChange={e => setRentParams({ ...rentParams, upi_id: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                        <QrCode className="w-3.5 h-3.5" /> QR Code Photo
                                    </label>
                                    <label className={`flex items-center gap-3 w-full border border-dashed rounded-xl p-3.5 cursor-pointer transition-all ${rentQrFile ? 'border-warning/50 bg-warning/5' : 'border-border bg-app hover:border-warning/30'}`}>
                                        <input type="file" accept="image/*" className="hidden"
                                            onChange={e => { setRentQrFile(e.target.files[0]); setRentQrUrl(''); }} />
                                        <QrCode className={`w-5 h-5 ${rentQrFile ? 'text-warning' : 'text-muted'}`} />
                                        <span className={`text-xs font-medium ${rentQrFile ? 'text-warning' : 'text-muted'}`}>
                                            {rentQrFile ? rentQrFile.name : 'Click to upload QR photo (PhonePe, GPay, Paytm)'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button" onClick={() => setShowRentModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-medium text-muted hover:text-main bg-app hover:bg-border transition-all border border-border"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary hover:opacity-90 text-white rounded-xl font-medium shadow-lg shadow-primary/20 transition-all"
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
                <div className="fixed inset-0 bg-main/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card-3d w-full max-w-md rounded-3xl p-8 relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setReminderModal(m => ({ ...m, show: false }))} className="absolute top-6 right-6 text-muted hover:text-main bg-app p-2 rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-warning/10 rounded-xl text-warning">
                                <BellRing className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-main tracking-tight">Send Payment <span className="text-warning">Reminder</span></h2>
                                <p className="text-muted text-xs font-medium mt-0.5">
                                    To: <span className="text-main font-semibold">{reminderModal.pay?.student_name || 'Student'}</span>
                                    &nbsp;— {reminderModal.pay?.month} {reminderModal.pay?.year}
                                    &nbsp;— ₹{reminderModal.pay?.balance ?? reminderModal.pay?.amount}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSendReminder} className="space-y-5">
                            {/* UPI ID */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                    <Smartphone className="w-3.5 h-3.5" /> UPI / PhonePe Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. name@paytm or 9876543210@upi"
                                    className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium placeholder:text-muted/50 focus:border-warning focus:ring-2 focus:ring-warning/20 outline-none transition-all"
                                    value={reminderModal.upi_id}
                                    onChange={e => setReminderModal(m => ({ ...m, upi_id: e.target.value }))}
                                />
                            </div>

                            {/* QR Upload */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5 ml-1">
                                    <QrCode className="w-3.5 h-3.5" /> Upload QR Code Photo
                                </label>
                                <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all ${reminderModal.qrFile ? 'border-warning/50 bg-warning/5' : 'border-border bg-app hover:border-warning/30'}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => setReminderModal(m => ({ ...m, qrFile: e.target.files[0] }))}
                                    />
                                    {reminderModal.qrFile ? (
                                        <div className="text-center">
                                            <QrCode className="w-10 h-10 text-warning mx-auto mb-2" />
                                            <p className="text-warning font-semibold text-xs">{reminderModal.qrFile.name}</p>
                                            <p className="text-muted text-[10px] mt-1 font-medium">Click to change</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <QrCode className="w-10 h-10 text-muted mx-auto mb-2" />
                                            <p className="text-muted text-xs font-medium">Click to upload QR photo</p>
                                            <p className="text-muted/70 text-[10px] mt-1 font-medium">PhonePe, GPay, Paytm QR — PNG, JPG</p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {/* Custom Message */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Additional Note (optional)</label>
                                <textarea
                                    rows="2"
                                    placeholder="e.g. Please pay before 15th to avoid late fee..."
                                    className="w-full bg-app border border-border rounded-xl p-3.5 text-main text-sm font-medium placeholder:text-muted/50 focus:border-warning focus:ring-2 focus:ring-warning/20 outline-none transition-all resize-none"
                                    value={reminderModal.message}
                                    onChange={e => setReminderModal(m => ({ ...m, message: e.target.value }))}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setReminderModal(m => ({ ...m, show: false }))}
                                    className="flex-1 py-3 text-muted font-medium bg-app hover:bg-border hover:text-main transition-colors border border-border rounded-xl">
                                    Cancel
                                </button>
                                <button type="submit" disabled={reminderModal.sending}
                                    className="flex-1 bg-warning hover:opacity-90 text-white font-medium py-3 rounded-xl shadow-lg shadow-warning/20 transition-all flex items-center justify-center gap-2">
                                    {reminderModal.sending
                                        ? <Loader2 className="w-5 h-5 animate-spin" />
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
