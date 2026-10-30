import pytest
import pytest_asyncio
import hmac
import hashlib
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import verify_telegram_init_data

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_auth_and_apps_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Login with seeded admin
        login_resp = await client.post("/api/auth/login", json={
            "email": "admin@miniforge.app",
            "password": "admin123"
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Check /api/auth/me
        me_resp = await client.get("/api/auth/me", headers=headers)
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == "admin@miniforge.app"

        # 3. Create a new App
        create_resp = await client.post("/api/apps", headers=headers, json={
            "name": "Boutique Bakery",
            "description": "Artisan pastries and breakfast goods",
            "icon": "Coffee"
        })
        assert create_resp.status_code == 200
        app_data = create_resp.json()
        app_id = app_data["id"]
        assert app_data["name"] == "Boutique Bakery"
        assert "pages" in app_data["draft_spec"]

        # 4. Publish Version Snapshot
        pub_resp = await client.post(f"/api/apps/{app_id}/publish", headers=headers, json={
            "changelog": "Initial public release"
        })
        assert pub_resp.status_code == 200
        assert pub_resp.json()["version_number"] == 1

        # 5. Fetch Public Runtime by Slug
        slug = app_data["slug"]
        pub_runtime_resp = await client.get(f"/api/apps/public/{slug}")
        assert pub_runtime_resp.status_code == 200
        pub_json = pub_runtime_resp.json()
        assert pub_json["version"] == 1
        assert len(pub_json["spec"]["pages"]) > 0

@pytest.mark.asyncio
async def test_database_studio_operations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        apps_resp = await client.get("/api/apps")
        apps = apps_resp.json()
        assert len(apps) > 0
        app_id = apps[0]["id"]

        # 1. Create custom table
        create_tbl_resp = await client.post(f"/api/apps/{app_id}/tables", json={
            "name": "catering_bookings",
            "display_name": "Catering Bookings",
            "description": "Custom customer event requests",
            "fields": [
                {"name": "client_name", "label": "Client Name", "field_type": "text", "is_required": True},
                {"name": "guest_count", "label": "Guest Count", "field_type": "number", "is_required": True},
                {"name": "event_date", "label": "Event Date", "field_type": "date", "is_required": False}
            ]
        })
        assert create_tbl_resp.status_code == 200
        tbl_data = create_tbl_resp.json()
        table_id = tbl_data["id"]

        # 2. Add record
        rec_resp = await client.post(f"/api/tables/{table_id}/records", json={
            "data": {
                "client_name": "Sophia Laurent",
                "guest_count": 80,
                "event_date": "2026-11-15"
            }
        })
        assert rec_resp.status_code == 200
        record_id = rec_resp.json()["id"]

        # 3. Query records
        list_recs_resp = await client.get(f"/api/tables/{table_id}/records?search=Sophia")
        assert list_recs_resp.status_code == 200
        recs = list_recs_resp.json()
        assert len(recs) == 1
        assert recs[0]["data"]["client_name"] == "Sophia Laurent"

@pytest.mark.asyncio
async def test_telegram_hmac_sha256_verification():
    bot_token = "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
    
    # Construct official Telegram initData payload
    data_dict = {
        "auth_date": "1730290000",
        "query_id": "AAHdF6IQAAAAAN0XohDhrkL1",
        "user": '{"id":987654321,"first_name":"Alex","username":"alexv"}'
    }
    
    # Build data_check_string: alphabetical sorted keys
    sorted_keys = sorted(data_dict.keys())
    data_check_string = "\n".join(f"{k}={data_dict[k]}" for k in sorted_keys)
    
    # Telegram secret key
    secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
    correct_hash = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()
    
    valid_init_data = f"auth_date={data_dict['auth_date']}&query_id={data_dict['query_id']}&user={data_dict['user']}&hash={correct_hash}"
    
    # Test valid verification with large max_age to allow static timestamp
    is_valid, parsed = verify_telegram_init_data(valid_init_data, bot_token, max_age_seconds=999999999)
    assert is_valid is True
    assert parsed["user"]["username"] == "alexv"
    
    # Test tampered data fails
    tampered_init_data = valid_init_data.replace("Alex", "Eve")
    is_tampered_valid, _ = verify_telegram_init_data(tampered_init_data, bot_token, max_age_seconds=999999999)
    assert is_tampered_valid is False

@pytest.mark.asyncio
async def test_pos_transaction_and_idempotency():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create an app specifically for POS testing
        app_resp = await client.post("/api/apps", json={"name": "POS Express"})
        app_id = app_resp.json()["id"]

        # Create a test product
        prod_create_resp = await client.post(f"/api/apps/{app_id}/pos/products", json={
            "name": "Matcha Croissant",
            "price": 4.50,
            "cost": 1.20,
            "stock_quantity": 25,
            "sku": "CRO-001"
        })
        assert prod_create_resp.status_code == 200
        product = prod_create_resp.json()
        product_id = product["id"]
        initial_stock = product["stock_quantity"]

        # Place order with unique idempotency key
        idem_key = f"checkout-{uuid.uuid4().hex}"
        order_payload = {
            "idempotency_key": idem_key,
            "items": [
                {"product_id": product_id, "quantity": 3}
            ],
            "customer_name": "Jordan Smith",
            "payment_method": "cash"
        }

        order_resp = await client.post(f"/api/apps/{app_id}/pos/orders", json=order_payload)
        assert order_resp.status_code == 200
        order = order_resp.json()
        assert float(order["total"]) > 0
        assert len(order["items"]) == 1

        # Check stock deducted: 25 - 3 = 22
        prods_resp = await client.get(f"/api/apps/{app_id}/pos/products")
        updated_prod = next(p for p in prods_resp.json() if p["id"] == product_id)
        assert updated_prod["stock_quantity"] == initial_stock - 3

        # Test Idempotency: Submit EXACT same idempotency key again
        order_resp_2 = await client.post(f"/api/apps/{app_id}/pos/orders", json=order_payload)
        assert order_resp_2.status_code == 200
        assert order_resp_2.json()["id"] == order["id"]

        # Ensure stock was NOT deducted again
        prods_resp_2 = await client.get(f"/api/apps/{app_id}/pos/products")
        updated_prod_2 = next(p for p in prods_resp_2.json() if p["id"] == product_id)
        assert updated_prod_2["stock_quantity"] == initial_stock - 3

@pytest.mark.asyncio
async def test_ai_spec_generation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        ai_resp = await client.post("/api/ai/generate", json={
            "prompt": "Build a gourmet gelato bar with flavor catalog and order pickup"
        })
        assert ai_resp.status_code == 200
        ai_data = ai_resp.json()
        assert "suggested_spec" in ai_data
        assert len(ai_data["suggested_spec"]["pages"]) >= 3
        assert len(ai_data["suggested_tables"]) >= 1

@pytest.mark.asyncio
async def test_blueprint_and_templates_instantiation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Test Templates Catalog
        tpl_resp = await client.get("/api/templates")
        assert tpl_resp.status_code == 200
        tpls = tpl_resp.json()
        assert len(tpls) >= 12
        restaurant_tpl = next(t for t in tpls if t["id"] == "restaurant")
        assert restaurant_tpl["category"] == "Food & Hospitality"

        # Instantiate from template
        inst_tpl = await client.post("/api/templates/restaurant/instantiate")
        assert inst_tpl.status_code == 200
        app_from_tpl = inst_tpl.json()
        assert "Artisan Restaurant" in app_from_tpl["name"]

        # 2. Test AI Blueprint Generation
        bp_resp = await client.post("/api/ai/blueprint", json={
            "prompt": "An artisan bakery and espresso cafe with takeaway ordering and table booking"
        })
        assert bp_resp.status_code == 200
        bp = bp_resp.json()
        assert bp["category"] == "Food & Hospitality"
        assert len(bp["sitemap"]) >= 3
        assert len(bp["database_tables"]) >= 1
        assert len(bp["clarifying_questions"]) >= 1

        # 3. Instantiate App from Blueprint
        inst_bp = await client.post("/api/ai/blueprint/instantiate", json={
            "blueprint": bp,
            "include_sample_data": True
        })
        assert inst_bp.status_code == 200
        app_from_bp = inst_bp.json()
        assert app_from_bp["id"] is not None
        assert app_from_bp["draft_spec"]["name"] == bp["app_name"]
