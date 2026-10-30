# MiniForge Architectural Specification

## 1. System Vision & Paradigm

MiniForge separates application development into two clean systems:
1. **MiniForge Studio**: The design, modeling, automation, and management environment.
2. **MiniForge Runtime**: The declarative execution engine serving published applications to Telegram Mini Apps and standalone web browsers.

Applications in MiniForge are **not** generated as bespoke codebases that drift or break. Instead, every published application is an **immutable, validated Application Configuration Snapshot** (`AppSpecVersion`). The shared runtime engine interprets this versioned configuration dynamically, ensuring:
- Universal multi-target support (Telegram + Web) from a single source of truth.
- Zero-breakage updates and instantaneous version rollbacks.
- Strict security boundaries, since untrusted user code is never compiled or executed on server infrastructure.

---

## 2. Core Subsystems

### 2.1 Studio Workspace & Visual Builder
- **Visual Canvas**: Direct manipulation canvas supporting drag-and-drop, hierarchical nesting, and multi-breakpoint responsive previews (Mobile: 390px, Tablet: 768px, Desktop: 1280px).
- **Component Registry**: Extensible registry defining 20+ component primitives (Buttons, Inputs, Tables, Grids, Cards, Product Cards, Cart, Charts, Modals).
- **Properties Inspector**: Real-time attribute editor for typography, spacing, colors, visibility conditions, data queries, and click/submit event handlers.
- **History Manager**: In-memory state stack providing full undo/redo capabilities.

### 2.2 Dynamic Database Studio
- **Storage Model**: PostgreSQL metadata tables (`app_tables`, `app_fields`) paired with JSONB record store (`app_records`) and indexed search columns.
- **Field Types**: 15 supported primitives (`text`, `number`, `boolean`, `date`, `datetime`, `email`, `phone`, `select`, `multiselect`, `json`, `relation`, `image`, `file`).
- **Data Integrity**: Backend schema validator enforces foreign key references, unique constraints, and required fields before writing records.

### 2.3 Bot Studio & Telegram Bridge
- **Bot Ownership**: Every tenant connects their own Telegram Bot created via `@BotFather`.
- **HMAC-SHA256 Verification**: Follows official Telegram Mini App specifications. Validates the `hash` query param using secret key derived from bot token and `WebAppData`.
- **Telegram WebApp SDK Integration**: Bi-directional bridge supporting `MainButton`, `BackButton`, `HapticFeedback`, `setHeaderColor`, `expand()`, and viewport metrics.

### 2.4 Workflow Engine
- **Pattern**: `TRIGGER -> CONDITION -> ACTION`.
- **Execution**: Server-side asynchronous worker with transaction safety.
- **Triggers**: Record Created, Record Updated, POS Order Submitted, Low Stock Alert, Webhook Received.
- **Conditions**: Field comparator groups with `AND` / `OR` logic.
- **Actions**: Create Record, Update Field, Deduct Stock, Send Telegram Notification, Trigger Webhook.

### 2.5 POS & Inventory Engine
- **Transactional Stock Deduction**: ACID transactions prevent overselling.
- **Idempotency**: Every checkout payload requires an `idempotency_key` preventing double charges.
- **Audit Ledger**: Stock movement entries (`IN`, `OUT`, `ADJUSTMENT`, `RETURN`) are append-only.

---

## 3. Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide icons, `@dnd-kit` / interactive drag-and-drop, Radix UI primitives.
- **Backend API**: Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2 (asyncpg / aiosqlite), Alembic.
- **Database**: PostgreSQL with JSONB indexing (aiosqlite supported for zero-dependency local verification).
- **Cache & Queue**: Redis for session tracking, rate limiting, and async workflow execution.
- **Security**: AES-256-GCM token encryption, PBKDF2/Argon2 password hashing, JWT sessions, strict tenant filtering.

