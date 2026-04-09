# Conventions

- **Linting**: Uses ESLint (v9 flat config) defined in `eslint.config.js`. Uses React Hooks and React Refresh plugins. Enforces `no-unused-vars`.
- **State Management**: Context-based API via `src/context/` (e.g., `AuthContext.jsx`, `ThemeContext.jsx`) is used over global state managers (like Redux or Zustand). Local state via React `useState` hooks.
- **Styling**: Standard Tailwind utility classes injected across components.
- **Components Definition**: Functional React components utilizing hooks. Layouts and major UI shells are nested cleanly under `src/components/`.
