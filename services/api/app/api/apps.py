import uuid
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.tenant import User
from app.models.app import App, AppVersion
from app.schemas.app import AppCreate, AppUpdate, AppOut, AppPublishRequest, AppVersionOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/apps", tags=["Applications"])

def build_default_spec(name: str, slug: str, template: str = "blank"):
    home_id = "page-home"
    return {
        "version": "1.0.0",
        "name": name,
        "slug": slug,
        "theme": {
            "primaryColor": "#D4146E",
            "primaryDark": "#171717",
            "backgroundColor": "#FFFFFF",
            "surfaceColor": "#F7F7F8",
            "borderColor": "#E8E8EA",
            "mutedTextColor": "#777777",
            "mainTextColor": "#171717",
            "fontFamily": "Inter, sans-serif",
            "borderRadius": "8px"
        },
        "navigation": {
            "type": "bottom_nav",
            "items": [
                { "id": "nav-1", "label": "Home", "pageId": home_id, "icon": "Home", "isVisible": True },
                { "id": "nav-2", "label": "Products", "pageId": "page-products", "icon": "Grid", "isVisible": True },
                { "id": "nav-3", "label": "Cart", "pageId": "page-cart", "icon": "ShoppingCart", "isVisible": True }
            ]
        },
        "pages": [
            {
                "id": home_id,
                "title": "Home",
                "slug": "/",
                "isHome": True,
                "components": [
                    {
                        "id": "hero-1",
                        "type": "HeroBanner",
                        "props": {
                            "title": f"Welcome to {name}",
                            "subtitle": "Discover quality products delivered swiftly.",
                            "badge": "Online Store",
                            "buttonText": "View Catalog",
                            "buttonAction": { "type": "NAVIGATE", "target": "page-products" }
                        }
                    },
                    {
                        "id": "heading-highlights",
                        "type": "SectionHeading",
                        "props": {
                            "title": "Popular Today",
                            "subtitle": "Customer favorites in high demand"
                        }
                    },
                    {
                        "id": "grid-highlights",
                        "type": "ProductGrid",
                        "props": {
                            "dataSource": "pos_products",
                            "columns": 2,
                            "limit": 4,
                            "showAddToCart": True
                        }
                    }
                ]
            },
            {
                "id": "page-products",
                "title": "Products",
                "slug": "/products",
                "isHome": False,
                "components": [
                    {
                        "id": "heading-catalog",
                        "type": "SectionHeading",
                        "props": {
                            "title": "Complete Catalog",
                            "subtitle": "Browse all available inventory"
                        }
                    },
                    {
                        "id": "grid-catalog",
                        "type": "ProductGrid",
                        "props": {
                            "dataSource": "pos_products",
                            "columns": 2,
                            "showAddToCart": True
                        }
                    }
                ]
            },
            {
                "id": "page-cart",
                "title": "Shopping Cart",
                "slug": "/cart",
                "isHome": False,
                "components": [
                    {
                        "id": "cart-view",
                        "type": "CartView",
                        "props": {
                            "emptyText": "Your cart is empty.",
                            "checkoutButtonText": "Proceed to Checkout"
                        }
                    }
                ]
            }
        ],
        "workflows": [
            {
                "id": "wf-order-notify",
                "name": "Order Confirmation Alert",
                "isActive": True,
                "trigger": { "type": "ORDER_CREATED" },
                "conditions": [
                    { "field": "total", "operator": "greater_than", "value": 0 }
                ],
                "actions": [
                    {
                        "type": "TELEGRAM_NOTIFICATION",
                        "params": {
                            "message": "Order #{{order_number}} confirmed! Total: ${{total}}"
                        }
                    }
                ]
            }
        ]
    }

@router.get("", response_model=List[AppOut])
async def list_apps(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(App).where(App.tenant_id == current_user.tenant_id).order_by(desc(App.created_at))
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=AppOut)
async def create_app(
    req: AppCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    slug = req.slug or re.sub(r"[^a-z0-9]+", "-", req.name.lower()).strip("-")
    # Verify slug uniqueness globally
    slug_stmt = select(App.id).where(App.slug == slug).limit(1)
    res = await db.execute(slug_stmt)
    if res.scalar():
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"

    draft_spec = build_default_spec(req.name, slug, req.template or "blank")

    app = App(
        tenant_id=current_user.tenant_id,
        name=req.name,
        slug=slug,
        description=req.description or "",
        icon=req.icon or "Sparkles",
        draft_spec=draft_spec
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)
    return app

@router.get("/{app_id}", response_model=AppOut)
async def get_app(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(App).where(App.id == app_id, App.tenant_id == current_user.tenant_id)
    res = await db.execute(stmt)
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    return app

@router.put("/{app_id}", response_model=AppOut)
async def update_app(
    app_id: str,
    req: AppUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(App).where(App.id == app_id, App.tenant_id == current_user.tenant_id)
    res = await db.execute(stmt)
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if req.name is not None:
        app.name = req.name
    if req.slug is not None:
        app.slug = req.slug
    if req.description is not None:
        app.description = req.description
    if req.icon is not None:
        app.icon = req.icon
    if req.draft_spec is not None:
        app.draft_spec = req.draft_spec

    await db.commit()
    await db.refresh(app)
    return app

@router.post("/{app_id}/duplicate", response_model=AppOut)
async def duplicate_app(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(App).where(App.id == app_id, App.tenant_id == current_user.tenant_id)
    res = await db.execute(stmt)
    source_app = res.scalar_one_or_none()
    if not source_app:
        raise HTTPException(status_code=404, detail="Source application not found.")

    new_name = f"{source_app.name} (Copy)"
    new_slug = f"{source_app.slug}-copy-{uuid.uuid4().hex[:4]}"

    new_app = App(
        tenant_id=current_user.tenant_id,
        name=new_name,
        slug=new_slug,
        description=source_app.description,
        icon=source_app.icon,
        draft_spec=source_app.draft_spec,
        is_published=False,
        active_version_number=0
    )
    db.add(new_app)
    await db.commit()
    await db.refresh(new_app)
    return new_app

@router.delete("/{app_id}")
async def delete_app(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(App).where(App.id == app_id, App.tenant_id == current_user.tenant_id)
    res = await db.execute(stmt)
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    await db.delete(app)
    await db.commit()
    return {"message": "Application deleted successfully."}

@router.post("/{app_id}/publish", response_model=AppVersionOut)
async def publish_app(
    app_id: str,
    req: AppPublishRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(App).where(App.id == app_id, App.tenant_id == current_user.tenant_id)
    res = await db.execute(stmt)
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    new_version_num = app.active_version_number + 1

    version = AppVersion(
        app_id=app.id,
        tenant_id=current_user.tenant_id,
        version_number=new_version_num,
        spec_json=app.draft_spec,
        changelog=req.changelog or f"Version {new_version_num} release",
        published_by=current_user.id
    )
    db.add(version)

    app.is_published = True
    app.active_version_number = new_version_num
    await db.commit()
    await db.refresh(version)
    return version

@router.get("/{app_id}/versions", response_model=List[AppVersionOut])
async def list_versions(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AppVersion).where(
        AppVersion.app_id == app_id,
        AppVersion.tenant_id == current_user.tenant_id
    ).order_by(desc(AppVersion.version_number))
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/{app_id}/rollback/{version_number}", response_model=AppOut)
async def rollback_version(
    app_id: str,
    version_number: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    app_stmt = select(App).where(App.id == app_id, App.tenant_id == current_user.tenant_id)
    app_res = await db.execute(app_stmt)
    app = app_res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    ver_stmt = select(AppVersion).where(
        AppVersion.app_id == app_id,
        AppVersion.tenant_id == current_user.tenant_id,
        AppVersion.version_number == version_number
    )
    ver_res = await db.execute(ver_stmt)
    version = ver_res.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail=f"Version {version_number} not found.")

    app.draft_spec = version.spec_json
    app.active_version_number = version_number
    await db.commit()
    await db.refresh(app)
    return app

# ==========================================
# Public Runtime Endpoint for Published App
# ==========================================
@router.get("/public/{slug}")
async def get_published_app_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Public runtime endpoint used by the MiniForge Runtime renderer.
    Returns the active published snapshot specification.
    """
    stmt = select(App).where(App.slug == slug).order_by(desc(App.created_at))
    res = await db.execute(stmt)
    app = res.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Published application not found.")

    if not app.is_published and app.active_version_number == 0:
        # Fallback to draft if previewing or testing
        spec = app.draft_spec
    else:
        ver_stmt = select(AppVersion).where(
            AppVersion.app_id == app.id,
            AppVersion.version_number == app.active_version_number
        )
        ver_res = await db.execute(ver_stmt)
        active_ver = ver_res.scalars().first()
        spec = active_ver.spec_json if active_ver else app.draft_spec

    return {
        "id": app.id,
        "name": app.name,
        "slug": app.slug,
        "version": app.active_version_number,
        "spec": spec
    }

