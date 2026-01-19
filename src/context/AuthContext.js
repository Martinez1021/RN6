// Auth Context
// Manages authentication state across the app

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { getSession } from '../utils/secureStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [employee, setEmployee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Restore session on app start
    useEffect(() => {
        restoreSession();
    }, []);

    const restoreSession = async () => {
        try {
            setIsLoading(true);
            const session = await authService.restoreSession();

            if (session) {
                setUser({ uid: session.uid });
                setEmployee({
                    id: session.employeeId,
                    name: session.employeeName,
                });
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Session restoration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (url, db, email, password) => {
        setIsLoading(true);
        try {
            const result = await authService.login(url, db, email, password);

            setUser({ uid: result.uid });
            setEmployee(result.employee);
            setIsAuthenticated(true);

            return result;
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
            setEmployee(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        employee,
        isLoading,
        isAuthenticated,
        login,
        logout,
        restoreSession,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
