# MiniForge Security & Tenant Isolation Specification

MiniForge is architected with a Zero-Trust Multi-Tenant boundary model.

---

## 1. Multi-Tenant Isolation Guarantees

1. **Mandatory Tenant Scoping**:
   Every database query accessing applications, tables, records, workflows, products, or orders requires an authenticated `tenant_id`. No endpoint relies on client-supplied tenant headers without verifying session claims.
2. **Repository Guard Pattern**:
   Database access layers implement an automatic tenant filter:
   ```python
   stmt = select(AppRecord).where(
       AppRecord.tenant_id == current_user.tenant_id,
       AppRecord.table_id == table_id
   )
   ```
3. **No Cross-Tenant Data Leaks**:
   IDOR (Insecure Direct Object Reference) is prevented by validating ownership before record mutation or retrieval.

---

## 2. Telegram Mini App Authentication & Cryptography

MiniForge validates Telegram client identity strictly according to official Telegram documentation:

### Verification Protocol:
1. Client sends `initData` query string received from `window.Telegram.WebApp.initData`.
2. Extract the `hash` parameter.
3. Sort all remaining key-value pairs alphabetically and format as `key=value\n`.
4. Derive the HMAC secret key:
   $$\text{secret\_key} = \text{HMAC-SHA256}(\text{"WebAppData"}, \text{bot\_token})$$
5. Calculate HMAC signature:
   $$\text{calculated\_hash} = \text{HMAC-SHA256}(\text{data\_check\_string}, \text{secret\_key})$$
6. Verify $\text{calculated\_hash} == \text{hash}$ in constant time to prevent timing attacks.
7. Verify `auth_date` is not older than 24 hours to prevent replay attacks.
8. Parse the verified `user` JSON payload and establish an authenticated session.

---

## 3. Secret Management & Encryption at Rest

1. **Bot Tokens & API Credentials**:
   Tokens are encrypted using AES-256-GCM before persisting to PostgreSQL.
2. **Frontend Exposure Prevention**:
   Bot tokens are never transmitted to client browsers, emitted in JSON schemas, or printed in logs.
3. **Audit Trails**:
   All sensitive actions (publishing, credential changes, data export) are recorded in an immutable audit ledger.
