# Design System Specification: High-End Documentation & 3D Interactive Web

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Atrium"**

This design system moves away from the "industrial documentation" look and toward a high-end editorial experience. We are building a space that feels like a modern gallery: open, airy, and hyper-focused. By utilizing the professional teal-leaning palette of `primary (#006a65)` and the warmth of `secondary (#845415)`, we create a technical yet human environment.

The interface breaks the "template" look through **Intentional Asymmetry**. Instead of a standard 50/50 split between documentation and 3D viewports, we utilize a floating sidebar and overlapping glass modules to ensure the 3D agent feels integrated into the documentation, not trapped in a box. The typography scale is aggressively hierarchical, using massive display titles to ground the user before they dive into dense technical content.

---

## 2. Colors & Surface Philosophy

### The "No-Line" Rule
To achieve a signature, premium feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through:
- **Background Color Shifts:** A `surface-container-low` section sitting on a `surface` background.
- **Tonal Transitions:** Using depth to separate the 3D viewport from the documentation sidebar.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of frosted glass.
- **Base Layer:** `surface` (#f2fcf8) for the main canvas.
- **Documentation Sidebar:** `surface-container-low` (#ecf6f2) to provide a soft recession.
- **Interactive Cards:** `surface-container-lowest` (#ffffff) to "pop" toward the user.
- **3D Agent HUD:** `surface-bright` (#f2fcf8) at 60% opacity with backdrop-blur.

### The "Glass & Gradient" Rule
Floating UI elements (like 3D camera controls) must use **Glassmorphism**.
- **Token Usage:** `primary-container` (#4ecdc4) at 15% opacity + 20px backdrop-blur.
- **Signature Textures:** Main CTAs or active document headings should use a subtle linear gradient from `primary` (#006a65) to `primary-container` (#4ecdc4) at a 135-degree angle to add "visual soul."

---

## 3. Typography
We utilize a pairing of **Plus Jakarta Sans** for high-impact editorial moments and **Inter** for technical readability.

*   **Display (Plus Jakarta Sans):** Aggressive and authoritative. `display-lg` (3.5rem) should be reserved for page titles or 3D agent introduction states.
*   **Headlines (Plus Jakarta Sans):** `headline-sm` (1.5rem) is the workhorse for documentation chapter titles. Use a tracking of -0.02em for a tighter, premium feel.
*   **Body (Inter):** `body-md` (0.875rem) handles the technical documentation. The `on-surface-variant` (#3d4948) color ensures long-form reading comfort.
*   **Labels (Inter):** `label-sm` (0.6875rem) in uppercase with +0.05em tracking for metadata, breadcrumbs, and 3D coordinate readouts.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering** rather than shadows. 
- Place a `surface-container-lowest` card on a `surface-container-low` section. The change from #ffffff to #ecf6f2 provides all the visual separation required for a clean, professional look.

### Ambient Shadows
When a floating effect is necessary (e.g., a context menu for the 3D agent):
- **Blur:** 40px - 60px.
- **Opacity:** 6% of the `on-surface` (#141d1b) color.
- **Offset:** Y: 12px. This mimics a natural light source from above.

### The "Ghost Border" Fallback
If a border is required for accessibility in input fields:
- Use `outline-variant` (#bcc9c7) at **15% opacity**. Never use a 100% opaque stroke.

---

## 5. Components

### Documentation Sidebar
- **Visual Style:** No right-side border. Use `surface-container-low` background.
- **Active State:** Instead of a highlight box, use a vertical pill of `primary` (4px wide, 24px high) next to the text.
- **Spacing:** Use `xl` (1.5rem) padding to give the documentation room to breathe.

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`). Roundedness: `md` (0.75rem).
- **Secondary:** Transparent background with the "Ghost Border" (15% `outline-variant`) and `primary` text.
- **Tertiary:** No background. Text-only with a subtle underline appearing only on hover.

### 3D Viewport HUD
- **Styling:** Floating glass panels using `surface-container-highest` at 40% opacity.
- **Roundedness:** `xl` (1.5rem) to contrast with the more structured documentation sidebar.

### Input Fields & Search
- **Container:** `surface-container-high` (#e0eae7) background. 
- **Focus:** No stroke. Instead, shift background to `primary-container` at 10% opacity and use a 1px `primary` bottom-border.

### Lists & Cards
- **Rule:** **Strictly forbid divider lines.** 
- **Separation:** Use vertical white space from the spacing scale (min. 32px between sections) or a subtle shift from `surface-container-low` to `surface-container-lowest`.

### Custom Component: The Agent Terminal
A bottom-docked text input for interacting with the 3D agent.
- **Style:** Glassmorphic container spanning 60% width of the 3D viewport. 
- **Typography:** `title-sm` (Inter) for real-time AI responses.

---

## 6. Do's and Don'ts

### Do
- **Do** use `primary-fixed` (#7cf6ec) for subtle highlights in 3D data visualizations.
- **Do** allow the 3D scene to bleed behind the sidebar using transparency and blur to create a sense of unified space.
- **Do** use `secondary-container` (#fdbd75) sparingly for warning states or "Action Required" documentation snippets to provide a warm, professional contrast.

### Don't
- **Don't** use black (#000000) for text. Use `on-surface` (#141d1b) for higher sophistication.
- **Don't** use standard 4px border-radii. Stick to the Roundedness Scale: `md` (0.75rem) or `xl` (1.5rem) for a modern, fluid feel.
- **Don't** use cards-inside-cards. Use background color shifts to indicate nesting to avoid "visual noise" and clutter.