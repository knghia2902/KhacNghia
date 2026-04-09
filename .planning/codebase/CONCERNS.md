# Concerns & Technical Debt

- **Monolithic Page Components**: `Docs.jsx` size is critically large (~109KB), while `Images.jsx` (~32KB), `Tools.jsx` (~20KB), and `Admin.jsx` (~18KB) are also notably bulky. This implies pages hold huge inline logic chunks, multiple nested elements, and potentially intermingled API interactions instead of delegating to smaller, reusable UI components. This restricts reusability and dramatically elevates maintenance cost.
- **Absence of Testing**: The absolute lack of a test suite introduces a high regression risk for every subsequent change. Features are heavily reliant on manual testing.
- **No Static Typing / TypeScript**: Being a purely ES-Modules JavaScript project, complex API responses and rich-editor states might lead to undetected runtime type errors or uncaught exceptions during integrations.
