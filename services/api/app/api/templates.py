import uuid
from decimal import Decimal
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.tenant import User
from app.models.app import App
from app.models.database_studio import AppTable, AppField
from app.models.workflow import Workflow
from app.models.pos import POSProduct
from app.schemas.app import AppOut
from app.services.templates import TEMPLATES_CATALOG
from app.api.deps import get_current_user

router = APIRouter(prefix="/templates", tags=["Templates"])

@router.get("", response_model=List[Dict[str, Any]])
async def list_templates():
    """
    Returns the catalog of 12 industry templates for Stage 1 Idea Creation.
    """
    # Return metadata without deep specs for fast catalog browsing
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "category": t["category"],
            "description": t["description"],
            "icon": t["icon"],
            "color": t["color"],
            "badge": t.get("badge", ""),
            "pages_count": len(t["spec"].get("pages", [])),
            "tables_count": len(t.get("database_tables", [])),
            "workflows_count": len(t["spec"].get("workflows", []))
        }
        for t in TEMPLATES_CATALOG
    ]

@router.get("/{template_id}", response_model=Dict[str, Any])
async def get_template_details(template_id: str):
    tpl = next((t for t in TEMPLATES_CATALOG if t["id"] == template_id), None)
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found.")
    return tpl

@router.post("/{template_id}/instantiate", response_model=AppOut)
async def instantiate_template(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Instantiates an application from one of the 12 industry templates.
    Provisions pages, theme tokens, database tables, workflows, and sample products.
    """
    tpl = next((t for t in TEMPLATES_CATALOG if t["id"] == template_id), None)
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found.")

    suffix = uuid.uuid4().hex[:4]
    slug = f"{tpl['spec']['slug']}-{suffix}"

    app = App(
        tenant_id=current_user.tenant_id,
        name=tpl["name"],
        slug=slug,
        description=tpl["description"],
        draft_spec=tpl["spec"]
    )
    db.add(app)
    await db.flush()

    # Provision dynamic database tables
    for tbl in tpl.get("database_tables", []):
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
            field_rec = AppField(
                table_id=app_table.id,
                name=fld["name"],
                label=fld["label"],
                field_type=fld.get("field_type", "text"),
                is_required=fld.get("is_required", False),
                default_value=fld.get("default_value"),
                options=fld.get("options")
            )
            db.add(field_rec)

    # Provision workflows
    for wf in tpl.get("spec", {}).get("workflows", []):
        workflow_rec = Workflow(
            tenant_id=current_user.tenant_id,
            app_id=app.id,
            name=wf["name"],
            trigger_type=wf["trigger_type"],
            conditions=wf.get("conditions", []),
            actions=wf.get("actions", []),
            is_active=True
        )
        db.add(workflow_rec)

    # Provision starter products
    for p in tpl.get("starter_products", []):
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

