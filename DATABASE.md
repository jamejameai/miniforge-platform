# MiniForge Database Architecture

MiniForge uses a hybrid relational + document model designed for multi-tenancy, dynamic customer tables, high performance, and transaction safety.

---

## 1. Core Platform Relational Entities

### Tenants & Identity
- `tenants`: Primary tenant account, subscription tier, storage limits, timestamps.
- `users`: Email, password hash, tenant reference, full name, avatar.
- `tenant_memberships`: Role assignment (`owner`, `admin`, `manager`, `editor`, `staff`, `viewer`).

### Applications & Publishing
- `apps`: Core application metadata (`name`, `slug`, `icon`, `theme`, `tenant_id`, `created_at`).
- `app_versions`: Immutable published snapshots containing full serialized JSON specification (`spec_json`, `version_number`, `published_by`, `changelog`).
- `app_deployments`: Active deployment mapping (`app_id`, `version_id`, `target`: `telegram` | `web`, `is_active`, `url`).

### Telegram Integration
- `telegram_bots`: Bot configuration per app (`bot_username`, `encrypted_token`, `webhook_url`, `is_connected`, `last_health_check`).

---

## 2. Dynamic Database Studio (User Data Model)

Instead of executing raw `CREATE TABLE` DDL queries per customer (which introduces SQL injection vulnerabilities, migration deadlocks, and connection overhead), MiniForge implements an indexed JSONB metadata storage model:

### Tables:
```sql
CREATE TABLE app_tables (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(app_id, name)
);
```

### Fields:
```sql
CREATE TABLE app_fields (
    id UUID PRIMARY KEY,
    table_id UUID NOT NULL REFERENCES app_tables(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    label VARCHAR(128) NOT NULL,
    field_type VARCHAR(32) NOT NULL, -- text, number, date, select, relation, etc.
    is_required BOOLEAN DEFAULT FALSE,
    is_unique BOOLEAN DEFAULT FALSE,
    default_value JSONB,
    options JSONB, -- For select/multiselect choices or relation target table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(table_id, name)
);
```

### Records:
```sql
CREATE TABLE app_records (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES app_tables(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Essential index for JSONB search and filtering
CREATE INDEX idx_app_records_table_data ON app_records USING GIN (data);
CREATE INDEX idx_app_records_tenant_table ON app_records(tenant_id, table_id);
```

---

## 3. POS & Inventory Ledger Entities

### Products & Categories
- `pos_categories`: (`id`, `tenant_id`, `app_id`, `name`, `sort_order`).
- `pos_products`: (`id`, `tenant_id`, `app_id`, `category_id`, `name`, `sku`, `barcode`, `price`, `cost`, `stock_quantity`, `is_active`).

### Orders & Items
- `pos_orders`: (`id`, `tenant_id`, `app_id`, `order_number`, `idempotency_key`, `subtotal`, `tax`, `discount`, `total`, `payment_method`, `payment_status`, `created_at`).
- `pos_order_items`: (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `total_price`).

### Stock Movement Ledger (Append-Only)
- `inventory_movements`:
  - `id`: UUID
  - `tenant_id`: UUID
  - `product_id`: UUID
  - `movement_type`: `IN` | `OUT` | `ADJUSTMENT` | `SALE` | `RETURN`
  - `quantity_delta`: Numeric (e.g. -2 for sale, +50 for stock-in)
  - `reference_id`: UUID (order_id or adjustment batch id)
  - `notes`: String
  - `created_at`: Timestamp

