# Phase 2: Search UI & Command Display - Pattern Mapping

**Phase:** 2 - Search UI & Command Display  
**Status:** Pattern Mapping Ready  
**Target Output File:** `.planning/phases/02-search-ui-command-display/02-PATTERNS.md`  

---

## 1. Overview & Architecture

Phase 2 builds the core frontend interface for the **Network Command Lookup Tool** embedded within the existing React + Vite + TailwindCSS application. The interface provides high-performance omnisearch (`Ctrl+K`), faceted multi-criteria filtering (Vendors, Device Types, Categories, Favorites), a responsive Command Card grid, a sliding Right Drawer for deep command inspection, and 1-click clean command copying.

### Component & File Mapping

| # | File Path | Role | Closest Analog | Key Pattern / Strategy |
|---|---|---|---|---|
| 1 | `src/App.jsx` | Routing | `src/App.jsx` | Nested Route under application shell |
| 2 | `src/pages/Tools.jsx` | Launcher Entry | `src/pages/Tools.jsx:INITIAL_TOOLS` | Launcher card with internal navigation support |
| 3 | `src/pages/NetworkCommands.jsx` | Page Container | `src/pages/Tools.jsx`, `src/pages/Images.jsx` | State coordination, header, search bar, grid & drawer |
| 4 | `src/hooks/useCommandSearch.js` | Data & State Hook | `src/hooks/useOnClickOutside.js`, `src/pages/Tools.jsx` | Debounced query, Supabase RPC fetch, metadata loading |
| 5 | `src/utils/commandUtils.js` | Helper Utilities | Pure JS module | Prompt sanitization, clipboard copy, vendor badge styling |
| 6 | `src/components/network-commands/SearchHeader.jsx` | Search Component | `src/pages/Tools.jsx:363-373` | Omnisearch input with `Ctrl+K` global keyboard trap |
| 7 | `src/components/network-commands/FilterBar.jsx` | Filter Component | `src/pages/Images.jsx:399-413` | Horizontal chip filters for Vendor, Device, Category, Fav |
| 8 | `src/components/network-commands/CommandCard.jsx` | Grid Item Component | `src/pages/Tools.jsx:77-122` | Card with vendor badge, prompt mode, copy button, star |
| 9 | `src/components/network-commands/CommandDrawer.jsx` | Drawer / Detail Sheet | `src/pages/Images.jsx:461-517`, `ReactDOM.createPortal` | Sliding right drawer with parameters, examples & warnings |
| 10 | `src/components/network-commands/Toast.jsx` | Feedback Component | `src/pages/Docs.jsx:419-438` | Ephemeral toast notification on copy success |

---

## 2. File-by-File Pattern Analysis & Concrete Excerpts

---

### 1. `src/App.jsx`
- **Role:** Application routing registry.
- **Analog:** Existing routing configuration in [App.jsx](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/App.jsx#L23-L47).
- **Pattern:** Register the new route `<Route path="/tools/network-commands" element={<NetworkCommands />} />` inside the `<Layout>` component so it inherits the global background gradient, dock, and header.

```jsx
// src/App.jsx pattern excerpt
import NetworkCommands from './pages/NetworkCommands';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="/docs" element={<Docs />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/network-commands" element={<NetworkCommands />} />
            <Route path="/gallery" element={<Images />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

---

### 2. `src/pages/Tools.jsx`
- **Role:** Tool launcher grid.
- **Analog:** [Tools.jsx](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Tools.jsx#L6-L39) and `handleLaunch` at [Tools.jsx:339-345](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Tools.jsx#L339-L345).
- **Pattern:** 
  1. Add a seeded/default tool item for Network Command Lookup.
  2. Enhance `handleLaunch` with `useNavigate()` so internal paths (e.g. starting with `/tools/`) navigate with React Router DOM rather than opening a new tab or falling back to an alert.

```jsx
// src/pages/Tools.jsx pattern excerpt
import { useNavigate } from 'react-router-dom';

const INITIAL_TOOLS = [
    {
        id: 'network-commands',
        title: "Network Command Lookup",
        desc: "Tra cứu cú pháp lệnh mạng đa hãng (Cisco, Fortinet, Juniper, MikroTik, Huawei...) kèm giải thích chi tiết.",
        icon: "terminal",
        iconBg: "bg-gradient-to-br from-primary to-secondary",
        link: "/tools/network-commands"
    },
    // ... other initial tools
];

// In Tools component:
const navigate = useNavigate();

const handleLaunch = (tool) => {
    if (tool.link && tool.link.startsWith('/')) {
        navigate(tool.link);
    } else if (tool.link && tool.link !== '#') {
        window.open(tool.link, '_blank');
    } else {
        alert(`Launching ${tool.title}... (No URL configured)`);
    }
};
```

---

### 3. `src/hooks/useCommandSearch.js`
- **Role:** Custom Hook isolating search state, debounce mechanism, metadata prefetching, and RPC query dispatching.
- **Analogs:** [useOnClickOutside.js](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/hooks/useOnClickOutside.js) & Supabase query patterns in [Tools.jsx](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Tools.jsx#L220-L255) and [AuthContext.jsx](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/context/AuthContext.jsx).
- **Pattern:**
  - Manages `query`, `debouncedQuery` (200-250ms delay), `selectedVendor`, `selectedDeviceType`, `selectedCategory`, `favoritesOnly`.
  - Fetches static metadata (`vendors`, `device_types`, `command_categories`) once on mount.
  - Calls Supabase RPC `search_network_commands` with parameterized inputs.
  - Handles authenticated favorites synchronization with `command_favorites` table.

```javascript
// src/hooks/useCommandSearch.js pattern
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
        async function fetchMetadata() {
            try {
                const [vendorsRes, devicesRes, catsRes] = await Promise.all([
                    supabase.from('vendors').select('*').order('display_order', { ascending: true }),
                    supabase.from('device_types').select('*').order('display_order', { ascending: true }),
                    supabase.from('command_categories').select('*').order('display_order', { ascending: true })
                ]);
                setMetadata({
                    vendors: vendorsRes.data || [],
                    deviceTypes: devicesRes.data || [],
                    categories: catsRes.data || []
                });
            } catch (err) {
                console.error('Error fetching filter metadata:', err);
            }
        }
        fetchMetadata();
    }, []);

    // 3. Fetch User Favorites
    const fetchFavorites = useCallback(async () => {
        if (!user) {
            setFavoriteIds(new Set());
            return;
        }
        const { data } = await supabase
            .from('command_favorites')
            .select('command_id')
            .eq('user_id', user.id);
        if (data) {
            setFavoriteIds(new Set(data.map(f => f.command_id)));
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
            setError(err.message);
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
            await supabase.from('command_favorites').delete().match({ user_id: user.id, command_id: commandId });
        } else {
            newSet.add(commandId);
            setFavoriteIds(newSet);
            await supabase.from('command_favorites').insert({ user_id: user.id, command_id: commandId });
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
```

---

### 4. `src/utils/commandUtils.js`
- **Role:** Pure utility helper functions for prompt sanitization, clipboard handling, and badge styling.
- **Pattern:**
  - Clean command syntax extraction: strips device CLI prompts (e.g. `Router(config)#`, `[Huawei]`, `<Huawei>`) before copying.
  - Fallback-safe clipboard copy with async navigator.clipboard API.
  - Vendor color and icon helper mapping.

```javascript
// src/utils/commandUtils.js
/**
 * Strips prompt mode / prefix from the command string to ensure clean execution.
 * @param {string} fullSyntax 
 * @param {string} promptMode 
 * @returns {string} Clean command string
 */
export function cleanCommandSyntax(fullSyntax, promptMode = '') {
    if (!fullSyntax) return '';
    let clean = fullSyntax.trim();

    // If promptMode is explicitly provided, strip it from the start if present
    if (promptMode && clean.startsWith(promptMode.trim())) {
        clean = clean.slice(promptMode.trim().length).trim();
    }

    // Common network prompts regex: e.g. "Switch(config)# ", "Router# ", "[Huawei] ", "user@host# "
    const promptRegex = /^([a-zA-Z0-9_\-\.\/]+(\([a-zA-Z0-9_\-\.\/]+\))?[#>$%\]]\s*)/;
    clean = clean.replace(promptRegex, '');

    return clean;
}

/**
 * Copies text to system clipboard with fallback support.
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
    if (!text) return false;
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (err) {
        console.warn('Navigator clipboard failed, attempting execCommand fallback', err);
    }

    // Fallback using textarea
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
    } catch (err) {
        console.error('Fallback copy failed:', err);
        return false;
    }
}

/**
 * Vendor badge color mapping
 */
export const VENDOR_THEMES = {
    cisco: { bg: '#005073', text: '#ffffff', label: 'Cisco' },
    fortinet: { bg: '#EE3124', text: '#ffffff', label: 'Fortinet' },
    juniper: { bg: '#84BD00', text: '#ffffff', label: 'Juniper' },
    palo_alto: { bg: '#FA582D', text: '#ffffff', label: 'Palo Alto' },
    mikrotik: { bg: '#222222', text: '#ffffff', label: 'MikroTik' },
    aruba_hpe: { bg: '#FF8300', text: '#ffffff', label: 'Aruba / HPE' },
    huawei: { bg: '#CF0A2C', text: '#ffffff', label: 'Huawei' }
};

export function getVendorStyle(vendor) {
    if (!vendor) return { bg: '#64748b', text: '#ffffff' };
    const slug = vendor.slug || '';
    if (VENDOR_THEMES[slug]) return VENDOR_THEMES[slug];
    return {
        bg: vendor.badge_color || '#005073',
        text: '#ffffff'
    };
}
```

---

### 5. `src/components/network-commands/SearchHeader.jsx`
- **Role:** Omnisearch input with keyboard shortcut capture (`Ctrl+K` or `/`), quick clear button, and result metrics.
- **Analogs:** Header search input in [Tools.jsx:363-373](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Tools.jsx#L363-L373) and [Images.jsx:377-386](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Images.jsx#L377-L386).
- **Pattern:**
  - Global `keydown` listener triggers input focus on `Ctrl+K` or `Cmd+K`.
  - Clear icon resets query instantly.
  - Interactive shortcut badge (`Ctrl K` / `⌘ K`).

```jsx
// src/components/network-commands/SearchHeader.jsx
import React, { useRef, useEffect } from 'react';

export default function SearchHeader({ query, setQuery, totalResults, loading }) {
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative w-full">
            <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-[#1d2624]/40 dark:text-white/40 text-[22px] pointer-events-none">
                    search
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm theo lệnh (show ip, vlan...), chức năng (đặt IP, cấu hình trunk), hoặc từ khóa..."
                    className="w-full pl-12 pr-28 py-3.5 bg-white/60 dark:bg-[#18181b]/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl text-base text-[#1d2624] dark:text-white placeholder:text-[#1d2624]/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
                />
                <div className="absolute right-3 flex items-center gap-2">
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 rounded-full text-[#1d2624]/40 dark:text-white/40 hover:text-[#1d2624] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            title="Xóa tìm kiếm"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    )}
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-semibold text-[#1d2624]/50 dark:text-white/50 bg-black/5 dark:bg-white/10 rounded-lg border border-black/10 dark:border-white/10">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
            </div>
            {/* Results counter badge */}
            <div className="flex items-center justify-between mt-2 px-1 text-xs text-[#1d2624]/60 dark:text-white/60">
                <span>
                    {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${totalResults} câu lệnh`}
                </span>
            </div>
        </div>
    );
}
```

---

### 6. `src/components/network-commands/FilterBar.jsx`
- **Role:** Faceted filter chips for Vendors, Device Types, Categories, and Favorites toggle.
- **Analog:** [Images.jsx:399-413](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Images.jsx#L399-L413).
- **Pattern:**
  - Multi-group chips with active states and visual vendor color pills.
  - Reset button shown when any filter is active.

```jsx
// src/components/network-commands/FilterBar.jsx
import React from 'react';
import { getVendorStyle } from '../../utils/commandUtils';

export default function FilterBar({
    metadata,
    selectedVendor,
    setSelectedVendor,
    selectedDeviceType,
    setSelectedDeviceType,
    selectedCategory,
    setSelectedCategory,
    favoritesOnly,
    setFavoritesOnly,
    hasActiveFilters,
    onReset
}) {
    const { vendors = [], deviceTypes = [], categories = [] } = metadata;

    return (
        <div className="flex flex-col gap-3 py-2">
            {/* Row 1: Vendors & Favorites Toggle */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                <button
                    onClick={() => setSelectedVendor(null)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedVendor === null
                            ? 'bg-[#1d2624] dark:bg-white text-white dark:text-black shadow-sm'
                            : 'bg-white/30 dark:bg-white/5 text-[#1d2624]/70 dark:text-white/70 hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                >
                    Tất cả hãng
                </button>
                {vendors.map((vendor) => {
                    const style = getVendorStyle(vendor);
                    const isSelected = selectedVendor === vendor.id;
                    return (
                        <button
                            key={vendor.id}
                            onClick={() => setSelectedVendor(isSelected ? null : vendor.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                                isSelected
                                    ? 'shadow-sm text-white'
                                    : 'bg-white/30 dark:bg-white/5 text-[#1d2624]/80 dark:text-white/80 border-transparent hover:bg-white/50'
                            }`}
                            style={isSelected ? { backgroundColor: style.bg, borderColor: style.bg } : {}}
                        >
                            <span className="size-2 rounded-full" style={{ backgroundColor: style.bg }}></span>
                            <span>{vendor.name}</span>
                        </button>
                    );
                })}

                <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1 shrink-0"></div>

                {/* Favorites Only Chip */}
                <button
                    onClick={() => setFavoritesOnly(!favoritesOnly)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        favoritesOnly
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-white/30 dark:bg-white/5 text-[#1d2624]/70 dark:text-white/70 hover:bg-white/50 dark:hover:bg-white/10'
                    }`}
                >
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    <span>Yêu thích</span>
                </button>
            </div>

            {/* Row 2: Device Types & Category Selectors */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                {/* Device Type Chips */}
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d2624]/40 dark:text-white/40 mr-1">
                    Thiết bị:
                </span>
                <button
                    onClick={() => setSelectedDeviceType(null)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        selectedDeviceType === null
                            ? 'bg-primary/20 text-primary-dark dark:text-primary font-bold'
                            : 'text-[#1d2624]/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                    Tất cả
                </button>
                {deviceTypes.map((dt) => {
                    const isSelected = selectedDeviceType === dt.slug;
                    return (
                        <button
                            key={dt.id}
                            onClick={() => setSelectedDeviceType(isSelected ? null : dt.slug)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                                isSelected
                                    ? 'bg-primary/20 text-primary-dark dark:text-primary font-bold ring-1 ring-primary/30'
                                    : 'text-[#1d2624]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[14px]">{dt.icon_name || 'devices'}</span>
                            <span>{dt.name}</span>
                        </button>
                    );
                })}

                <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1 shrink-0"></div>

                {/* Category Dropdown / Filter */}
                <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="px-3 py-1 bg-white/40 dark:bg-[#18181b]/60 border border-black/10 dark:border-white/10 rounded-lg text-xs text-[#1d2624] dark:text-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                            {cat.name_vi}
                        </option>
                    ))}
                </select>

                {/* Reset Filters button */}
                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg font-medium transition-colors ml-auto"
                        title="Xóa tất cả bộ lọc"
                    >
                        <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
                        <span>Đặt lại</span>
                    </button>
                )}
            </div>
        </div>
    );
}
```

---

### 7. `src/components/network-commands/CommandCard.jsx`
- **Role:** Interactive search result card.
- **Analogs:** [ToolCard in Tools.jsx](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Tools.jsx#L77-L122) and image cards in [Images.jsx:418-450](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Images.jsx#L418-L450).
- **Pattern:**
  - Vendor color badge + device type tags.
  - Warning tag if `is_destructive` is true.
  - Code syntax container with prompt mode (`Switch(config)#`) styled subtly in low contrast.
  - 1-Click Copy button copying `cleanCommandSyntax(command.full_syntax || command.command_syntax, command.prompt_mode)`.
  - Favorite star toggle with authenticated feedback.

```jsx
// src/components/network-commands/CommandCard.jsx
import React from 'react';
import { getVendorStyle, cleanCommandSyntax } from '../../utils/commandUtils';

export default function CommandCard({ command, isFavorite, onToggleFavorite, onSelect, onCopy }) {
    const vendorStyle = getVendorStyle(command.vendor);
    const syntaxToCopy = cleanCommandSyntax(command.full_syntax || command.command_syntax, command.prompt_mode);

    const handleCopy = (e) => {
        e.stopPropagation();
        onCopy(syntaxToCopy);
    };

    const handleFavorite = (e) => {
        e.stopPropagation();
        onToggleFavorite(command.id);
    };

    return (
        <div
            onClick={() => onSelect(command)}
            className="group relative flex flex-col p-5 bg-white/50 dark:bg-[#18181b]/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl hover:bg-white/70 dark:hover:bg-[#18181b]/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
        >
            {/* Header: Vendor Badge, Devices & Actions */}
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Vendor Badge */}
                    <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: vendorStyle.bg }}
                    >
                        {command.vendor?.name}
                    </span>

                    {/* OS Flavor */}
                    {command.os_flavor && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/5 dark:bg-white/5 text-[#1d2624]/60 dark:text-white/60">
                            {command.os_flavor}
                        </span>
                    )}

                    {/* Destructive Warning Badge */}
                    {command.is_destructive && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                            <span className="material-symbols-outlined text-[12px]">warning</span>
                            Nguy hiểm
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {/* Favorite Button */}
                    <button
                        onClick={handleFavorite}
                        className={`p-1.5 rounded-lg transition-colors ${
                            isFavorite
                                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                : 'text-[#1d2624]/30 dark:text-white/30 hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        title={isFavorite ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {isFavorite ? 'star' : 'star_border'}
                        </span>
                    </button>

                    {/* Quick Copy Button */}
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg text-[#1d2624]/50 dark:text-white/50 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Copy lệnh sạch"
                    >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                </div>
            </div>

            {/* Title & Description */}
            <div className="mb-3">
                <h3 className="text-base font-bold text-[#1d2624] dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                    {command.title_vi}
                </h3>
                <p className="text-xs text-[#1d2624]/60 dark:text-white/60 mt-1 line-clamp-2">
                    {command.description_vi}
                </p>
            </div>

            {/* Code Syntax Box */}
            <div className="mt-auto">
                <div className="p-2.5 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto custom-scrollbar flex items-center justify-between gap-2 border border-black/20">
                    <code className="truncate">
                        {command.prompt_mode && (
                            <span className="text-gray-500 select-none mr-1.5 font-medium">{command.prompt_mode}</span>
                        )}
                        <span className="text-emerald-400">{command.full_syntax || command.command_syntax}</span>
                    </code>
                </div>
            </div>
        </div>
    );
}
```

---

### 8. `src/components/network-commands/CommandDrawer.jsx`
- **Role:** Right sliding detail sheet / drawer rendered via `ReactDOM.createPortal`.
- **Analogs:** [ConfirmModal / Modals in Tools.jsx](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Tools.jsx#L41-L75) and Image detail modal in [Images.jsx:461-517](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Images.jsx#L461-L517).
- **Pattern:**
  - Fixed right slide-over panel with smooth Tailwind transition.
  - Pressing `Esc` or clicking backdrop closes drawer.
  - Complete command breakdown: Parameters JSONB table, Examples JSONB blocks, Verification commands, Rollback commands, and Safety notes.

```jsx
// src/components/network-commands/CommandDrawer.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getVendorStyle, cleanCommandSyntax } from '../../utils/commandUtils';

export default function CommandDrawer({ command, isOpen, onClose, onCopy, isFavorite, onToggleFavorite }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !command) return null;

    const vendorStyle = getVendorStyle(command.vendor);
    const cleanCmd = cleanCommandSyntax(command.full_syntax || command.command_syntax, command.prompt_mode);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[250] flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-[fadeIn_0.2s_ease-out]"
                onClick={onClose}
            />

            {/* Sliding Drawer Container */}
            <div className="relative w-full max-w-2xl h-full bg-[#fcfdfd] dark:bg-[#141a18] shadow-2xl border-l border-white/20 dark:border-white/10 flex flex-col z-10 animate-[slideLeft_0.25s_ease-out] overflow-hidden">
                {/* Header */}
                <div className="shrink-0 p-6 border-b border-black/10 dark:border-white/10 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className="px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                                style={{ backgroundColor: vendorStyle.bg }}
                            >
                                {command.vendor?.name}
                            </span>
                            {command.os_flavor && (
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-black/5 dark:bg-white/10 text-[#1d2624]/70 dark:text-white/70">
                                    {command.os_flavor}
                                </span>
                            )}
                            {command.is_destructive && (
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                                    Cảnh báo tác động
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-[#1d2624] dark:text-white font-display">
                            {command.title_vi}
                        </h2>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onToggleFavorite(command.id)}
                            className={`p-2 rounded-xl transition-colors ${
                                isFavorite
                                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
                                    : 'text-[#1d2624]/40 dark:text-white/40 hover:text-amber-500 hover:bg-black/5'
                            }`}
                            title="Lưu yêu thích"
                        >
                            <span className="material-symbols-outlined text-[22px]">
                                {isFavorite ? 'star' : 'star_border'}
                            </span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-[#1d2624]/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[22px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* Primary Syntax Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60">
                                Cú pháp câu lệnh ({command.prompt_mode || 'CLI Mode'})
                            </span>
                            <button
                                onClick={() => onCopy(cleanCmd)}
                                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                Copy lệnh thực thi
                            </button>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-900 text-gray-100 font-mono text-sm border border-black/20 relative group">
                            {command.prompt_mode && (
                                <span className="text-gray-500 select-none block mb-1 text-xs">
                                    Prompt: {command.prompt_mode}
                                </span>
                            )}
                            <code className="text-emerald-400 font-bold break-all">
                                {command.full_syntax || command.command_syntax}
                            </code>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">
                            Mô tả chi tiết
                        </h4>
                        <p className="text-sm text-[#1d2624]/80 dark:text-white/80 leading-relaxed">
                            {command.description_vi}
                        </p>
                    </div>

                    {/* Parameters Table */}
                    {command.parameters && Array.isArray(command.parameters) && command.parameters.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">
                                Danh sách tham số (Parameters)
                            </h4>
                            <div className="overflow-hidden border border-black/10 dark:border-white/10 rounded-xl">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-black/5 dark:bg-white/5 text-[#1d2624]/70 dark:text-white/70">
                                        <tr>
                                            <th className="p-2.5 font-bold">Tham số</th>
                                            <th className="p-2.5 font-bold">Kiểu</th>
                                            <th className="p-2.5 font-bold">Mô tả</th>
                                            <th className="p-2.5 font-bold">Mặc định</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                        {command.parameters.map((param, idx) => (
                                            <tr key={idx} className="hover:bg-black/2 dark:hover:bg-white/2">
                                                <td className="p-2.5 font-mono font-bold text-primary">{param.name}</td>
                                                <td className="p-2.5 text-[#1d2624]/60 dark:text-white/60">{param.type || 'string'}</td>
                                                <td className="p-2.5 text-[#1d2624]/80 dark:text-white/80">{param.description_vi}</td>
                                                <td className="p-2.5 font-mono text-[#1d2624]/50 dark:text-white/50">{param.default_value || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Practical Examples */}
                    {command.examples && Array.isArray(command.examples) && command.examples.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 mb-2">
                                Ví dụ thực tế
                            </h4>
                            <div className="space-y-3">
                                {command.examples.map((ex, idx) => (
                                    <div key={idx} className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                        <div className="text-xs font-bold text-[#1d2624] dark:text-white mb-1.5 flex items-center justify-between">
                                            <span>{ex.scenario_vi || `Ví dụ ${idx + 1}`}</span>
                                            {ex.command && (
                                                <button
                                                    onClick={() => onCopy(cleanCommandSyntax(ex.command))}
                                                    className="text-primary hover:text-primary-dark text-[11px] font-semibold flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">content_copy</span>
                                                    Copy
                                                </button>
                                            )}
                                        </div>
                                        {ex.command && (
                                            <div className="p-2 rounded-lg bg-gray-900 text-emerald-400 font-mono text-xs">
                                                {ex.command}
                                            </div>
                                        )}
                                        {ex.output_sample && (
                                            <pre className="mt-2 p-2 rounded-lg bg-black/20 dark:bg-black/50 text-gray-300 font-mono text-[11px] overflow-x-auto">
                                                {ex.output_sample}
                                            </pre>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Safety Warnings & Commit Requirements */}
                    {(command.is_destructive || command.requires_commit || (command.warnings && command.warnings.length > 0)) && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                            <div className="flex items-center gap-2 font-bold text-xs mb-2">
                                <span className="material-symbols-outlined text-[18px] text-amber-500">warning</span>
                                <span>Lưu ý an toàn & Vận hành</span>
                            </div>
                            <ul className="text-xs space-y-1 list-disc list-inside opacity-90">
                                {command.requires_commit && (
                                    <li>Lệnh yêu cầu thực hiện <span className="font-mono font-bold">commit</span> để có hiệu lực.</li>
                                )}
                                {command.is_destructive && (
                                    <li className="font-bold text-red-600 dark:text-red-400">
                                        Lệnh có khả năng làm gián đoạn kết nối hoặc xóa cấu hình.
                                    </li>
                                )}
                                {Array.isArray(command.warnings) && command.warnings.map((w, i) => (
                                    <li key={i}>{typeof w === 'string' ? w : w.message_vi}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Verification & Rollback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {command.verification_command && (
                            <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 block mb-1.5">
                                    Lệnh kiểm tra (Verify)
                                </span>
                                <div className="p-2 rounded-lg bg-gray-900 text-cyan-400 font-mono text-xs flex justify-between items-center">
                                    <code className="truncate">{command.verification_command}</code>
                                    <button
                                        onClick={() => onCopy(cleanCommandSyntax(command.verification_command))}
                                        className="text-white/50 hover:text-white ml-2"
                                        title="Copy"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        {command.rollback_command && (
                            <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d2624]/60 dark:text-white/60 block mb-1.5">
                                    Lệnh hoàn tác (Rollback)
                                </span>
                                <div className="p-2 rounded-lg bg-gray-900 text-rose-400 font-mono text-xs flex justify-between items-center">
                                    <code className="truncate">{command.rollback_command}</code>
                                    <button
                                        onClick={() => onCopy(cleanCommandSyntax(command.rollback_command))}
                                        className="text-white/50 hover:text-white ml-2"
                                        title="Copy"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="shrink-0 p-4 border-t border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 text-[#1d2624]/70 dark:text-white/70 font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={() => onCopy(cleanCmd)}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        Copy câu lệnh
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
```

---

### 9. `src/components/network-commands/Toast.jsx`
- **Role:** Copy feedback notification toast.
- **Analog:** [Toast component in Docs.jsx:419-438](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Docs.jsx#L419-L438).
- **Pattern:** Fixed portal / overlay with timer auto-dismiss.

```jsx
// src/components/network-commands/Toast.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function Toast({ message, isVisible, onClose }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 2500);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return ReactDOM.createPortal(
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] animate-[slideUp_0.2s_ease-out]">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#1d2624] dark:bg-white text-white dark:text-[#1d2624] rounded-2xl shadow-2xl border border-white/10 text-xs font-bold">
                <span className="material-symbols-outlined text-green-400 dark:text-green-600 text-[18px]">check_circle</span>
                <span>{message}</span>
            </div>
        </div>,
        document.body
    );
}
```

---

### 10. `src/pages/NetworkCommands.jsx`
- **Role:** Main page orchestrator connecting hooks, header, filter bar, cards grid, drawer, and feedback toast.
- **Analogs:** [Tools.jsx](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Tools.jsx) and [Images.jsx](file:///C:/Users/O5A00001315/Desktop/KhacNghia/src/pages/Images.jsx).
- **Pattern:**
  - Back navigation button `<Link to="/tools">` and Breadcrumb trail.
  - Loading skeleton & Empty state views.
  - Toast trigger when copying syntax.

```jsx
// src/pages/NetworkCommands.jsx pattern blueprint
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommandSearch } from '../hooks/useCommandSearch';
import { copyToClipboard } from '../utils/commandUtils';
import SearchHeader from '../components/network-commands/SearchHeader';
import FilterBar from '../components/network-commands/FilterBar';
import CommandCard from '../components/network-commands/CommandCard';
import CommandDrawer from '../components/network-commands/CommandDrawer';
import Toast from '../components/network-commands/Toast';

export default function NetworkCommands() {
    const {
        query,
        setQuery,
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
        resetFilters
    } = useCommandSearch();

    const [selectedCommand, setSelectedCommand] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);

    const handleCopy = async (text) => {
        const success = await copyToClipboard(text);
        if (success) {
            setToastMessage('Đã copy câu lệnh vào clipboard!');
            setIsToastVisible(true);
        }
    };

    const handleToggleFavorite = async (commandId) => {
        const res = await toggleFavorite(commandId);
        if (res?.error) {
            setToastMessage(res.error);
            setIsToastVisible(true);
        }
    };

    const hasActiveFilters = Boolean(
        query || selectedVendor || selectedDeviceType || selectedCategory || favoritesOnly
    );

    return (
        <div className="flex flex-col w-full h-full relative">
            {/* Top Navigation & Breadcrumbs */}
            <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-8 pt-6 pb-3 border-b border-white/20 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <Link
                        to="/tools"
                        className="size-10 rounded-2xl bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 flex items-center justify-center text-[#1d2624] dark:text-white transition-all shadow-xs"
                        title="Quay lại danh sách Tools"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#1d2624]/50 dark:text-white/50">
                            <Link to="/tools" className="hover:underline">Tools</Link>
                            <span>/</span>
                            <span className="text-[#1d2624]/80 dark:text-white/80 font-bold">Network Commands</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1d2624] dark:text-white tracking-tight">
                            Tra cứu <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Lệnh Mạng</span>
                        </h1>
                    </div>
                </div>

                <div className="w-full md:w-96">
                    <SearchHeader
                        query={query}
                        setQuery={setQuery}
                        totalResults={commands.length}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Filter Bar */}
            <div className="shrink-0 px-8 pt-2 border-b border-white/10 dark:border-white/5">
                <FilterBar
                    metadata={metadata}
                    selectedVendor={selectedVendor}
                    setSelectedVendor={setSelectedVendor}
                    selectedDeviceType={selectedDeviceType}
                    setSelectedDeviceType={setSelectedDeviceType}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    favoritesOnly={favoritesOnly}
                    setFavoritesOnly={setFavoritesOnly}
                    hasActiveFilters={hasActiveFilters}
                    onReset={resetFilters}
                />
            </div>

            {/* Main Command Grid Container */}
            <div className="flex-1 overflow-y-auto px-8 pt-6 pb-32 custom-scrollbar">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-44 rounded-2xl bg-white/20 dark:bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                        <p className="text-sm font-medium text-red-500">Lỗi tải dữ liệu: {error}</p>
                    </div>
                ) : commands.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="material-symbols-outlined text-4xl text-[#1d2624]/20 dark:text-white/20 mb-3">search_off</span>
                        <h3 className="text-base font-bold text-[#1d2624]/60 dark:text-white/60">Không tìm thấy câu lệnh phù hợp</h3>
                        <p className="text-xs text-[#1d2624]/40 dark:text-white/40 mt-1 max-w-sm">
                            Thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn một số bộ lọc hãng/thiết bị.
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary-dark dark:text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {commands.map((cmd) => (
                            <CommandCard
                                key={cmd.id}
                                command={cmd}
                                isFavorite={favoriteIds.has(cmd.id)}
                                onToggleFavorite={handleToggleFavorite}
                                onSelect={setSelectedCommand}
                                onCopy={handleCopy}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Sliding Drawer */}
            <CommandDrawer
                command={selectedCommand}
                isOpen={Boolean(selectedCommand)}
                onClose={() => setSelectedCommand(null)}
                onCopy={handleCopy}
                isFavorite={selectedCommand ? favoriteIds.has(selectedCommand.id) : false}
                onToggleFavorite={handleToggleFavorite}
            />

            {/* Feedback Toast */}
            <Toast
                message={toastMessage}
                isVisible={isToastVisible}
                onClose={() => setIsToastVisible(false)}
            />
        </div>
    );
}
```

---

## 3. Data Flow Diagram

```mermaid
graph TD
    User([User Action / Omnisearch / Filters]) -->|Type Query / Select Chips| Hook[useCommandSearch]
    Hook -->|Debounce 200ms| RPC[Supabase search_network_commands]
    RPC -->|Return Ranked Results| Hook
    Hook -->|Populate commands state| Page[NetworkCommands.jsx]
    
    Page --> SearchHeader[SearchHeader.jsx (Ctrl+K)]
    Page --> FilterBar[FilterBar.jsx (Vendor/Device/Category/Fav)]
    Page --> Grid[CommandCard.jsx Grid]
    
    Grid -->|Click Card| Drawer[CommandDrawer.jsx (Sliding Sheet)]
    Grid -->|Click Copy| Utils[commandUtils.cleanCommandSyntax]
    Drawer -->|Click Copy| Utils
    
    Utils -->|Write to Clipboard| Toast[Toast.jsx (Feedback)]
    Grid -->|Click Star| FavAction[command_favorites Sync]
    Drawer -->|Click Star| FavAction
```

---

## 4. Key Design Patterns & Guidelines

1. **Clean Syntax Sanitization:**
   - Prepend prompt visualization (`Switch(config)#`) in UI for clarity, but strictly strip prompt tokens when copying so network engineers get execution-ready commands.
2. **Keyboard Accessibility:**
   - Support `Ctrl+K` and `Cmd+K` globally to focus the Omnisearch bar.
   - Support `Esc` to dismiss modals and the Command Drawer.
3. **No Unused Vars & ESLint Compliance:**
   - Adhere to flat ESLint v9 configuration with clean variable declarations and React Refresh compatibility.
4. **Theming & Responsiveness:**
   - Use semantic Tailwind CSS utility classes with `dark:` variants (`bg-white/50 dark:bg-[#18181b]/50`).
   - Use standard Google Material Symbols font names (`material-symbols-outlined`).

---

## PATTERN MAPPING COMPLETE
