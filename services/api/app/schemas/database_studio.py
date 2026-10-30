from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class FieldCreate(BaseModel):
    name: str
    label: str
    field_type: str # text, number, boolean, date, datetime, email, phone, select, relation, json
    is_required: bool = False
    is_unique: bool = False
    default_value: Optional[Any] = None
    options: Optional[Any] = None

class FieldOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    table_id: str
    name: str
    label: str
    field_type: str
    is_required: bool
    is_unique: bool
    default_value: Optional[Any]
    options: Optional[Any]
    created_at: datetime

class TableCreate(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = ""
    fields: Optional[List[FieldCreate]] = None

class TableOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    app_id: str
    name: str
    display_name: str
    description: Optional[str]
    fields: List[FieldOut] = []
    created_at: datetime

class RecordCreate(BaseModel):
    data: Dict[str, Any]

class RecordUpdate(BaseModel):
    data: Dict[str, Any]

class RecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    table_id: str
    data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
