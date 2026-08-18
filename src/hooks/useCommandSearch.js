import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useCommandSearch() {
    const { user, isAuthenticated } = useAuth();

    // Search & Filter State
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedDeviceType, setSelectedDeviceType] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [favoritesOnly, setFavoritesOnly] = useState(false);

    // Results & Metadata State
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metadata, setMetadata] = useState({
        vendors: [],
        deviceTypes: [],
        categories: []
    });
    const [favoriteIds, setFavoriteIds] = useState(new Set());

    // 1. Debounce Query (200ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 200);
        return () => clearTimeout(timer);
    }, [query]);

    // 2. Fetch Metadata on Mount
    useEffect(() => {
        let isMounted = true;
        async function fetchMetadata() {
            try {
                const [vendorsRes, devicesRes, catsRes] = await Promise.all([
                    supabase.from('vendors').select('*').order('display_order', { ascending: true }),
                    supabase.from('device_types').select('*').order('display_order', { ascending: true }),
                    supabase.from('command_categories').select('*').order('display_order', { ascending: true })
                ]);

                if (isMounted) {
                    setMetadata({
                        vendors: vendorsRes.data || [],
                        deviceTypes: devicesRes.data || [],
                        categories: catsRes.data || []
                    });
                }
            } catch (err) {
                console.error('Error fetching filter metadata:', err);
            }
        }
        fetchMetadata();
        return () => {
            isMounted = false;
        };
    }, []);

    // 3. Fetch User Favorites
    const fetchFavorites = useCallback(async () => {
        if (!user) {
            setFavoriteIds(new Set());
            return;
        }
        try {
            const { data, error: favError } = await supabase
                .from('command_favorites')
                .select('command_id')
                .eq('user_id', user.id);

            if (favError) {
                console.error('Error fetching favorites:', favError);
                return;
            }

            if (data) {
                setFavoriteIds(new Set(data.map(f => f.command_id)));
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
        }
    }, [user]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    // 4. Execute RPC Search
    const searchCommands = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: rpcError } = await supabase.rpc('search_network_commands', {
                p_query: debouncedQuery.trim() || null,
                p_vendor_id: selectedVendor || null,
                p_device_type_slug: selectedDeviceType || null,
                p_category_slug: selectedCategory || null,
                p_limit: 50,
                p_offset: 0
            });

            if (rpcError) throw rpcError;

            let results = data || [];
            if (favoritesOnly) {
                results = results.filter(cmd => favoriteIds.has(cmd.id));
            }
            setCommands(results);
        } catch (err) {
            console.error('Search RPC error:', err);
            setError(err.message || 'Không thể tìm kiếm lệnh mạng.');
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, selectedVendor, selectedDeviceType, selectedCategory, favoritesOnly, favoriteIds]);

    useEffect(() => {
        searchCommands();
    }, [searchCommands]);

    // 5. Toggle Favorite Action
    const toggleFavorite = async (commandId) => {
        if (!isAuthenticated || !user) {
            return { error: 'Vui lòng đăng nhập để lưu lệnh yêu thích.' };
        }
        const isFav = favoriteIds.has(commandId);
        const newSet = new Set(favoriteIds);

        if (isFav) {
            newSet.delete(commandId);
            setFavoriteIds(newSet);
            const { error: delError } = await supabase
                .from('command_favorites')
                .delete()
                .match({ user_id: user.id, command_id: commandId });
            if (delError) {
                console.error('Error removing favorite:', delError);
                fetchFavorites();
                return { error: 'Lỗi khi bỏ yêu thích.' };
            }
        } else {
            newSet.add(commandId);
            setFavoriteIds(newSet);
            const { error: insError } = await supabase
                .from('command_favorites')
                .insert({ user_id: user.id, command_id: commandId });
            if (insError) {
                console.error('Error adding favorite:', insError);
                fetchFavorites();
                return { error: 'Lỗi khi lưu yêu thích.' };
            }
        }
        return { success: true, isFavorite: !isFav };
    };

    const resetFilters = () => {
        setQuery('');
        setSelectedVendor(null);
        setSelectedDeviceType(null);
        setSelectedCategory(null);
        setFavoritesOnly(false);
    };

    return {
        query,
        setQuery,
        debouncedQuery,
        selectedVendor,
        setSelectedVendor,
        selectedDeviceType,
        setSelectedDeviceType,
        selectedCategory,
        setSelectedCategory,
        favoritesOnly,
        setFavoritesOnly,
        commands,
        loading,
        error,
        metadata,
        favoriteIds,
        toggleFavorite,
        resetFilters,
        refresh: searchCommands
    };
}
