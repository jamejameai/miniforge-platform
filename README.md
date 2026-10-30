# MiniForge

> **Build your own software. Control your own data. Launch anywhere.**

MiniForge is a visual application development platform and runtime engine that empowers users to create, customize, manage, and publish Telegram Mini Apps and standalone web applications without traditional code.

---

## Key Highlights

- **Visual Studio**: Drag-and-drop page builder, component hierarchy tree, and real-time properties inspector.
- **Telegram Native Runtime**: BotFather connection wizard, encrypted bot tokens, HMAC-SHA256 signature verification, and Telegram WebApp integration (BackButton, MainButton, Viewport, Haptics).
- **Standalone Web Runtime**: Identical business logic, navigation, and state running as a responsive web app.
- **Dynamic Database Studio**: Metadata-driven data layer (PostgreSQL JSONB storage with validated indices), custom tables, 15+ data types, relational references, search, filtering, and CSV import/export.
- **Visual Workflow Engine**: Backend automation graph (`TRIGGER -> CONDITION -> ACTION`) with retry handling and execution history.
- **POS & Inventory Engine**: Catalog, SKU/Barcode tracking, transactional stock deduction, idempotency checks, and double-entry inventory ledger.
- **Multi-Tenant Security**: Tenant-isolated schemas, AES-256 encrypted secrets, server-side RBAC, and zero hardcoded credentials.
- **AI Application Generator**: Natural language prompt to validated application schema JSON specifications.

---

## Design System

The MiniForge design system emphasizes restrained, clean, high-density professional SaaS aesthetics:

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Primary Accent** | `#D4146E` | Highlights, active selections, primary CTA buttons |
| **Primary Dark** | `#171717` | Typography, primary badges, high-contrast elements |
| **Background** | `#FFFFFF` | Core canvas, page background |
| **Secondary Surface** | `#F7F7F8` | Sidebars, cards, panels, table headers |
| **Subtle Border** | `#E8E8EA` | Dividers, card borders, input strokes |
| **Muted Text** | `#777777` | Captions, secondary labels, helper descriptions |
| **Main Text** | `#171717` | Headings, table cells, primary body copy |

---

## Monorepo Architecture

```
miniforce/
├── apps/
│   └── web/                     # Next.js 15 App (MiniForge Studio & Runtime Engine)
│       ├── src/app/             # Next.js App Router (Studio & Runtime routes)
│       │   ├── (studio)/        # Studio Workspace, Builder, Database, POS, etc.
│       │   └── (runtime)/       # Published App Renderer (/r/:appSlug, /tg/:appSlug)
│       └── src/components/      # UI components, canvas, inspectors
├── services/
│   └── api/                     # FastAPI Backend Service (Python 3.12+)
│       ├── app/api/             # REST endpoints (auth, apps, tables, workflows, bot, pos)
│       ├── app/core/            # Config, security, database session
│       ├── app/models/          # SQLAlchemy async models
│       ├── app/schemas/         # Pydantic v2 validation contracts
│       └── app/services/        # Business logic, TG auth, workflow engine, pos ledger
├── packages/
│   ├── app-schema/              # Shared TypeScript app schemas & validator
│   └── component-registry/      # Component definitions, props schemas, default configs
├── infrastructure/
│   └── docker/                  # Docker Compose, PostgreSQL, Redis configs
└── docs/                        # Architecture, Database, Security, Schema documentation
```

---

## Quick Start

### 1. Backend Service (FastAPI)

```bash
cd services/api
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Platform (Next.js Studio & Runtime)

```bash
cd apps/web
pnpm install
pnpm dev --port 3000
```

Access the Studio at `http://localhost:3000`.

---

## Documentation Suite

- [Architecture Guide](file:///Users/macbook/miniforce/ARCHITECTURE.md)
- [Product Requirements Document](file:///Users/macbook/miniforce/PRODUCT-REQUIREMENTS.md)
- [Design System Specification](file:///Users/macbook/miniforce/DESIGN-SYSTEM.md)
- [Database Schema & Strategy](file:///Users/macbook/miniforce/DATABASE.md)
- [Platform API Reference](file:///Users/macbook/miniforce/API.md)
- [Workflow Automation Engine](file:///Users/macbook/miniforce/WORKFLOW-ENGINE.md)
- [Telegram Mini App Integration](file:///Users/macbook/miniforce/TELEGRAM-INTEGRATION.md)
- [Security & Tenant Isolation](file:///Users/macbook/miniforce/SECURITY.md)
- [Application Configuration Schema](file:///Users/macbook/miniforce/APPLICATION-SCHEMA.md)
- [Development Setup](file:///Users/macbook/miniforce/DEVELOPMENT.md)
- [Deployment Guide](file:///Users/macbook/miniforce/DEPLOYMENT.md)
- [Changelog](file:///Users/macbook/miniforce/CHANGELOG.md)

