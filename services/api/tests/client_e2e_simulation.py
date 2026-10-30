import httpx
import hmac
import hashlib
import json
import uuid
import time
import sys

BASE_URL = "http://localhost:8000"

def log(step: str, detail: str = ""):
    print(f"\n[CLIENT TEST] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"👉 STEP: {step}")
    if detail:
        print(f"   {detail}")

def assert_true(condition, msg):
    if not condition:
        print(f"❌ ASSERTION FAILED: {msg}")
        sys.exit(1)
    else:
        print(f"   ✓ {msg}")

def main():
    print("=" * 60)
    print("  MINIFORGE CLIENT SIMULATION & END-TO-END VERIFICATION")
    print("=" * 60)

    client = httpx.Client(base_url=BASE_URL, timeout=15.0)

    # 1. Health Check
    log("1. Checking System Health")
    health = client.get("/api/health")
    assert_true(health.status_code == 200, "Health check responded with status 200")
    assert_true(health.json()["status"] == "healthy", "System reports healthy")

    # 2. Client Authentication: Register New Client Account
    client_email = f"client_{uuid.uuid4().hex[:6]}@cafe.com"
    log("2. Client Registration & Authentication", f"Registering client email: {client_email}")
    reg_resp = client.post("/api/auth/register", json={
        "email": client_email,
        "password": "SecurePassword2026!",
        "full_name": "Elena Rostova",
        "tenant_name": "Rostova Artisan Group"
    })
    assert_true(reg_resp.status_code == 200, "Registration successful")
    token_data = reg_resp.json()
    token = token_data["access_token"]
    tenant_id = token_data["tenant_id"]
    headers = {"Authorization": f"Bearer {token}"}
    assert_true(bool(token), "Received Bearer JWT access token")

    # 3. Verify /api/auth/me
    log("3. Verify Identity & Permissions (/api/auth/me)")
    me_resp = client.get("/api/auth/me", headers=headers)
    assert_true(me_resp.status_code == 200, "Fetched user profile")
    me = me_resp.json()
    assert_true(me["email"] == client_email, f"Verified email matches: {me['email']}")
    assert_true(me["role"] == "owner", "Assigned owner role to tenant creator")

    # 4. Create New Application
    app_name = "Grand Milano Gelato & Espresso"
    log("4. Create Application", f"Creating application '{app_name}'")
    create_app_resp = client.post("/api/apps", headers=headers, json={
        "name": app_name,
        "description": "Artisanal Italian gelato, espresso pairings, and takeaway service.",
        "icon": "Coffee"
    })
    assert_true(create_app_resp.status_code == 200, "Application created")
    app = create_app_resp.json()
    app_id = app["id"]
    app_slug = app["slug"]
    assert_true(len(app["draft_spec"]["pages"]) >= 1, "App initialized with default draft spec")
    print(f"   App ID: {app_id} | Slug: {app_slug}")

    # 5. Visual Builder: Update App Spec Components & Add Page
    log("5. Visual Builder: Customize Components & Add Page")
    draft_spec = app["draft_spec"]
    
    # Add new component to Home page
    home_page = draft_spec["pages"][0]
    new_stat_comp = {
        "id": f"comp-stat-{uuid.uuid4().hex[:4]}",
        "type": "StatCard",
        "props": {
            "title": "Flavor Varieties",
            "value": "24 House Made",
            "change": "+4 seasonal",
            "isPositive": True
        }
    }
    home_page["components"].append(new_stat_comp)

    # Add a new page "Catering & Events"
    catering_page = {
        "id": f"page-catering-{uuid.uuid4().hex[:4]}",
        "title": "Catering & Events",
        "slug": "/catering",
        "isHome": False,
        "components": [
            {
                "id": f"comp-heading-{uuid.uuid4().hex[:4]}",
                "type": "SectionHeading",
                "props": {
                    "title": "Private Event Catering",
                    "subtitle": "Book our authentic gelato cart for your private event."
                }
            }
        ]
    }
    draft_spec["pages"].append(catering_page)

    update_spec_resp = client.put(f"/api/apps/{app_id}", headers=headers, json={
        "draft_spec": draft_spec
    })
    assert_true(update_spec_resp.status_code == 200, "Draft spec successfully updated in builder")
    updated_app = update_spec_resp.json()
    assert_true(len(updated_app["draft_spec"]["pages"]) == len(draft_spec["pages"]), "Page count verified")

    # 6. Database Studio: Create Custom Table, Add Fields, Records CRUD
    log("6. Database Studio: Create Custom Dynamic Table & Records")
    table_resp = client.post(f"/api/apps/{app_id}/tables", headers=headers, json={
        "name": "guest_reservations",
        "display_name": "Guest Reservations",
        "description": "Table bookings and special requests",
        "fields": [
            {"name": "guest_name", "label": "Guest Name", "field_type": "text", "is_required": True},
            {"name": "party_size", "label": "Party Size", "field_type": "number", "is_required": True},
            {"name": "reservation_time", "label": "Reservation Time", "field_type": "datetime", "is_required": False},
            {"name": "seating_preference", "label": "Seating", "field_type": "select", "default_value": "Patio"}
        ]
    })
    assert_true(table_resp.status_code == 200, "Database table created")
    table = table_resp.json()
    table_id = table["id"]
    assert_true(len(table["fields"]) >= 4, "Fields created and verified")

    # Insert Records into custom table
    rec1 = client.post(f"/api/tables/{table_id}/records", headers=headers, json={
        "data": {
            "guest_name": "Gianluigi Buffon",
            "party_size": 4,
            "reservation_time": "2026-11-01 19:30",
            "seating_preference": "Patio"
        }
    })
    assert_true(rec1.status_code == 200, "First record inserted")
    rec1_id = rec1.json()["id"]

    rec2 = client.post(f"/api/tables/{table_id}/records", headers=headers, json={
        "data": {
            "guest_name": "Chiara Ferragni",
            "party_size": 2,
            "reservation_time": "2026-11-01 20:15",
            "seating_preference": "VIP Indoor"
        }
    })
    assert_true(rec2.status_code == 200, "Second record inserted")

    # Bulk CSV/JSON import test
    bulk_resp = client.post(f"/api/tables/{table_id}/records/bulk", headers=headers, json=[
        {"guest_name": "Francesco Totti", "party_size": 6, "reservation_time": "2026-11-02 21:00", "seating_preference": "Main Dining"},
        {"guest_name": "Andrea Bocelli", "party_size": 2, "reservation_time": "2026-11-02 20:00", "seating_preference": "Terrace"}
    ])
    assert_true(bulk_resp.status_code == 200, "Bulk records import successful")
    assert_true(len(bulk_resp.json()) == 2, "Bulk imported 2 records into dynamic table")

    # Search records
    search_resp = client.get(f"/api/tables/{table_id}/records?search=Buffon", headers=headers)
    assert_true(search_resp.status_code == 200, "Search query returned 200")
    search_recs = search_resp.json()
    assert_true(len(search_recs) == 1 and search_recs[0]["data"]["guest_name"] == "Gianluigi Buffon", "Record search verified")

    # 7. POS Studio: Products, Stock Movements, Transactional Checkout
    log("7. POS Studio: Catalog, Stock Deduction, Idempotency Check")
    prod1_resp = client.post(f"/api/apps/{app_id}/pos/products", headers=headers, json={
        "name": "Pistachio Bronte Gelato (Cup)",
        "price": 6.50,
        "cost": 1.90,
        "stock_quantity": 40,
        "sku": "GEL-PST-01",
        "image_url": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400"
    })
    assert_true(prod1_resp.status_code == 200, "Product 1 created")
    p1 = prod1_resp.json()
    p1_id = p1["id"]

    prod2_resp = client.post(f"/api/apps/{app_id}/pos/products", headers=headers, json={
        "name": "Double Ristretto Espresso",
        "price": 3.75,
        "cost": 0.80,
        "stock_quantity": 80,
        "sku": "ESP-DBL-02",
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400"
    })
    assert_true(prod2_resp.status_code == 200, "Product 2 created")
    p2 = prod2_resp.json()
    p2_id = p2["id"]

    # Place an order
    order_idempotency_key = f"order-client-{uuid.uuid4().hex}"
    order_payload = {
        "idempotency_key": order_idempotency_key,
        "customer_name": "Marco Verratti",
        "payment_method": "cash",
        "items": [
            {"product_id": p1_id, "quantity": 2}, # 2 * 6.50 = 13.00
            {"product_id": p2_id, "quantity": 1}  # 1 * 3.75 = 3.75 -> Subtotal = 16.75
        ]
    }
    order_resp = client.post(f"/api/apps/{app_id}/pos/orders", headers=headers, json={
        **order_payload
    })
    assert_true(order_resp.status_code == 200, "POS order placed successfully")
    order = order_resp.json()
    assert_true(float(order["subtotal"]) == 16.75, f"Verified subtotal: ${order['subtotal']}")
    assert_true(float(order["total"]) > 16.75, f"Verified total with tax: ${order['total']}")

    # Verify Stock Deduction: Product 1 had 40 -> now 38
    p1_check = client.get(f"/api/apps/{app_id}/pos/products", headers=headers)
    p1_updated = next(p for p in p1_check.json() if p["id"] == p1_id)
    assert_true(p1_updated["stock_quantity"] == 38, f"Product 1 stock accurately deducted to {p1_updated['stock_quantity']}")

    # Idempotency Test: Submit exact same order payload again
    order_dup_resp = client.post(f"/api/apps/{app_id}/pos/orders", headers=headers, json={
        **order_payload
    })
    assert_true(order_dup_resp.status_code == 200, "Duplicate idempotency call succeeded without error")
    assert_true(order_dup_resp.json()["id"] == order["id"], "Returned exact same order ID")
    # Verify stock was NOT deducted twice
    p1_check_2 = client.get(f"/api/apps/{app_id}/pos/products", headers=headers)
    p1_updated_2 = next(p for p in p1_check_2.json() if p["id"] == p1_id)
    assert_true(p1_updated_2["stock_quantity"] == 38, "Stock was NOT deducted twice (Idempotency verified)")

    # 8. Telegram Bot Studio & Cryptographic Verification
    log("8. Telegram Bot Studio & HMAC-SHA256 Signature Verification")
    test_token = "TEST_TOKEN_MILANO_GELATO_BOT"
    connect_bot_resp = client.post(f"/api/apps/{app_id}/bot/connect", headers=headers, json={
        "bot_token": test_token
    })
    assert_true(connect_bot_resp.status_code == 200, "Telegram bot connected with encrypted token")
    bot_status = connect_bot_resp.json()
    assert_true(bot_status["is_connected"] is True, "Bot status is connected")

    # Test Telegram WebApp initData HMAC verification
    data_dict = {
        "auth_date": str(int(time.time())),
        "query_id": "AAHf9281AAAAAN0XohDhrkL1",
        "user": json.dumps({"id": 11223344, "first_name": "Leonardo", "username": "leodavinci"})
    }
    sorted_keys = sorted(data_dict.keys())
    data_check_string = "\n".join(f"{k}={data_dict[k]}" for k in sorted_keys)
    secret_key = hmac.new(b"WebAppData", test_token.encode("utf-8"), hashlib.sha256).digest()
    calc_hash = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()
    valid_init_data = f"auth_date={data_dict['auth_date']}&query_id={data_dict['query_id']}&user={data_dict['user']}&hash={calc_hash}"

    verify_resp = client.post(f"/api/apps/{app_id}/bot/verify-telegram", json={"init_data": valid_init_data})
    assert_true(verify_resp.status_code == 200, "Verification endpoint reachable")
    verify_json = verify_resp.json()
    assert_true(verify_json["is_valid"] is True, "Telegram cryptographic signature validated successfully")
    assert_true(verify_json["telegram_user"]["username"] == "leodavinci", "Telegram user payload extracted")
    assert_true(bool(verify_json["session_token"]), "Generated authenticated customer session token")

    # 9. Workflow Studio: Pipeline Definition & Test Run
    log("9. Workflow Studio: Trigger -> Condition -> Action Automation")
    wf_resp = client.post(f"/api/apps/{app_id}/workflows", headers=headers, json={
        "name": "Notify On High Value Order",
        "trigger_type": "ORDER_CREATED",
        "conditions": [
            {"field": "total", "operator": "greater_than", "value": 10.0}
        ],
        "actions": [
            {
                "type": "TELEGRAM_NOTIFICATION",
                "params": {"message": "High value order #{{order_number}} placed! Total: ${{total}}"}
            }
        ]
    })
    assert_true(wf_resp.status_code == 200, "Workflow created")
    wf = wf_resp.json()
    wf_id = wf["id"]

    # Test Run Workflow
    run_test_resp = client.post(f"/api/workflows/{wf_id}/run-test", headers=headers, json={
        "trigger_payload": {
            "order_number": "ORD-12345",
            "total": 24.50,
            "customer_telegram_id": "11223344"
        }
    })
    assert_true(run_test_resp.status_code == 200, "Workflow execution completed")
    run_res = run_test_resp.json()
    assert_true(run_res["status"] == "SUCCESS", f"Workflow execution status: {run_res['status']}")
    assert_true(run_res["actions_executed"] == 1, "Action dispatched")

    # Test Workflow Pause Toggle
    toggle_resp = client.put(f"/api/workflows/{wf_id}", headers=headers, json={"is_active": False})
    assert_true(toggle_resp.status_code == 200, "Workflow paused successfully")
    assert_true(toggle_resp.json()["is_active"] is False, "Workflow status updated to paused")

    # 10. AI Studio: Prompt-to-AppSpec Generation & Apply
    log("10. AI Studio: Prompt-to-Specification Generation & Apply")
    ai_resp = client.post("/api/ai/generate", headers=headers, json={
        "prompt": "Build an authentic Neapolitan Pizzeria with wood-fired pizzas, beverage pairings, and table reservations"
    })
    assert_true(ai_resp.status_code == 200, "AI successfully synthesized application specification")
    ai_spec = ai_resp.json()
    assert_true(len(ai_spec["suggested_spec"]["pages"]) >= 3, "AI generated 3+ functional pages")
    assert_true(len(ai_spec["suggested_tables"]) >= 1, "AI generated suggested database tables")

    # Apply AI Spec to application
    apply_resp = client.post(f"/api/ai/apply/{app_id}", headers=headers, json=ai_spec["suggested_spec"])
    assert_true(apply_resp.status_code == 200, "Applied AI spec directly to draft application")

    # 11. Publishing & Public Runtime Verification
    log("11. Publishing Snapshot & Standalone/Telegram Runtime Check")
    pub_resp = client.post(f"/api/apps/{app_id}/publish", headers=headers, json={
        "changelog": "Initial public commercial release"
    })
    assert_true(pub_resp.status_code == 200, "Published snapshot version 1")
    pub_data = pub_resp.json()
    assert_true(pub_data["version_number"] == 1, "Version number set to 1")

    # Query Public Runtime Endpoint (What users see when browsing /r/:slug or /tg/:slug)
    runtime_resp = client.get(f"/api/apps/public/{app_slug}")
    assert_true(runtime_resp.status_code == 200, "Public runtime endpoint accessible without auth")
    runtime_json = runtime_resp.json()
    assert_true(runtime_json["version"] == 1, "Public runtime serves published snapshot version")
    assert_true(runtime_json["name"] == app_name, f"Verified application name: {runtime_json['name']}")

    # 12. Version Rollback Test
    log("12. Version History & Rollback Verification")
    # Make a draft change and publish Version 2
    client.put(f"/api/apps/{app_id}", headers=headers, json={"name": f"{app_name} V2"})
    pub2_resp = client.post(f"/api/apps/{app_id}/publish", headers=headers, json={"changelog": "Release v2"})
    assert_true(pub2_resp.json()["version_number"] == 2, "Published version 2")

    # Roll back to version 1
    rollback_resp = client.post(f"/api/apps/{app_id}/rollback/1", headers=headers)
    assert_true(rollback_resp.status_code == 200, "Rollback to version 1 succeeded")
    assert_true(rollback_resp.json()["active_version_number"] == 1, "Active version reverted to 1")

    print("\n" + "=" * 60)
    print("  🎉 ALL 12 CLIENT END-TO-END STAGES VERIFIED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    main()
