import os
import hmac
import hashlib
import json
import base64
import urllib.parse
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
import jwt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing context using standard PBKDF2-SHA256
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

# ==========================================
# AES-256-GCM Secret Encryption & Decryption
# ==========================================
def _get_aesgcm() -> AESGCM:
    key_bytes = settings.ENCRYPTION_MASTER_KEY.encode()[:32]
    # Pad to 32 bytes if shorter
    key_bytes = key_bytes.ljust(32, b"0")
    return AESGCM(key_bytes)

def encrypt_secret(plain_text: str) -> str:
    """Encrypt a secret string using AES-256-GCM."""
    if not plain_text:
        return ""
    aesgcm = _get_aesgcm()
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plain_text.encode("utf-8"), None)
    # Pack nonce + ciphertext
    payload = nonce + ciphertext
    return base64.b64encode(payload).decode("utf-8")

def decrypt_secret(encrypted_b64: str) -> str:
    """Decrypt an AES-256-GCM encrypted secret string."""
    if not encrypted_b64:
        return ""
    try:
        raw = base64.b64decode(encrypted_b64.encode("utf-8"))
        nonce = raw[:12]
        ciphertext = raw[12:]
        aesgcm = _get_aesgcm()
        decrypted = aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted.decode("utf-8")
    except Exception:
        return ""

# ==========================================
# Official Telegram Mini App HMAC-SHA256 Auth
# ==========================================
def verify_telegram_init_data(init_data: str, bot_token: str, max_age_seconds: int = 86400) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    Validates initData received from window.Telegram.WebApp.initData
    according to official Telegram documentation:
    1. Parse query string pairs.
    2. Extract and remove 'hash'.
    3. Sort remaining key=value pairs alphabetically and join with newline.
    4. secret_key = HMAC_SHA256('WebAppData', bot_token)
    5. calculated_hash = HMAC_SHA256(data_check_string, secret_key)
    6. Verify calculated_hash == hash.
    7. Verify auth_date freshness.
    """
    if not init_data or not bot_token:
        return False, None

    try:
        parsed_data = urllib.parse.parse_qsl(init_data, keep_blank_values=True)
        data_dict = dict(parsed_data)

        if "hash" not in data_dict:
            return False, None

        received_hash = data_dict.pop("hash")

        # Sort remaining keys alphabetically
        sorted_keys = sorted(data_dict.keys())
        data_check_string = "\n".join(f"{k}={data_dict[k]}" for k in sorted_keys)

        # Telegram secret key derivation: HMAC-SHA256 of bot_token using "WebAppData" as key
        secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
        
        # Calculate signature
        calculated_hash = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()

        # Constant-time comparison
        if not hmac.compare_digest(calculated_hash, received_hash):
            return False, None

        # Check freshness
        if "auth_date" in data_dict:
            auth_timestamp = int(data_dict["auth_date"])
            now_timestamp = int(datetime.now(timezone.utc).timestamp())
            if now_timestamp - auth_timestamp > max_age_seconds:
                return False, None # Expired session

        # Parse user JSON if present
        user_info = None
        if "user" in data_dict:
            try:
                user_info = json.loads(data_dict["user"])
            except Exception:
                user_info = {"raw": data_dict["user"]}

        return True, {
            "user": user_info,
            "auth_date": data_dict.get("auth_date"),
            "query_id": data_dict.get("query_id"),
            "start_param": data_dict.get("start_param")
        }
    except Exception:
        return False, None
