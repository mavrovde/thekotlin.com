'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, UserResponse } from './api';

interface AuthContextType {
    user: UserResponse | null;
    token: string | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                setToken(savedToken);
                try {
                    const me = await api.getMe();
                    setUser(me);
                } catch {
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        const res = await api.login({ username, password });
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
    }, []);

    const register = useCallback(async (username: string, email: string, password: string, displayName?: string) => {
        const res = await api.register({ username, email, password, displayName });
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
