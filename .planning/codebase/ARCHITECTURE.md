# Architecture
- **Entry point**: `src/main.jsx` bridging to `src/App.jsx`.
- **Routing Structure**: Routed centrally in `App.jsx` using `react-router-dom`:
  - Contains unprotected base routes (`/`, `/docs`, `/tools`, `/gallery`, `/login`).
  - Contains a ProtectedRoute wrapper preventing unauthorized access to paths like `/admin`. Redirects unhandled traffic default to `/`.
- **Application Shell**: UI layout handling wraps around components. `components/layout/Layout.jsx`, `Dock.jsx`, and `Header.jsx` define structural presence.
- **Context Handling**:
  - Auth Component: State handles active session from Supabase, consumed app-wide via hooks in `src/context/AuthContext.jsx`.
  - Theme Component: Handles visual preferences (like dark mode toggles) globally (`src/context/ThemeContext.jsx`).
