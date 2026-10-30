import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "MiniForge API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "miniforce-insecure-dev-secret-key-replace-in-production-32bytes"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # 32-byte key for AES-GCM encryption of secrets
    ENCRYPTION_MASTER_KEY: str = "k9Z7QpLm4YxR2wTv8Bn1Jc3Vf5Gs0He6" # 32-char dev key
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./miniforge_dev.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

settings = Settings()
