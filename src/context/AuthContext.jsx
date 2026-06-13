import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("DEBUG: Login Error Full Details:", error);
            console.log("DEBUG: Response Status:", error.response?.status);
            console.log("DEBUG: Response Data:", error.response?.data);
            return { success: false, message: error.response?.data?.msg || `Login failed (${error.message})` };
        }
    };

    const loginWithGoogle = async (googleToken) => {
        try {
            const response = await api.post('/auth/google-login', { token: googleToken });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("DEBUG: Google Login Error:", error);
            return { success: false, message: error.response?.data?.msg || `Google login failed (${error.message})` };
        }
    };

    const loginWithGitHub = async (code) => {
        try {
            const response = await api.post('/auth/github-login', { code });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("DEBUG: GitHub Login Error:", error);
            return { success: false, message: error.response?.data?.msg || `GitHub login failed (${error.message})` };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, loginWithGitHub, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

