import re
import uuid
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.tenant import User
from app.models.app import App
from app.models.database_studio import AppTable, AppField
from app.models.workflow import Workflow
from app.models.pos import POSProduct
from app.schemas.ai import (
    AIGenerateRequest, AIGenerateResponse,
    BlueprintRequest, ProductBlueprint, BlueprintInstantiateRequest
)
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

@router.post("/blueprint", response_model=ProductBlueprint)
async def generate_product_blueprint(
    req: BlueprintRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Stage 2 AI Product Planning Consultant:
    Transforms natural language idea into a structured, editable product blueprint.
    """
    if not req.prompt or len(req.prompt.strip()) < 3:
        raise HTTPException(status_code=400, detail="Please provide a descriptive idea prompt.")

    return AIGeneratorService.generate_blueprint(req)

@router.post("/blueprint/instantiate", response_model=AppOut)
async def instantiate_application_from_blueprint(
    req: BlueprintInstantiateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Stage 3 & 4 Instant App Provisioning:
    Turns the approved product blueprint into a fully working application with
    pages, theme tokens, database tables, workflows, and starter catalog data.
    """
    bp = req.blueprint
    base_slug = re.sub(r"[^a-z0-9]+", "-", bp.app_name.lower()).strip("-")
    slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

    # 1. Create Application Record
    app = App(
        tenant_id=current_user.tenant_id,
        name=bp.app_name,
        slug=slug,
        description=bp.purpose,
        draft_spec=bp.suggested_spec
    )
    db.add(app)
    await db.flush()

    # 2. Provision Blueprint Database Tables
    for tbl in bp.database_tables:
        app_table = AppTable(
            tenant_id=current_user.tenant_id,
            app_id=app.id,
            name=tbl["name"],
            display_name=tbl["display_name"],
            description=tbl.get("description", "")
        )
        db.add(app_table)
        await db.flush()

        for fld in tbl.get("fields", []):
            field_record = AppField(
                table_id=app_table.id,
                name=fld["name"],
                label=fld["label"],
                field_type=fld.get("field_type", "text"),
                is_required=fld.get("is_required", False),
                default_value=fld.get("default_value"),
                options=fld.get("options")
            )
            db.add(field_record)

    # 3. Provision Blueprint Workflows
    for wf in bp.workflows:
        workflow_record = Workflow(
            tenant_id=current_user.tenant_id,
            app_id=app.id,
            name=wf["name"],
            trigger_type=wf["trigger_type"],
            conditions=wf.get("conditions", []),
            actions=wf.get("actions", []),
            is_active=True
        )
        db.add(workflow_record)

    # 4. Provision Sample Catalog Products if requested
    if req.include_sample_data:
        cat_lower = bp.category.lower()
        if "food" in cat_lower or "hospitality" in cat_lower:
            starter_products = [
                {"name": "Espresso Romano", "price": 3.50, "cost": 0.80, "stock": 50, "sku": "BEV-ESP-01", "img": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400"},
                {"name": "Artisan Almond Croissant", "price": 4.75, "cost": 1.20, "stock": 25, "sku": "BAK-CRS-01", "img": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400"},
                {"name": "Cold Brew Reserve", "price": 5.00, "cost": 1.10, "stock": 40, "sku": "BEV-CLD-01", "img": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400"}
            ]
        elif "education" in cat_lower:
            starter_products = [
                {"name": "Full-Stack Development Bootcamp", "price": 499.00, "cost": 50.00, "stock": 30, "sku": "CRS-FSD-01", "img": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400"},
                {"name": "UI/UX Product Design Masterclass", "price": 349.00, "cost": 40.00, "stock": 25, "sku": "CRS-UIX-01", "img": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400"}
            ]
        elif "appointment" in cat_lower or "services" in cat_lower:
            starter_products = [
                {"name": "Executive Haircut & Styling (45m)", "price": 45.00, "cost": 10.00, "stock": 99, "sku": "SRV-CUT-01", "img": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400"},
                {"name": "Signature Hot Towel Shave (30m)", "price": 35.00, "cost": 5.00, "stock": 99, "sku": "SRV-SHV-01", "img": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400"}
            ]
        else:
            starter_products = [
                {"name": "Signature Product Alpha", "price": 29.99, "cost": 8.50, "stock": 40, "sku": "PRD-ALP-01", "img": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"},
                {"name": "Signature Product Beta", "price": 49.99, "cost": 14.00, "stock": 25, "sku": "PRD-BET-01", "img": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400"}
            ]

        for p in starter_products:
            prod = POSProduct(
                tenant_id=current_user.tenant_id,
                app_id=app.id,
                name=p["name"],
                price=Decimal(str(p["price"])),
                cost=Decimal(str(p["cost"])),
                stock_quantity=p["stock"],
                sku=p["sku"],
                image_url=p["img"]
            )
            db.add(prod)

    await db.commit()
    await db.refresh(app)
    return app

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


