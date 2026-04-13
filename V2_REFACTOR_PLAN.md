# NotesAndRoads Admin V2: Nirvana Refactor Plan 🏛️

This document outlines the strategic overhaul of the NotesAndRoads Admin Web App, transitioning from a functional but sterile interface to a **"Digital Librarian’s Studio"** powered by Google's Stitch design philosophy.

## 🌟 Creative North Star: "Productive Elegance"
The goal is to create a workspace that feels as authoritative as a leather-bound ledger but as fluid as a modern digital workspace. High data density must be balanced by editorial warmth.

---

## 🏗 Phase 1: Foundation & Tooling (The Infrastructure)
*   **Tailwind CSS Integration**: Fully embrace utility-first CSS to implement Stitch's atomic design.
*   **Design Tokens (`tailwind.config.js`)**:
    *   **Colors**: 
        *   `surface`: `#fcf9f4` (Base desk)
        *   `surface-container-low`: `#f6f3ee` (Structural regions)
        *   `surface-container-lowest`: `#ffffff` (Data cards/focal points)
        *   `brand-primary`: `#144227` (Deep Forest)
        *   `brand-accent`: `#2d5a3d` (Amber/Moss transition)
    *   **Typography**: 
        *   `serif`: `['Newsreader', 'serif']` (Headers/Narrative)
        *   `sans`: `['Inter', 'sans-serif']` (Data/UI)
    *   **The "No-Line" Rule**: Prohibit 1px solid borders. Use background color shifts (`tonal layering`) for layout boundaries.
    *   **Animation**: `cubic-bezier(0.2, 0, 0, 1)` with 400ms duration for "heavy paper" movement.

---

## 🧭 Phase 2: Spatial Architecture (The Studio Shell)
*   **The Archive Index (Sidebar)**: 
    *   Asymmetric layout with `bg-surface-container-low`.
    *   No shadows; use tonal contrast to separate from the main workspace.
*   **The Command Hub (Cmd+K)**: 
    *   Floating Glassmorphism search bar (`backdrop-blur-20px`).
    *   Instant navigation for Report IDs, User IDs, and Book ISBNs.
*   **The Desk (Main Workspace)**: 
    *   Clean `bg-surface` with generous whitespace.
    *   Editorial header styling using `Newsreader` font.

---

## 📖 Phase 3: Book Submissions (The Librarian's View)
*   **Split-Screen Interface**:
    *   **Left (Source)**: Large-scale preview of user-submitted book covers and raw metadata.
    *   **Right (Ledger)**: The **Author Reconciliation Panel**.
*   **Author Match Component**:
    *   Cards for candidate authors with match scores.
    *   Tonal lifting on hover (from `lowest` to `low`) + 2px Z-axis elevation.
    *   Inline metadata editing (ISBN, Language, Translators).

---

## ⚖️ Phase 4: Governance Pipeline (Moderation Flow)
*   **Card-Based Feed**: 
    *   Abandon traditional tables for Reports/Feedback.
    *   8px vertical whitespace separation (No dividers).
*   **The Contextual Side-Pane**:
    *   Slide-in panel showing "Target User's" violation history and past enforcements.
*   **Action HUD**: 
    *   Persistent bottom bar for rapid decision-making (Approve, Reject, Ban).
    *   Buttons feature a subtle 145-degree linear gradient for tactile depth.

---

## 🕯 Phase 5: Micro-Interactions & Polish
*   **Wax Seal Badges**: 
    *   Status labels (`PENDING`, `RESOLVED`) styled like vintage stamps.
    *   Full rounded corners + `Inter` All Caps + letter spacing.
*   **Understated Inputs**: 
    *   No borders; only an bottom outline that animates to `brand-primary` on focus.
*   **Ambient Shadows**: 
    *   Only for temporary elements (Modals, Hovers). Use low-opacity `on-surface` color, never pure black.

---

## 🛠 Execution Strategy (Step-by-Step)
1.  **[ ] Baseline**: Setup Tailwind & Google Fonts.
2.  **[ ] Core Layout**: Replace `app.component.html` with the new Studio Shell.
3.  **[ ] Librarian View**: Refactor `BookSubmissionsPageComponent` using the Split-Screen code.
4.  **[ ] Moderation Flow**: Implement the Card Feed & Action HUD for Reports.
5.  **[ ] Registry**: Style the Enforcements table with "Parchment" aesthetics.

---
*Created by Gemini CLI based on Stitch Design Export.*
