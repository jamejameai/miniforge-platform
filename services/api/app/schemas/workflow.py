from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    is_active: bool = True
    trigger_type: str # RECORD_CREATED, ORDER_CREATED, LOW_STOCK, TELEGRAM_MESSAGE
    trigger_config: Optional[Dict[str, Any]] = None
    conditions: Optional[List[Dict[str, Any]]] = None
    actions: Optional[List[Dict[str, Any]]] = None

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    trigger_type: Optional[str] = None
    trigger_config: Optional[Dict[str, Any]] = None
    conditions: Optional[List[Dict[str, Any]]] = None
    actions: Optional[List[Dict[str, Any]]] = None

class WorkflowExecutionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    workflow_id: str
    status: str
    trigger_payload: Dict[str, Any]
    execution_logs: List[Any]
    error_message: Optional[str]
    duration_ms: int
    created_at: datetime

class WorkflowOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    app_id: str
    name: str
    description: Optional[str]
    is_active: bool
    trigger_type: str
    trigger_config: Dict[str, Any]
    conditions: List[Dict[str, Any]]
    actions: List[Dict[str, Any]]
    created_at: datetime

class WorkflowRunRequest(BaseModel):
    trigger_payload: Dict[str, Any]

class WorkflowRunResult(BaseModel):
    execution_id: str
    status: str
    duration_ms: int
    actions_executed: int
    logs: List[str]
