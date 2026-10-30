# MiniForge — Product Requirements Document (PRD)

## 1. Product Identity & Purpose
**MiniForge** is an AI-powered visual software development and deployment platform engineered to transform non-technical users' ideas into production-ready software.
- **Primary Deployment Target**: Telegram Mini Apps (mobile WebApp JS SDK bridge).
- **Secondary Deployment Target**: Standalone responsive Web applications.
- **Core Value Proposition**: *"Build your own software. Control your own data. Launch anywhere."*

---

## 2. Complete User Journey Lifecycle
MiniForge guides users through a structured 10-stage application lifecycle:
`IDEA → UNDERSTAND → PLAN → DESIGN → DATA → WORKFLOW → TEST → CONNECT → PUBLISH → MANAGE`

### Stage 1: Idea Creation
Users begin from one of three starting doors:
1. **Start with an Idea**: Natural language description processed by Stage 2 AI Consultant.
2. **Start with a Template**: 12 curated industrial application templates (Restaurant, Retail POS, E-Commerce, School, Booking, Inventory, CRM, Tasks, Membership, Portfolio, Events, Support Portal).
3. **Start from Scratch**: Clean, unconstrained visual canvas.

### Stage 2: AI Product Planning
- Natural language prompts are analyzed into an **Editable Product Blueprint**:
  - App Name & refined purpose
  - Target audience & problems solved
  - User roles (Customer, Staff, Manager)
  - Application sitemap (Page routes & hierarchy)
  - Feature tiers: Essential (P0), Recommended (P1), Optional Future (P2)
  - Dynamic database schemas (Tables, fields, relations)
  - Automation workflows (Triggers, conditions, actions)
  - Clarifying product questions
- Users can review, edit, and click **Launch Application from Blueprint** for 1-click provisioning.

### Stage 3: Visual Concept Generation & Canvas Design
- Generates live, editable application components (`HeroBanner`, `ProductGrid`, `CartView`, `SectionHeading`, `StatCard`, `Table`, `Input`, `Divider`).
- Zero fake screenshots; every visual element is bound to the underlying `AppSpec` JSON specification.

### Stage 4: Application Studios
- **Visual App Studio**: Drag-and-drop palette, responsive canvas frame (Mobile 390px, Tablet 768px, Desktop 100%), component tree hierarchy, multi-level undo/redo, canvas zoom engine (50%-150%), alignment grid toggle, and quick duplicate.
- **Database Studio**: Dynamic relational tables, 15+ field types (`text`, `number`, `boolean`, `date`, `datetime`, `email`, `phone`, `select`, `relation`, `json`), records CRUD, search filtering, and bulk CSV/JSON import/export.
- **Workflow Studio**: Node-based visual automation editor running Trigger -> Condition -> Action pipelines on the server with microsecond telemetry and active/paused state toggling.
- **Bot Studio**: Dedicated customer Telegram bot connection, BotFather wizard, AES-256-GCM token encryption, one-click Menu Button configuration, and official HMAC-SHA256 initData cryptographic verification.
- **POS & Inventory Studio**: Real register with cash/card/Telegram Pay checkout, cashier discounts, printable receipts, and atomic stock deductions.

### Stage 5: Testing & Publishing
- Instant preview across mobile, tablet, and desktop viewports.
- Immutable snapshot publishing (`v1`, `v2`, ...) with zero-downtime atomic rollbacks.

### Stage 6: Build & Learn Experience
- **Beginner Mode**: Guided tooltips, best-practice design tips, relational data explanations, and workflow advice.
- **Pro Mode**: High-density engineering interface with raw JSON inspect, event triggers, and developer telemetry.

