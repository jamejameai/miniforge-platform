import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class AppTable(Base):
    __tablename__ = "app_tables"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    tenant_id = Column(String(36), nullable=False, index=True)
    app_id = Column(String(36), ForeignKey("apps.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(64), nullable=False)
    display_name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    app = relationship("App", back_populates="tables")
    fields = relationship("AppField", back_populates="table", cascade="all, delete-orphan", order_by="AppField.created_at")
    records = relationship("AppRecord", back_populates="table", cascade="all, delete-orphan")

class AppField(Base):
    __tablename__ = "app_fields"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    table_id = Column(String(36), ForeignKey("app_tables.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(64), nullable=False)
    label = Column(String(128), nullable=False)
    field_type = Column(String(32), nullable=False) # text, number, boolean, date, datetime, email, phone, select, relation, json
    is_required = Column(Boolean, default=False)
    is_unique = Column(Boolean, default=False)
    default_value = Column(JSON, nullable=True)
    options = Column(JSON, nullable=True) # select options or relational target config
    created_at = Column(DateTime(timezone=True), default=utc_now)

    table = relationship("AppTable", back_populates="fields")

class AppRecord(Base):
    __tablename__ = "app_records"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    tenant_id = Column(String(36), nullable=False, index=True)
    table_id = Column(String(36), ForeignKey("app_tables.id", ondelete="CASCADE"), nullable=False, index=True)
    data = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    table = relationship("AppTable", back_populates="records")

