from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class AIGenerateRequest(BaseModel):
    prompt: str
    app_id: Optional[str] = None
    target_theme: Optional[str] = "modern_clean"

class AIGenerateResponse(BaseModel):
    app_name: str
    slug: str
    description: str
    suggested_spec: Dict[str, Any]
    summary_of_changes: List[str]
    suggested_tables: List[Dict[str, Any]]
    suggested_workflows: List[Dict[str, Any]]
