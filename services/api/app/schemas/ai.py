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

class BlueprintRequest(BaseModel):
    prompt: str
    target_audience: Optional[str] = None
    preferred_theme: Optional[str] = None

class BlueprintFeatureBreakdown(BaseModel):
    essential: List[str]
    recommended: List[str]
    optional_future: List[str]

class ProductBlueprint(BaseModel):
    app_name: str
    purpose: str
    category: str
    target_users: List[str]
    problems_solved: List[str]
    roles: List[Dict[str, str]]
    sitemap: List[Dict[str, str]]
    features: BlueprintFeatureBreakdown
    database_tables: List[Dict[str, Any]]
    workflows: List[Dict[str, Any]]
    clarifying_questions: List[str]
    suggested_spec: Dict[str, Any]

class BlueprintInstantiateRequest(BaseModel):
    blueprint: ProductBlueprint
    include_sample_data: bool = True


