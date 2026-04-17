import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const { user } = useAuth();
    const [worldConfig, setWorldConfig] = useState({});
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch world config securely without single()
                let query = supabase.from('world_config').select('config').limit(1);
                
                if (user) {
                    query = query.eq('user_id', user.id);
                }

                const { data, error } = await query;

                if (error) { 
                    console.error('Error fetching world config:', error.message);
                }

                if (data && data.length > 0) {
                    setWorldConfig(data[0].config || {});
                } else {
                    // Create default if not found AND user is logged in
                    if (user) {
                        const { data: newData, error: insertError } = await supabase
                            .from('world_config')
                            .insert([{ user_id: user.id, config: {} }])
                            .select()
                            .limit(1);
                            
                        if (newData && newData.length > 0 && !insertError) {
                            setWorldConfig(newData[0].config);
                        }
                    } else {
                        setWorldConfig({});
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

            // Use order and limit(1) to avoid PGRST116 multiple rows error
            const { data: existingRows, error: selectError } = await supabase
                .from('world_config')
                .select('id')
                .eq('user_id', user.id)
                .limit(1);

            let error = selectError;
            
            if (!error) {
                if (existingRows && existingRows.length > 0) {
                    const res = await supabase.from('world_config').update({ config: updatedConfig }).eq('id', existingRows[0].id);
                    error = res.error;
                } else {
                    const res = await supabase.from('world_config').insert([{ user_id: user.id, config: updatedConfig }]);
                    error = res.error;
                }
            }

            if (error) {
                console.error("Supabase Save Error Details:", error);
                throw error;
            }
            return { success: true };
        } catch (error) {
            console.error('Error updating world config:', error.message || error);
            return { success: false, error };
        }
    };

    return (
        <SettingsContext.Provider value={{ worldConfig, updateWorldConfig, loadingSettings, isEditMode, setIsEditMode }}>
            {children}
        </SettingsContext.Provider>
    );
};
