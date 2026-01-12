import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for auth state on load
        const storedAuth = localStorage.getItem('isAdminAuthenticated');
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
            setUser({ email: 'khacnghia2902@gmail.com', role: 'admin' });
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Demo authentication logic
        if (email === 'khacnghia2902@gmail.com' && password === '123') {
            setIsAuthenticated(true);
            setUser({ email, role: 'admin' });
            localStorage.setItem('isAdminAuthenticated', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('isAdminAuthenticated');
    };

    const value = {
        isAuthenticated,
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
