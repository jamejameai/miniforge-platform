import contextlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.tenant import Tenant, User
from app.models.app import App
from app.models.pos import POSCategory, POSProduct
from app.api.auth import router as auth_router
from app.api.apps import router as apps_router
from app.api.database_studio import router as db_studio_router
from app.api.telegram import router as telegram_router
from app.api.pos import router as pos_router
from app.api.workflows import router as workflows_router
from app.api.ai import router as ai_router

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default tenant and user if empty
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        res = await session.execute(select(Tenant).limit(1))
        if not res.scalar_one_or_none():
            demo_tenant = Tenant(
                name="Acme Global",
                slug="acme-global"
            )
            session.add(demo_tenant)
            await session.flush()

            demo_user = User(
                tenant_id=demo_tenant.id,
                email="admin@miniforge.app",
                hashed_password=get_password_hash("admin123"),
                full_name="Alex Vance",
                role="owner"
            )
            session.add(demo_user)
            await session.flush()

            # Seed default application
            from app.api.apps import build_default_spec
            spec = build_default_spec("Artisan Roast & Goods", "artisan-roast")
            demo_app = App(
                tenant_id=demo_tenant.id,
                name="Artisan Roast & Goods",
                slug="artisan-roast",
                description="Specialty coffee and artisan baked goods.",
                icon="Coffee",
                draft_spec=spec,
                is_published=True,
                active_version_number=1
            )
            session.add(demo_app)
            await session.flush()

            # Seed POS items
            cat = POSCategory(
                tenant_id=demo_tenant.id,
                app_id=demo_app.id,
                name="Beverages",
                sort_order=1
            )
            session.add(cat)
            await session.flush()

            p1 = POSProduct(
                tenant_id=demo_tenant.id,
                app_id=demo_app.id,
                category_id=cat.id,
                name="Single Origin Pour Over",
                description="Ethiopian Yirgacheffe with floral citrus notes.",
                sku="COF-ETH-01",
                price=5.50,
                cost=1.80,
                stock_quantity=45,
                image_url="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80"
            )
            p2 = POSProduct(
                tenant_id=demo_tenant.id,
                app_id=demo_app.id,
                category_id=cat.id,
                name="Matcha Oat Latte",
                description="Ceremonial grade Uji matcha with steamed oat milk.",
                sku="BEV-MAT-02",
                price=6.00,
                cost=2.10,
                stock_quantity=30,
                image_url="https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80"
            )
            session.add_all([p1, p2])
            await session.commit()

    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title="MiniForge Platform API",
    description="Backend API powering MiniForge Studio and Runtime",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router, prefix="/api")
app.include_router(apps_router, prefix="/api")
app.include_router(db_studio_router, prefix="/api")
app.include_router(telegram_router, prefix="/api")
app.include_router(pos_router, prefix="/api")
app.include_router(workflows_router, prefix="/api")
app.include_router(ai_router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "MiniForge API",
        "version": "1.0.0"
    }

