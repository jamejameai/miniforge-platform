import pytest
import pytest_asyncio
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.tenant import Tenant, User
from app.models.app import App
from app.models.pos import POSCategory, POSProduct
from app.api.apps import build_default_spec

@pytest_asyncio.fixture(autouse=True)
async def initialize_test_database():
    # Create all schema tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default tenant and user if not exists
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
            session.add(p1)
            await session.commit()

    yield
