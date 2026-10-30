from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.tenant import User
from app.models.app import App
from app.schemas.ai import AIGenerateRequest, AIGenerateResponse
from app.schemas.app import AppOut
from app.services.ai_generator import AIGeneratorService
from app.api.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Studio"])

@router.post("/generate", response_model=AIGenerateResponse)
async def generate_app_spec(
    req: AIGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    if not req.prompt or len(req.prompt.strip()) < 3:
        raise HTTPException(status_code=400, detail="Please provide a descriptive prompt.")

    response = AIGeneratorService.generate_app_from_prompt(req)
    return response

@router.post("/apply/{app_id}", response_model=AppOut)
async def apply_ai_spec(
    app_id: str,
    spec: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(App).where(App.id == app_id, App.tenant_id == current_user.tenant_id)
    res = await db.execute(stmt)
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    app.draft_spec = spec
    await db.commit()
    await db.refresh(app)
    return app
