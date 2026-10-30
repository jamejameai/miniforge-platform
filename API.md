# MiniForge — Platform API Reference

MiniForge exposes a RESTful JSON API powered by **FastAPI** with Pydantic v2 validation and Async SQLAlchemy 2.

Base URL: `http://localhost:8000/api`

---

## 1. Authentication & Tenant Management
- `POST /auth/register`: Create new tenant account & owner user.
- `POST /auth/login`: Authenticate with OAuth2 Form or JSON, returns JWT Bearer token.
- `GET /auth/me`: Retrieve current tenant profile and assigned RBAC role.

## 2. Application Control Plane
- `GET /apps`: List all applications belonging to authenticated tenant.
- `POST /apps`: Create a new application with default `AppSpec`.
- `GET /apps/{app_id}`: Retrieve application configuration, draft spec, and active version number.
- `PUT /apps/{app_id}`: Update application metadata or draft specification.
- `POST /apps/{app_id}/duplicate`: Clone an application with isolated tables and workflows.
- `DELETE /apps/{app_id}`: Soft or hard delete an application.
- `POST /apps/{app_id}/publish`: Create an immutable version snapshot (`v1`, `v2`).
- `POST /apps/{app_id}/rollback/{version_id}`: Revert live runtime to a previous version snapshot.
- `GET /apps/public/{slug}`: Unauthenticated endpoint serving active snapshot configuration to public runtimes.

## 3. Stage 1 & 2: AI Planning & Blueprint Engine
- `POST /ai/generate`: Synthesize an `AppSpec` from a natural language prompt.
- `POST /ai/blueprint`: Generate an editable `ProductBlueprint` with target users, roles, sitemap, feature tiers, database tables, and workflows.
- `POST /ai/blueprint/instantiate`: 1-Click provision an application with pages, database tables, workflows, and starter products directly from an approved blueprint.

## 4. Industry Templates Catalog
- `GET /templates`: List the 12 pre-built industry templates.
- `GET /templates/{template_id}`: Retrieve full template specification.
- `POST /templates/{template_id}/instantiate`: 1-Click provision an app from a selected template.

## 5. Database Studio & Dynamic Records
- `GET /apps/{app_id}/tables`: List tables and field schemas.
- `POST /apps/{app_id}/tables`: Create a dynamic table.
- `POST /tables/{table_id}/fields`: Add a typed field (`text`, `number`, `select`, etc.).
- `GET /tables/{table_id}/records?search={q}`: Query JSONB records with filter.
- `POST /tables/{table_id}/records`: Insert a validated record.
- `POST /tables/{table_id}/records/bulk`: Bulk insert CSV/JSON records.
- `DELETE /records/{record_id}`: Delete record.

## 6. Point of Sale & Stock Ledger
- `GET /apps/{app_id}/pos/products`: Query catalog items with stock balance.
- `POST /apps/{app_id}/pos/products`: Create a product with SKU and pricing.
- `POST /apps/{app_id}/pos/orders`: Atomic checkout with payment method, discount, and idempotency key.
- `POST /apps/{app_id}/inventory/adjust`: Log manual stock adjustments (`IN`, `OUT`, `AUDIT`).
- `GET /apps/{app_id}/inventory/movements`: Retrieve append-only inventory movement audit trail.

## 7. Telegram Bot Studio
- `POST /apps/{app_id}/bot/connect`: Store and encrypt customer BotFather token with AES-256-GCM.
- `GET /apps/{app_id}/bot/status`: Check bot username and connection health.
- `POST /apps/{app_id}/bot/menu-button`: Configure Telegram Mini App menu launch button.
- `POST /apps/{app_id}/bot/verify-telegram`: Validate official Telegram WebApp `initData` HMAC-SHA256 signature.

## 8. Workflow Automation Engine
- `GET /apps/{app_id}/workflows`: List automation pipelines.
- `POST /apps/{app_id}/workflows`: Define Trigger -> Condition -> Action workflow.
- `PUT /workflows/{workflow_id}`: Update or toggle active/paused status.
- `POST /workflows/{workflow_id}/run-test`: Simulate execution with test payload and return execution telemetry.
- `GET /workflows/{workflow_id}/executions`: Audit trail of workflow runs.
