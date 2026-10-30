# MiniForge — Telegram Mini App Integration Guide

## 1. Zero-Trust Telegram Bot Architecture
In MiniForge, **each application owner connects their own Telegram bot**. There is no central, shared bot that exposes multi-tenant risk.

---

## 2. Token Security & Storage
- **Encryption Algorithm**: AES-256-GCM authenticated encryption.
- **Storage**: Encrypted byte array stored in PostgreSQL `telegram_bots` table.
- **Key Hierarchy**: Master platform encryption key configured via `TELEGRAM_TOKEN_ENCRYPTION_KEY` environment variable.
- **Access Rule**: Plaintext bot tokens are **never returned to the browser** or exposed via client-side endpoints.

---

## 3. Official HMAC-SHA256 Cryptographic Verification
When a Telegram user opens a Mini App, the Telegram client passes an `initData` query string containing user identity and a cryptographic signature.

MiniForge implements the official Telegram verification algorithm:

```python
# 1. Parse query string and remove 'hash' key
data_dict = parse_qsl(init_data)
received_hash = data_dict.pop("hash")

# 2. Sort keys alphabetically and format as 'key=value\n'
data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(data_dict.items()))

# 3. Compute secret_key = HMAC-SHA256(bot_token, "WebAppData")
secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()

# 4. Compute expected_hash = HMAC-SHA256(data_check_string, secret_key)
expected_hash = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()

# 5. Constant-time comparison
is_valid = hmac.compare_digest(received_hash, expected_hash)
```

Only when `is_valid == True` does the backend issue an authenticated customer session JWT.

---

## 4. Telegram WebApp JS SDK Bridge
The runtime at `/tg/[appSlug]` integrates with `window.Telegram.WebApp`:
- **`BackButton`**: Bound to Next.js navigation stack; auto-displays when navigating away from home.
- **`MainButton`**: Displays cart total (e.g. `"Pay $24.50"`) and handles checkout dispatch.
- **`HapticFeedback`**: Triggers native phone haptics (`impactOccurred("medium")`, `notificationOccurred("success")`).
- **`ThemeParams`**: Automatically synchronizes Telegram light/dark mode color variables into the runtime CSS root.
