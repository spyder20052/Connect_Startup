import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/fakeDB';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for demo user in URL parameter (?user=userId)
        const urlParams = new URLSearchParams(window.location.search);
        const demoUserId = urlParams.get('user');

        if (demoUserId) {
            // Demo mode: load user from fakeDB without authentication
            loadDemoUser(demoUserId);
        } else {
            // Normal mode: check localStorage for authenticated user
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    localStorage.removeItem('currentUser');
                }
            }
            setLoading(false);
        }
    }, []);

    const loadDemoUser = async (userId) => {
        try {
            const users = await db.getCollection('users');
            const demoUser = users.find(u => u.uid === userId || u.email === userId);

            if (demoUser) {
                console.log('🎭 Demo Mode Active:', demoUser.displayName, `(${demoUser.role})`);
                setUser(demoUser);
            } else {
                console.warn('⚠️ Demo user not found:', userId);
                setUser(null);
            }
        } catch (error) {
            console.error('Error loading demo user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const u = await db.login(email, password);
            setUser(u);
            localStorage.setItem('sc_current_user', JSON.stringify(u));
            return u;
        } catch (error) {
            throw error;
        }
    };

    const register = async (profile) => {
        try {
            const u = await db.register(profile);

            // If startuper with new startup, join sector group
            if (profile.role === 'startuper' && profile.startupId) {
                await db.joinGroup(u.uid, profile.sector);
            }

            // Don't auto-login until email is verified
            return u;
        } catch (error) {
            throw error;
        }
    };

    const verifyEmail = async (userId) => {
        try {
            const u = await db.verifyEmail(userId);
            setUser(u);
            localStorage.setItem('sc_current_user', JSON.stringify(u));
            return u;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('sc_current_user');
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('sc_current_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            verifyEmail,
            logout,
            updateUser,
            loading,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
