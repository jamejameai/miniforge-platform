# MiniForge Changelog

All notable changes to the MiniForge platform will be documented in this file.

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

## [0.1.0] - 2026-10-30

### Initial Architecture & Foundation
- Established Master Architecture and Technical Specifications (`ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`, `APPLICATION-SCHEMA.md`).
- Designed Design System Token specification with `#D4146E` primary brand accent.
- Defined Zero-Trust multi-tenant isolation model and HMAC-SHA256 Telegram Mini App authentication specification.
- Initialized Monorepo structure with Next.js 15 App workspace, FastAPI backend service, and component registry.

