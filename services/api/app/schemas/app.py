from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class AppCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = ""
    icon: Optional[str] = "Sparkles"
    template: Optional[str] = "blank" # blank, commerce, restaurant, portfolio

class AppUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    draft_spec: Optional[Dict[str, Any]] = None

class AppPublishRequest(BaseModel):
    changelog: Optional[str] = "Production release snapshot"

class AppVersionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    app_id: str
    version_number: int
    changelog: str
    spec_json: Dict[str, Any]
    created_at: datetime

class AppOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    name: str
    slug: str
    description: Optional[str]
    icon: Optional[str]
    is_published: bool
    active_version_number: int
    draft_spec: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
