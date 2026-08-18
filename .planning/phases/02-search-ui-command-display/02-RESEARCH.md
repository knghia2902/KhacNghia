# Phase 2: Search UI & Command Display - Research

## 1. Domain Analysis

The objective of Phase 2 is to deliver the core user-facing experience of the Network Command Lookup tool. Network engineers need to quickly find, read, and copy specific device commands without having to recall the exact syntax for different vendors.

**Key Concepts:**
- **Omnisearch:** A central, debounced search bar triggered by `Ctrl+K` that accepts both command syntax and natural language intents (Vietnamese with/without diacritics).
- **Multi-facet Filters:** Filters for Vendor, Device Type, Category, and Favorites that intersect to narrow down results.
- **Command Details:** A sliding drawer that provides context, parameters, examples, and warnings without losing the user's place in the search results.
- **Clean Copy:** A one-click copy function that extracts just the executable command, stripping out any visual prompt characters (like `Switch#`).

## 2. Technical Approach

### 2.1 State & Data Fetching
- **State Management:** Use React `useState` for filter criteria (`query`, `vendorId`, `deviceSlug`, `categorySlug`, `favoritesOnly`). Use `useDebounce` hook (e.g., 250ms) on the search query before triggering the API call.
- **Data Fetching:** Call the Supabase RPC function `search_network_commands` with the debounced query and filter states:
  ```javascript
  const { data, error } = await supabase.rpc('search_network_commands', {
      p_query: debouncedQuery || null,
      p_vendor_id: selectedVendor || null,
      p_device_type_slug: selectedDeviceType || null,
      p_category_slug: selectedCategory || null,
      p_limit: 50,
      p_offset: 0
  });
  ```
- **Filter Metadata:** Fetch `vendors`, `device_types`, and `command_categories` from Supabase on component mount to populate the filter UI.

### 2.2 UI Components Breakdown
- **NetworkCommands Page (`/tools/network-commands`):** Main container managing state, fetching data, and rendering sub-components.
- **Omnisearch Bar:** An input field with a keyboard event listener for `Ctrl+K`. It should call `e.preventDefault()` to override browser defaults.
- **Filter Bar:** Horizontal scrollable row of chips (or Select dropdowns) to pick Vendor, Device Type, and Category.
- **CommandCard:** A grid item displaying `vendor.icon_name`, `vendor.badge_color`, `title_vi`, and a syntax snippet. It should indicate if `is_destructive` is true.
- **CommandDrawer:** A right-sliding fixed overlay (using `fixed right-0 top-0 h-full w-full max-w-md`) that receives the selected command object and displays full details (parameters table, examples JSON, warnings).
- **Toast Notifications:** A simple custom toast state to give feedback when a command is copied.

### 2.3 Copy Logic
The DB stores `full_syntax` separately from `prompt_mode`. To display, we can visually combine them (e.g., `<span className="opacity-50">{prompt_mode}</span> {full_syntax}`). For the copy button, we strictly copy the `full_syntax` string, ensuring no prompts are included.

## 3. Codebase Patterns

- **Routing:** Add `<Route path="/tools/network-commands" element={<NetworkCommands />} />` inside the Protected Routes in `src/App.jsx`.
- **Tool Launcher:** In `src/pages/Tools.jsx`, add a static or seeded tool object for "Network Command Lookup" that navigates to `/tools/network-commands` when launched.
- **Styling:** Use standard Tailwind v4 utility classes. For the drawer animation, use Tailwind transitions (`transition-transform duration-300 translate-x-full` to `translate-x-0`).
- **Icons:** Use `material-symbols-outlined` as per existing app conventions (e.g., `terminal`, `content_copy`, `warning`).
- **Contexts:** Utilize `useAuth()` to check login status (required for Favorites feature, though full favorites management might bridge into later updates, we can implement the UI toggle now).

## 4. Dependencies & Integration

- **Depends on:** Phase 1 (Database Foundation). The `search_network_commands` RPC must be active.
- **Integrates with:** 
  - `src/App.jsx` (New route)
  - `src/pages/Tools.jsx` (Launcher card)
  - `src/lib/supabaseClient.js` (API connection)
- **External Libraries:** No new libraries strictly required. Built-in React hooks and Tailwind CSS are sufficient.

## 5. Risks & Mitigations

- **Risk:** Keyboard shortcut `Ctrl+K` conflicts with browser URL bar focus.
  - **Mitigation:** Attach the event listener to `document` and use `event.preventDefault()` when `(event.ctrlKey || event.metaKey) && event.key === 'k'`.
- **Risk:** RPC performance degrades with many keystrokes.
  - **Mitigation:** Implement a strict debounce (e.g., 250-300ms) on the search input. Do not fire RPC on every keystroke.
- **Risk:** Dark/Light mode text legibility in syntax blocks.
  - **Mitigation:** Use semantic Tailwind colors with `dark:` variants (e.g., `bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100`) for the `<pre><code>` blocks.
- **Risk:** JSON fields (`parameters`, `examples`) might be null or missing keys.
  - **Mitigation:** Add safe fallback rendering (`examples?.length > 0 ? ... : null`).

## 6. Validation Architecture

To ensure the implementation meets requirements:
1. **Search & Filter (SRCH-01 to SRCH-07):** 
   - Type "VLAN", verify it finds Cisco and Aruba VLAN commands.
   - Type "cau hinh" (no diacritics), verify it matches "cấu hình".
   - Select "Fortinet" vendor filter, ensure only Fortinet commands appear.
   - Verify network requests in DevTools to confirm debounce is working.
2. **UI & Display (UI-01 to UI-06):**
   - Verify layout switches from 1 column on mobile to 2/3 columns on desktop.
   - Toggle Dark/Light mode globally; ensure cards, drawer, and syntax blocks adapt correctly.
   - Click a destructive command; verify a prominent red warning/badge appears in the UI.
   - Click "Copy" on a command; paste it into a notepad to confirm `prompt_mode` is excluded.

## RESEARCH COMPLETE
