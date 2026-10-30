from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.tenant import User
from app.models.app import App
from app.models.pos import POSCategory, POSProduct, POSOrder, POSOrderItem, InventoryMovement
from app.schemas.pos import (
    CategoryCreate, CategoryOut,
    ProductCreate, ProductUpdate, ProductOut,
    OrderCreate, OrderOut, OrderItemOut,
    StockMovementIn, StockMovementOut
)
from app.services.pos_service import POSService
from app.api.deps import get_current_user

router = APIRouter(tags=["POS & Inventory Studio"])

# ==========================================
# Categories
# ==========================================
@router.get("/apps/{app_id}/pos/categories", response_model=List[CategoryOut])
async def list_categories(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(POSCategory).where(
        POSCategory.app_id == app_id,
        POSCategory.tenant_id == current_user.tenant_id
    ).order_by(POSCategory.sort_order)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/apps/{app_id}/pos/categories", response_model=CategoryOut)
async def create_category(
    app_id: str,
    req: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    cat = POSCategory(
        tenant_id=current_user.tenant_id,
        app_id=app_id,
        name=req.name,
        sort_order=req.sort_order
    )
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat

# ==========================================
# Products
# ==========================================
@router.get("/apps/{app_id}/pos/products", response_model=List[ProductOut])
async def list_products(
    app_id: str,
    category_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(POSProduct).where(
        POSProduct.app_id == app_id,
        POSProduct.tenant_id == current_user.tenant_id
    )
    if category_id:
        stmt = stmt.where(POSProduct.category_id == category_id)
    stmt = stmt.order_by(POSProduct.name)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/apps/{app_id}/pos/products", response_model=ProductOut)
async def create_product(
    app_id: str,
    req: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    product = POSProduct(
        tenant_id=current_user.tenant_id,
        app_id=app_id,
        category_id=req.category_id,
        name=req.name,
        description=req.description or "",
        sku=req.sku or "",
        barcode=req.barcode or "",
        price=req.price,
        cost=req.cost,
        stock_quantity=req.stock_quantity,
        low_stock_threshold=req.low_stock_threshold,
        image_url=req.image_url or ""
    )
    db.add(product)
    await db.flush()

    # Log initial inventory movement if quantity > 0
    if req.stock_quantity > 0:
        movement = InventoryMovement(
            tenant_id=current_user.tenant_id,
            product_id=product.id,
            movement_type="IN",
            quantity_delta=req.stock_quantity,
            quantity_after=req.stock_quantity,
            notes="Initial stock entry"
        )
        db.add(movement)

    await db.commit()
    await db.refresh(product)
    return product

@router.put("/pos/products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    req: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(POSProduct).where(
        POSProduct.id == product_id,
        POSProduct.tenant_id == current_user.tenant_id
    )
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    for k, v in req.model_dump(exclude_unset=True).items():
        setattr(product, k, v)

    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/pos/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(POSProduct).where(
        POSProduct.id == product_id,
        POSProduct.tenant_id == current_user.tenant_id
    )
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted successfully."}

# ==========================================
# Orders & Checkout (Transactional)
# ==========================================
@router.post("/apps/{app_id}/pos/orders", response_model=OrderOut)
async def place_order(
    app_id: str,
    req: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Transactional order placement with idempotency check and stock deduction.
    """
    order = await POSService.create_order(
        db=db,
        tenant_id=current_user.tenant_id,
        app_id=app_id,
        order_in=req
    )

    # Load order items
    items_stmt = select(POSOrderItem).where(POSOrderItem.order_id == order.id)
    items_res = await db.execute(items_stmt)
    items = items_res.scalars().all()

    return OrderOut(
        id=order.id,
        app_id=order.app_id,
        order_number=order.order_number,
        idempotency_key=order.idempotency_key,
        customer_name=order.customer_name,
        customer_telegram_id=order.customer_telegram_id,
        subtotal=order.subtotal,
        tax=order.tax,
        discount=order.discount,
        total=order.total,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        order_status=order.order_status,
        notes=order.notes,
        items=[OrderItemOut.model_validate(it) for it in items],
        created_at=order.created_at
    )

@router.get("/apps/{app_id}/pos/orders", response_model=List[OrderOut])
async def list_orders(
    app_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(POSOrder).where(
        POSOrder.app_id == app_id,
        POSOrder.tenant_id == current_user.tenant_id
    ).order_by(desc(POSOrder.created_at)).limit(limit)
    res = await db.execute(stmt)
    orders = res.scalars().all()

    out = []
    for o in orders:
        items_stmt = select(POSOrderItem).where(POSOrderItem.order_id == o.id)
        items_res = await db.execute(items_stmt)
        items = items_res.scalars().all()
        out.append(OrderOut(
            id=o.id,
            app_id=o.app_id,
            order_number=o.order_number,
            idempotency_key=o.idempotency_key,
            customer_name=o.customer_name,
            customer_telegram_id=o.customer_telegram_id,
            subtotal=o.subtotal,
            tax=o.tax,
            discount=o.discount,
            total=o.total,
            payment_method=o.payment_method,
            payment_status=o.payment_status,
            order_status=o.order_status,
            notes=o.notes,
            items=[OrderItemOut.model_validate(it) for it in items],
            created_at=o.created_at
        ))
    return out

# ==========================================
# Inventory Movement Ledger
# ==========================================
@router.get("/apps/{app_id}/pos/inventory/movements", response_model=List[StockMovementOut])
async def list_inventory_movements(
    app_id: str,
    product_id: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(InventoryMovement).where(
        InventoryMovement.tenant_id == current_user.tenant_id
    )
    if product_id:
        stmt = stmt.where(InventoryMovement.product_id == product_id)
    stmt = stmt.order_by(desc(InventoryMovement.created_at)).limit(limit)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/apps/{app_id}/pos/inventory/adjust", response_model=StockMovementOut)
async def adjust_inventory(
    app_id: str,
    req: StockMovementIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    prod_stmt = select(POSProduct).where(
        POSProduct.id == req.product_id,
        POSProduct.tenant_id == current_user.tenant_id,
        POSProduct.app_id == app_id
    )
    prod_res = await db.execute(prod_stmt)
    product = prod_res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    new_stock = product.stock_quantity + req.quantity_delta
    if new_stock < 0:
        raise HTTPException(status_code=400, detail="Stock quantity cannot be reduced below zero.")

    product.stock_quantity = new_stock

    movement = InventoryMovement(
        tenant_id=current_user.tenant_id,
        product_id=product.id,
        movement_type=req.movement_type,
        quantity_delta=req.quantity_delta,
        quantity_after=new_stock,
        notes=req.notes or f"Manual stock adjustment by {current_user.full_name}"
    )
    db.add(movement)
    await db.commit()
    await db.refresh(movement)
    return movement
