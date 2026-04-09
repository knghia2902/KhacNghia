# ARCHITECTURE

## Component Data Flow Context
The system retrieves folders and docs currently via client-side Supabase calls. 
- Component `Docs.jsx` handles state and loads documents probably all at once.
- Data fetching occurs on mount.
- If payload is massive, the JS thread locks up parsing JSON.

## Optimization Architecture
- **Layer 1: Network**: Fetch light items first (ID, Title, ParentId, Icon) for tree rendering. 
- **Layer 2: Detail Load**: Fetch full `content` only when a document is actively selected / focused.
- **Layer 3: UI Feedback**: Skeleton loaders while async connections resolve.
