# MiniForge — Server-Side Workflow Automation Engine

## 1. Engine Architecture
The MiniForge Workflow Engine transforms visual application interfaces into reactive, server-side automated software.

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  EVENT TRIGGER  │ ───> │ RULE EVALUATOR  │ ───> │ ACTION DISPATCH │
│ (e.g. Checkout) │      │ (e.g. Total>10) │      │ (e.g. Telegram) │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
  Payload Ingestion        AST Condition Tree       Microsecond Telemetry
```

Workflows run **strictly on the backend**. Normal clients never evaluate automation logic locally.

---

## 2. Event Triggers
| Trigger Type | Source | Event Context Payload |
|---|---|---|
| `ORDER_CREATED` | POS / Web / Telegram Checkout | `order_id`, `order_number`, `total`, `customer_name`, `items` |
| `RECORD_CREATED` | Dynamic Database Studio Table | `table_id`, `record_id`, `data` (all custom dynamic fields) |
| `LOW_STOCK` | POS Inventory Movement Ledger | `product_id`, `product_name`, `stock_quantity`, `threshold` |
| `USER_SIGNUP` | Mini App Customer Authentication | `user_id`, `telegram_id`, `first_name`, `username` |

---

## 3. Condition Operators
Condition trees evaluate incoming payload keys against expected values:
- `==` / `equals`: Exact equality match.
- `!=` / `not_equals`: Inequality.
- `>` / `greater_than`: Numeric comparison.
- `<` / `less_than`: Numeric comparison.
- `>=` / `greater_than_or_equal`: Numeric comparison.
- `<=` / `less_than_or_equal`: Numeric comparison.
- `contains`: Substring or list membership.
- `is_empty`: Checks for null, empty strings, or empty arrays.

Multiple conditions are evaluated using standard boolean conjunction (`AND` / `OR`).

---

## 4. Action Dispatchers
- **`TELEGRAM_NOTIFICATION`**: Formats templated messages (e.g. `"New order #{order_number} for ${total}"`) and dispatches via the application's dedicated encrypted bot token to the configured customer chat ID or merchant channel.
- **`EMAIL_NOTIFICATION`**: Dispatches transactional alert to configured administrative inbox.
- **`INVENTORY_DEDUCT`**: Invokes atomic inventory movement ledger entry.
- **`UPDATE_RECORD`**: Patches records in custom dynamic database tables.

---

## 5. Execution Telemetry & Audit Logs
Every workflow execution records an immutable `WorkflowExecution` row:
- `execution_id`: UUIDv4
- `trigger_payload`: JSON snapshot of incoming event
- `status`: `SUCCESS` or `FAILED`
- `duration_ms`: Execution latency (typically 1ms - 8ms)
- `logs`: Array of line-by-line step execution statements
- `error_message`: Stack trace or failure description if encountered

