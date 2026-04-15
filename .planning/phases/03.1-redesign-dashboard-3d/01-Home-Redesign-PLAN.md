---
wave: 1
depends_on: []
files_modified:
  - "src/pages/Home.jsx"
  - "src/isometric.css"
autonomous: true
requirements: []
---

# Plan 01: Interactive 3D Digital Atrium (Home Redesign)

## Objective
Convert `Home.jsx` from a standard 2D landing page into a 3D isometric navigation hub, featuring CSS-based hologram pedestals representing the 4 main modules (Docs, Tools, Gallery, Admin) and implementing a walk-to-navigate system for the Chibi Agent.

## Step 1: Base Isometric Layout & CSS Holograms
Create the `fixed inset-0` isometric world in `Home.jsx` and the CSS for hologram pedestals in `isometric.css`.

<read_first>
- `src/pages/Home.jsx`
- `src/isometric.css`
</read_first>

<action>
1. In `src/isometric.css`:
   - Append new classes for CSS 3D pedestals: `.cyber-pedestal`, `.hologram-text`, `.zone-active`.
   - `.cyber-pedestal` should be a `div` element designed like a glowing futuristic pad using `preserve-3d`, with a pulsing box-shadow and cyan/teal borders.
   - `.hologram-text` should float above the pedestal with `translateZ` and floating animation.

2. In `src/pages/Home.jsx`:
   - Delete all the existing 2D markup (`Landing` content).
   - Change component export to `const Home = () => { ... }`.
   - Implement the `<div id="isometric-view" className="fixed inset-0 flex items-center justify-center z-0">` container, mirroring the base setup of `Docs.jsx`.
   - Put a `<div id="isometric-world" className="isometric-world w-[700px] h-[700px] relative">` inside.
   - Inside the grid, render exactly 4 `div.cyber-pedestal` zones positioned at 4 symmetrical corners (using top/left relative positioning). Label them: `[DOCS]`, `[TOOLS]`, `[GALLERY]`, `[ADMIN]`.
</action>

<acceptance_criteria>
- `src/isometric.css` contains `.cyber-pedestal`
- `src/pages/Home.jsx` contains `<div id="isometric-view" ...`
- The old string `Design your peace of mind` is completely removed.
- Visual check (run server): Four 3D pedestals should render identically around a central point.
</acceptance_criteria>

## Step 2: Agent Pathfinding and Navigation Logic
Implement the logic to spawn the Agent and walk to clicked nodes.

<read_first>
- `src/pages/Home.jsx`
- `src/App.jsx` (to verify correct navigation paths)
</read_first>

<action>
1. In `src/pages/Home.jsx`:
   - Add state: `const [agentPos, setAgentPos] = useState({ left: 350, top: 350 })` (center of 700x700).
   - Add state: `const [isAgentRunning, setIsAgentRunning] = useState(false)`
   - Include the React Router hook: `const navigate = useNavigate();`
   - Render the `<model-viewer>` for the `Chibi Chef` Agent inside an `.iso-agent` div linked to `agentPos`. (Src toggles between Walking and Running like Docs).
   - Attach an `onClick` handler to the `cyber-pedestal` nodes. When clicked:
     - Determine the exact `(x,y)` of the target node.
     - Call `setIsAgentRunning(true)` and `setAgentPos({ left: target_X, top: target_Y })`.
     - Set a timeout `setTimeout(() => { navigate(target_path); }, 2000)` assuming a CSS transition duration of `2s`.
</action>

<acceptance_criteria>
- `src/pages/Home.jsx` contains `useNavigate()` import.
- `src/pages/Home.jsx` contains `setTimeout` wrapping `navigate`.
- The Chibi Agent model renders inside the Isometric world with `camera-orbit`.
</acceptance_criteria>
