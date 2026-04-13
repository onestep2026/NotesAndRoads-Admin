```markdown
# Design System Strategy: Productive Elegance

## 1. Overview & Creative North Star
**The Creative North Star: The Curated Archive**
This design system rejects the clinical coldness of modern SaaS in favor of a "Digital Librarian’s Studio" aesthetic. It is a space designed for deep work, where high data density is balanced by editorial warmth. We are moving beyond the "template" look by utilizing intentional asymmetry, sophisticated serif typography, and a tactile sense of depth. 

The goal is **Productive Elegance**: the interface should feel as authoritative as a leather-bound ledger but as fluid as a modern digital workspace. We achieve this by treating the screen not as a grid of boxes, but as a series of layered, high-quality materials.

---

## 2. Colors & Surface Philosophy
The palette is rooted in organic, academic tones. We use a "Parchment and Ink" foundation to ground the user in a humanistic environment.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define major UI sections or cards. Layout boundaries must be defined solely through background color shifts.
- Use `surface-container-low` for secondary sidebar regions.
- Use `surface-container-highest` for active workspaces.
- To separate elements, rely on the transition from `#fcf9f4` (Surface) to `#f0ede9` (Surface Container).

### Surface Hierarchy & Nesting
Treat the UI as a physical desk. Each "layer" should sit naturally on top of the other:
1. **Base:** `surface` (#fcf9f4) — The primary "desk" surface.
2. **Structural Layers:** `surface-container-low` (#f6f3ee) for large background regions.
3. **Actionable Layers:** `surface-container-lowest` (#ffffff) for primary data cards or focal points, creating a subtle "pop" against the off-white background.

### Signature Textures
To avoid a "flat" digital feel:
- **CTAs:** Apply a subtle linear gradient to Primary buttons, transitioning from `primary` (#144227) to `primary_container` (#2d5a3d) at a 145-degree angle. This adds "soul" and weight.
- **Glassmorphism:** For floating menus (Modals or Tooltips), use a semi-transparent `surface` color with a `20px` backdrop-blur. This ensures the "Librarian's Studio" feels airy and high-end.

---

## 3. Typography
We utilize a high-contrast pairing to distinguish between "The Narrative" (Headers) and "The Data" (Functional text).

- **The Serif (Newsreader):** Used for all `display` and `headline` roles. This provides an editorial, sophisticated feel. It signals that the information here is curated and important.
- **The Sans (Inter):** Used for `title`, `body`, and `label` roles. This ensures maximum legibility in high-density data views. The geometric clarity of Inter balances the fluid nature of Newsreader.

**Hierarchy Note:** Always lead with a `headline-md` in Newsreader to set the tone of a page, then transition immediately to `label-md` or `body-md` in Inter for functional efficiency.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional drop shadows.

- **The Layering Principle:** Instead of adding a shadow to a card, place a `surface-container-lowest` card on a `surface-container-low` background. The shift in value provides enough affordance of depth without visual "noise."
- **Ambient Shadows:** Only use shadows for "Temporary" elements (Modals, Hovered Cards). Shadows must be diffused: `0px 12px 32px rgba(28, 28, 25, 0.06)`. Note the use of the `on-surface` color (#1c1c19) at a very low opacity for the shadow—never use pure black.
- **The Ghost Border:** If high-contrast accessibility is required, use a "Ghost Border": `outline-variant` (#c1c9c0) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary:** `primary` background with `on-primary` text. Use `xl` (0.75rem) roundedness. 
- **Secondary:** `secondary_container` background with `on-secondary_container` text.
- **Tertiary:** No background; `primary` text. Used for low-emphasis actions to keep the "Librarian" focus on the data.

### Status Badges (The Signature Component)
Badges should feel like wax seals or vintage stamps:
- **PENDING:** Background `tertiary_fixed_dim` (#fbbc00), Text `on-tertiary_fixed` (#261a00).
- **RESOLVED:** Background `primary_fixed` (#bceec8), Text `on-primary_fixed` (#00210f).
- **Styling:** Use `full` roundedness and `label-sm` (Inter, All Caps, +5% letter spacing).

### Cards & Lists
- **Rule:** Never use divider lines. 
- **Execution:** Separate list items using 8px of vertical whitespace or a subtle hover state shift to `surface-container-high`.
- **Nesting:** Data within cards should use `surface-variant` for input backgrounds to create a "recessed" feel.

### Text Inputs
- **Style:** "Understated Elegance." Use a `surface-container-highest` background with no border, and a bottom-only `outline` (#717971) that animates to `primary` (#144227) on focus.

---

## 6. Do's and Don'ts

### Do:
- **Embrace White Space:** High data density does not mean "crowded." Use the spacing scale to let sections breathe.
- **Use Intentional Asymmetry:** Align headers to the left but allow data cards to have varying widths to create a "custom-built" editorial feel.
- **Micro-interactions:** When hovering over a card, shift the background color by one tier (e.g., from `lowest` to `low`) and lift the elevation by 2px.

### Don't:
- **Don't use 100% Black:** Always use `on-surface` (#1c1c19) for text to maintain the humanistic, ink-on-paper feel.
- **Don't use hard corners:** Every interactive element must have at least a `DEFAULT` (0.25rem) radius to keep the system feeling approachable.
- **Don't use dividers:** If you feel the urge to draw a line, try adding 16px of margin or a slight color tint instead. Lines are for grids; color is for studios.

---

## 7. Interaction Note
Every interaction should feel deliberate. Avoid "snappy" transitions. Use `cubic-bezier(0.2, 0, 0, 1)` for all transitions (400ms) to give a sense of weight and quality, mimicking the movement of heavy paper or a sliding library ladder.```