import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const { user } = useAuth();
    const [worldConfig, setWorldConfig] = useState({});
    const [worldZones, setWorldZones] = useState([]);
    const [worldObjects, setWorldObjects] = useState([]);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    const isAdmin = user?.email === 'khacnghia2902@gmail.com';

    const fetchWorldData = async () => {
        setLoadingSettings(true);
        try {
            // 1. Fetch world config (global environment)
            const targetUserId = isAdmin ? '00000000-0000-0000-0000-000000000000' : user?.id;

            let configQuery = null;
            if (targetUserId) {
                configQuery = supabase.from('world_config').select('config').eq('user_id', targetUserId).limit(1);
            }

            // 2. Fetch world zones (normalized table)
            let zonesQuery = supabase.from('world_zones').select('*').order('created_at', { ascending: true });

            // 3. Fetch world objects (models)
            let objectsQuery = supabase.from('world_objects').select('*');

            const [configRes, zonesRes, objectsRes] = await Promise.all([
                configQuery,
                zonesQuery,
                objectsQuery
            ]);

            if (configRes && configRes.error) console.error('Error fetching world config:', configRes.error.message);
            if (zonesRes.error) console.error('Error fetching world zones:', zonesRes.error.message);
            if (objectsRes.error) console.error('Error fetching world objects:', objectsRes.error.message);

            if (configRes && configRes.data && configRes.data.length > 0) {
                setWorldConfig(configRes.data[0].config || {});
            }

            if (zonesRes.data) {
                setWorldZones(zonesRes.data);
            }

            if (objectsRes.data) {
                setWorldObjects(objectsRes.data);
            }

        } catch (err) {
            console.error('Unexpected error fetching world data:', err);
        } finally {
            setLoadingSettings(false);
        }
    };

    useEffect(() => {
        fetchWorldData();
        // Reset edit mode if user logs out
        if (!user) {
            setIsEditMode(false);
        }
    }, [user]);

    const updateWorldConfig = async (newConfig) => {
        if (!user) return { success: false, error: new Error('User not logged in') };

        try {
            const updatedConfig = { ...worldConfig, ...newConfig };
            setWorldConfig(updatedConfig);

            const targetUserId = isAdmin ? '00000000-0000-0000-0000-000000000000' : user.id;

            const { error } = await supabase
                .from('world_config')
                .upsert(
                    { user_id: targetUserId, config: updatedConfig },
                    { onConflict: 'user_id' }
                );

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating world config:', error);
            return { success: false, error };
        }
    };

    const updateWorldZone = async (zoneData) => {
        try {
            const { data, error } = await supabase
                .from('world_zones')
                .upsert({
                    ...zoneData,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;

            // Sync local state
            setWorldZones(prev => prev.map(z => z.id === data[0].id ? data[0] : z));
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error updating world zone:', error);
            return { success: false, error };
        }
    };

    const addWorldZone = async (zoneData) => {
        try {
            const { data, error } = await supabase
                .from('world_zones')
                .insert([{
                    ...zoneData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            setWorldZones(prev => [...prev, data[0]]);
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error adding world zone:', error);
            return { success: false, error };
        }
    };

    const deleteWorldZone = async (id) => {
        try {
            const { error } = await supabase
                .from('world_zones')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setWorldZones(prev => prev.filter(z => z.id !== id));
            return { success: true };
        } catch (error) {
            console.error('Error deleting world zone:', error);
            return { success: false, error };
        }
    };

    const updateWorldObject = async (objectData) => {
        try {
            const { data, error } = await supabase
                .from('world_objects')
                .upsert({
                    ...objectData,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;

            // Refresh local state
            fetchWorldData();
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error updating world object:', error);
            return { success: false, error };
        }
    };

    const deleteWorldObject = async (id) => {
        try {
            const { error } = await supabase
                .from('world_objects')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setWorldObjects(prev => prev.filter(obj => obj.id !== id));
            return { success: true };
        } catch (error) {
            console.error('Error deleting world object:', error);
            return { success: false, error };
        }
    };

    return (
        <SettingsContext.Provider value={{
            worldConfig,
            updateWorldConfig,
            worldZones,
            updateWorldZone,
            addWorldZone,
            deleteWorldZone,
            worldObjects,
            updateWorldObject,
            deleteWorldObject,
            loadingSettings,
            isEditMode,
            setIsEditMode,
            isAdmin
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
