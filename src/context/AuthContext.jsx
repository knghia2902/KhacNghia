import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login error:', error.message);
            return false;
        }
        return true;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const updateProfile = async (displayName) => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: { display_name: displayName }
            });

            if (error) throw error;

            if (data.user) {
                setUser(data.user);
                return { success: true };
            }
        } catch (error) {
            console.error('Error updating profile:', error.message);
            return { success: false, error };
        }
    };

    const updatePassword = async (newPassword) => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating password:', error.message);
            return { success: false, error };
        }
    };

    const uploadAvatar = async (file) => {
        if (!user) return { success: false, error: new Error('User not authenticated') };
        
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;
            
            // Update local user state
            setUser(prev => ({
                 ...prev, 
                 user_metadata: { ...prev?.user_metadata, avatar_url: publicUrl }
            }));

            return { success: true, url: publicUrl };
        } catch (error) {
            console.error('Error uploading avatar:', error.message);
            return { success: false, error };
        }
    };

    const value = {
        isAuthenticated,
        user,
        login,
        logout,
        updateProfile,
        updatePassword,
        uploadAvatar,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
