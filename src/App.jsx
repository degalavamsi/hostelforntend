import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Layout from './components/Layout';
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import RegisterRequest from './pages/RegisterRequest';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import RoomManagement from './pages/RoomManagement';
import NoticeBoard from './pages/NoticeBoard';
import PaymentUpload from './pages/PaymentUpload';
import FoodMenu from './pages/FoodMenu';
import Profile from './pages/Profile';
import VisitorLog from './pages/VisitorLog';
import UtilitiesManagement from './pages/UtilitiesManagement';
import FacilitiesDashboard from './pages/FacilitiesDashboard';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.some(role => user.roles?.includes(role))) {
        return <Navigate to="/" />;
    }

    return children;
};

const AppContent = () => {
    const { user } = useAuth();
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register-request" element={<RegisterRequest />} />

                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/students" element={
                        <ProtectedRoute roles={['admin', 'manager']}>
                            <StudentList />
                        </ProtectedRoute>
                    } />
                    <Route path="/rooms" element={<RoomManagement />} />
                    <Route path="/payments" element={<PaymentUpload />} />
                    <Route path="/notices" element={<NoticeBoard />} />
                    <Route path="/menu" element={<FoodMenu />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/facilities" element={<FacilitiesDashboard />} />
                    <Route path="/utilities" element={
                        <ProtectedRoute roles={['admin', 'manager']}>
                            <UtilitiesManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="/visitors" element={<VisitorLog />} />
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {user && <Chatbot key={user.id} />}
        </>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
};

export default App;
