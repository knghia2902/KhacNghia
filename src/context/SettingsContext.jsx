import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const { user } = useAuth();
    const [worldConfig, setWorldConfig] = useState({});
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) {
                setWorldConfig({});
                setLoadingSettings(false);
                return;
            }

            try {
                // Fetch world config
                const { data, error } = await supabase
                    .from('world_config')
                    .select('config')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 is row not found
                    console.error('Error fetching world config:', error.message);
                }

                if (data) {
                    setWorldConfig(data.config || {});
                } else {
                    // Create default if not found
                    const { data: newData, error: insertError } = await supabase
                        .from('world_config')
                        .insert([{ user_id: user.id, config: {} }])
                        .select()
                        .single();
                        
                    if (newData && !insertError) {
                        setWorldConfig(newData.config);
                    }
                }
            } catch (err) {
                 console.error('Unexpected error fetching settings:', err);
            } finally {
                setLoadingSettings(false);
            }
        };

        fetchSettings();
    }, [user]);

    const updateWorldConfig = async (newConfig) => {
        if (!user) return { success: false, error: new Error('User not logged in') };
        
        try {
            const updatedConfig = { ...worldConfig, ...newConfig };
            setWorldConfig(updatedConfig); // Optimistic UI update

            const { error } = await supabase
                .from('world_config')
                .upsert({ user_id: user.id, config: updatedConfig }, { onConflict: 'user_id' });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating world config:', error.message);
            // Optionally revert local state here
            return { success: false, error };
        }
    };

    return (
        <SettingsContext.Provider value={{ worldConfig, updateWorldConfig, loadingSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
