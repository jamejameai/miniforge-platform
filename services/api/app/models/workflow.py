import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    tenant_id = Column(String(36), nullable=False, index=True)
    app_id = Column(String(36), ForeignKey("apps.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    is_active = Column(Boolean, default=True)
    trigger_type = Column(String(64), nullable=False) # RECORD_CREATED, ORDER_CREATED, LOW_STOCK, etc.
    trigger_config = Column(JSON, default=dict)
    conditions = Column(JSON, default=list) # [{ field, operator, value }]
    actions = Column(JSON, default=list) # [{ type, params }]
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    app = relationship("App", back_populates="workflows")
    executions = relationship("WorkflowExecution", back_populates="workflow", cascade="all, delete-orphan", order_by="desc(WorkflowExecution.created_at)")

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    tenant_id = Column(String(36), nullable=False, index=True)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), nullable=False) # SUCCESS, FAILED, SKIPPED
    trigger_payload = Column(JSON, default=dict)
    execution_logs = Column(JSON, default=list)
    error_message = Column(Text, default="")
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    workflow = relationship("Workflow", back_populates="executions")

