# MiniForge Changelog

All notable changes to the MiniForge platform will be documented in this file.

---

## [1.2.0] - 2026-10-30

### Complete Visual Studio Overhaul (Figma & Framer Grade Development Environment)
- **Framer-Grade Visual Motion Studio**:
  - Added native CSS keyframe and spring motion engine with 8 presets: `fadeIn`, `slideUp`, `slideDown`, `slideLeft`, `slideRight`, `scaleIn`, `bounceIn`, and `pulse`.
  - Configurable timing parameters: Duration (100ms - 1200ms), Delay (0ms - 800ms), and physics-based Easing curves (`spring`, `ease-out`, `ease-in-out`, `linear`).
  - Interactive "Play Animation Preview" button directly inside the Motion Inspector for instant feedback.
- **Figma-Inspired Visual Canvas Experience**:
  - Multi-component selection support with `Shift+Click` keyboard navigation.
  - Floating contextual right-click menu: Duplicate, Lock / Unlock, Hide / Show, Move Up, Move Down, Delete.
  - Layer protection flags: `isLocked` (prevents accidental movement or deletion) and `isHidden` (omits from preview/live runtime while retaining design layout).
  - Alignment dot grid toggle, canvas zoom controls (`50%` to `150%`), and realistic Telegram status bar simulation.
- **Global Command Palette (`Cmd+K` / `Ctrl+K`)**:
  - Omnibar modal for rapid fuzzy search and 1-click insertion of components, instant page jumping, viewport switching, draft saving (`Cmd+S`), and snapshot publishing.
- **Professional Multi-Tab Creation Dock (Left Sidebar)**:
  - **Add (Components Library)**: Rich categorized catalog (All, Layout, Commerce, Typography, Forms, Data, Feedback) with instant fuzzy search.
  - **Layers (Hierarchy & Pages)**: Hierarchical layer tree with per-component lock, hide, reorder, duplicate, and delete controls.
  - **Theme (Design Tokens)**: Brand palette switchers (MiniForge Pink, Telegram Blue, Emerald SaaS, Violet Tech, Amber Bistro), corner radius scales (4px, 8px, 12px, 16px, 24px), font family selectors, and navigation styling.
  - **Assets (Media Library)**: Curated high-resolution stock photography presets across Cafe, Food, Retail, Tech, and Services categories, plus instant custom image URL tester.
- **Multi-Tab Properties Inspector (Right Sidebar)**:
  - Tabbed inspector organized into **Content**, **Layout** (Width, Height, Padding, Margin, Align), **Style** (Background color, Text color, Radius, Elevation), **Motion** (Entrance animations, duration, delay, easing), and **Logic** (Trigger -> Condition -> Action builder).
- **Studio Header & Mode Switcher**:
  - `Design Mode` vs `Logic Mode` toggle for non-coders and advanced developers.
  - Real-time autosave status indicator (`Saved`, `Saving...`, `Unsaved changes`).
- **Complete Application Runtime Parity (`/r/` and `/tg/`)**:
  - Both Standalone Web and Telegram Mini App runtimes now execute custom dynamic styles, responsive overrides, CSS keyframe animations, and Telegram haptic feedback natively.
  - Expanded component registry with `Badge`, `Image`, and `Notice` callout components.

---

## [1.1.0] - 2026-10-30

### AI Product Planning Blueprint, 12 Templates & Build-and-Learn System
- **Stage 2 AI Product Planning Blueprint Engine**: Added `POST /api/ai/blueprint` analyzing natural language prompts into an editable `ProductBlueprint` with target users, roles breakdown, navigation sitemap, feature tiers (P0 essential, P1 recommended, P2 future), dynamic database tables, automated workflows, and clarifying questions.
- **1-Click Blueprint & Template Instantiation**: Added `POST /api/ai/blueprint/instantiate` and `POST /api/templates/{id}/instantiate` provisioning pages, relational database tables, server-side workflows, and starter POS products in a single transaction.
- **12 Curated Industry Application Templates**: Catalog of complete, production-ready templates for Restaurant, Retail POS, E-Commerce, School, Booking, Inventory, CRM, Tasks, Membership, Portfolio, Events, and Support Portal.
- **Multi-Door Creation Experience**: Rebuilt dashboard modal with 3 starting doors ("Start with an Idea", "Templates (12)", "Blank Project") and an interactive blueprint review editor.
- **Build and Learn Educational Intelligence**: Added global `[🎓 Beginner Mode] / [⚡ Pro Mode]` toggle (`learning-mode.tsx`), contextual component design lessons, database relational tutorials, and workflow automation tips.
- **Canvas Zoom & Alignment Grid Engine**: Added smooth canvas zoom controls (`50%` to `150%`), SVG dot alignment grid toggle, and 1-click component duplication across canvas and layers hierarchy.
- **Expanded Documentation Suite**: Authored `PRODUCT-REQUIREMENTS.md`, `DESIGN-SYSTEM.md`, `API.md`, `WORKFLOW-ENGINE.md`, and `TELEGRAM-INTEGRATION.md`.

---

## [1.0.0] - 2026-10-30

### Complete Platform Release & Client Verification
- **Unified Single-Command Engine**: Added `./run.sh` / `pnpm dev` orchestrator launching both FastAPI (Port 8000) and Next.js 15 (Port 3000) concurrently with graceful shutdown signal trapping.
- **Visual App Studio**: Implemented interactive visual canvas, component hierarchy tree, drag-and-drop palette, real-time responsive preview (mobile/tablet/desktop), and property inspectors with multi-level undo/redo.
- **Database Studio & Bulk Import**: Added dynamic tables, 15+ field types, record CRUD, search filtering, and bulk CSV/JSON import (`POST /api/tables/{id}/records/bulk`).
- **POS Studio & Cashier Experience**: Added full POS register, multi-payment methods (Cash, Card, Telegram Pay), cashier discount input, printable receipt modal, and atomic idempotency stock deductions.
- **Inventory Movement Ledger**: Built append-only stock movement tracking (`IN`, `OUT`, `ADJUSTMENT`) with real-time low-stock threshold triggers.
- **Telegram Bot Studio**: Full BotFather setup wizard, AES-256-GCM encrypted token storage, one-click Menu Button configuration, and official HMAC-SHA256 signature verification.
- **Workflow Automation Studio**: Visual Trigger -> Condition -> Action execution pipeline, live runner with microsecond telemetry, and pause/resume lifecycle toggling.
- **AI App Generator**: Natural language prompt synthesizer generating production-ready multi-page AppSpecs with dynamic database schemas.
- **Global Toast Notification System**: Added dark & primary pink SaaS toast alerts (`useToast`) across all studios, completely eliminating intrusive browser alerts.
- **Client E2E Simulation**: Validated 100% of all 12 client lifecycle stages with an automated end-to-end integration harness.

---

## [0.1.0] - 2026-10-30

### Initial Architecture & Foundation
- Established Master Architecture and Technical Specifications (`ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`, `APPLICATION-SCHEMA.md`).
- Designed Design System Token specification with `#D4146E` primary brand accent.
- Defined Zero-Trust multi-tenant isolation model and HMAC-SHA256 Telegram Mini App authentication specification.
- Initialized Monorepo structure with Next.js 15 App workspace, FastAPI backend service, and component registry.
