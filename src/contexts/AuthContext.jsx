import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/fakeDB';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved user session
        const savedUser = localStorage.getItem('sc_current_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('sc_current_user');
            }
        }
        setLoading(false);
    }, []);

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
