# Project Structure
```
- /                       (Project root)
  - .planning/            (GSD planning documents)
  - public/               (Static assets)
  - src/                  (Source code)
    - components/         (Reusable UI components)
      - docs/             (Document related components e.g. MarkdownRenderer.jsx)
      - editor/           (Rich text and markdown editors e.g. RichTextEditor.jsx)
      - layout/           (Layout components e.g. Layout.jsx, Header.jsx, Dock.jsx)
    - context/            (React contexts e.g. AuthContext.jsx, ThemeContext.jsx)
    - lib/                (External libraries and integrations e.g. supabaseClient.js)
    - pages/              (Main routing pages: Admin.jsx, Docs.jsx, Home.jsx, Images.jsx, Landing.jsx, Login.jsx, Overview.jsx, Tools.jsx)
  - eslint.config.js      (Linting config)
  - package.json          (Dependencies)
  - tailwind.config.js    (Styling config)
  - vite.config.js        (Build tool config)
  - vercel.json           (Vercel deployment config)
```
