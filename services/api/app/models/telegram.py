import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class TelegramBot(Base):
    __tablename__ = "telegram_bots"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    app_id = Column(String(36), ForeignKey("apps.id", ondelete="CASCADE"), unique=True, nullable=False)
    tenant_id = Column(String(36), nullable=False, index=True)
    bot_username = Column(String(128), default="")
    encrypted_bot_token = Column(String(512), default="") # Encrypted with AES-256-GCM
    is_connected = Column(Boolean, default=False)
    menu_button_configured = Column(Boolean, default=False)
    webhook_url = Column(String(255), default="")
    webhook_secret = Column(String(128), default="")
    last_health_check = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    app = relationship("App", back_populates="bot")
