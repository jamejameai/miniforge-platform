import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class App(Base):
    __tablename__ = "apps"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    slug = Column(String(64), index=True, nullable=False)
    description = Column(Text, default="")
    icon = Column(String(64), default="Sparkles")
    draft_spec = Column(JSON, nullable=False) # Full JSON AppSpec representation
    is_published = Column(Boolean, default=False)
    active_version_number = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    tenant = relationship("Tenant", back_populates="apps")
    versions = relationship("AppVersion", back_populates="app", cascade="all, delete-orphan", order_by="desc(AppVersion.version_number)")
    bot = relationship("TelegramBot", back_populates="app", uselist=False, cascade="all, delete-orphan")
    tables = relationship("AppTable", back_populates="app", cascade="all, delete-orphan")
    workflows = relationship("Workflow", back_populates="app", cascade="all, delete-orphan")
    products = relationship("POSProduct", back_populates="app", cascade="all, delete-orphan")
    orders = relationship("POSOrder", back_populates="app", cascade="all, delete-orphan")

class AppVersion(Base):
    __tablename__ = "app_versions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    app_id = Column(String(36), ForeignKey("apps.id", ondelete="CASCADE"), nullable=False, index=True)
    tenant_id = Column(String(36), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    spec_json = Column(JSON, nullable=False)
    changelog = Column(String(255), default="Published snapshot")
    published_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    app = relationship("App", back_populates="versions")
