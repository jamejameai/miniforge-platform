import uuid
from decimal import Decimal
from typing import List, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.pos import POSProduct, POSOrder, POSOrderItem, InventoryMovement
from app.schemas.pos import OrderCreate

class POSService:
    @staticmethod
    async def create_order(
        db: AsyncSession,
        tenant_id: str,
        app_id: str,
        order_in: OrderCreate
    ) -> POSOrder:
        """
        Creates an order with idempotency check, stock verification,
        atomic inventory deduction, and movement ledger logging.
        """
        # 1. Idempotency Check
        stmt = select(POSOrder).where(
            POSOrder.tenant_id == tenant_id,
            POSOrder.idempotency_key == order_in.idempotency_key
        )
        result = await db.execute(stmt)
        existing_order = result.scalar_one_or_none()
        if existing_order:
            # Already created, return idempotently
            return existing_order

        if not order_in.items:
            raise HTTPException(status_code=400, detail="Order must contain at least one item.")

        # 2. Fetch products and verify stock
        subtotal = Decimal("0.00")
        order_items_to_create = []
        movements_to_create = []

        for item_in in order_in.items:
            prod_stmt = select(POSProduct).where(
                POSProduct.id == item_in.product_id,
                POSProduct.tenant_id == tenant_id,
                POSProduct.app_id == app_id
            )
            prod_res = await db.execute(prod_stmt)
            product = prod_res.scalar_one_or_none()

            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item_in.product_id} not found.")

            if not product.is_active:
                raise HTTPException(status_code=400, detail=f"Product {product.name} is not available for purchase.")

            if product.stock_quantity < item_in.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}, requested: {item_in.quantity}"
                )

            item_total = product.price * Decimal(item_in.quantity)
            subtotal += item_total

            # Atomic Stock Deduction
            product.stock_quantity -= item_in.quantity

            order_items_to_create.append({
                "product_id": product.id,
                "product_name": product.name,
                "quantity": item_in.quantity,
                "unit_price": product.price,
                "total_price": item_total
            })

            # Record Inventory Movement
            movements_to_create.append(
                InventoryMovement(
                    tenant_id=tenant_id,
                    product_id=product.id,
                    movement_type="SALE",
                    quantity_delta=-item_in.quantity,
                    quantity_after=product.stock_quantity,
                    notes=f"Order sale (idempotency: {order_in.idempotency_key[:8]})"
                )
            )

        tax = (subtotal * Decimal("0.05")).quantize(Decimal("0.01")) # 5% tax
        discount = Decimal("0.00")
        total = subtotal + tax - discount

        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"

        new_order = POSOrder(
            tenant_id=tenant_id,
            app_id=app_id,
            order_number=order_number,
            idempotency_key=order_in.idempotency_key,
            customer_name=order_in.customer_name or "Guest",
            customer_telegram_id=order_in.customer_telegram_id,
            subtotal=subtotal,
            tax=tax,
            discount=discount,
            total=total,
            payment_method=order_in.payment_method or "cash",
            payment_status="paid" if order_in.payment_method == "cash" else "pending",
            order_status="completed",
            notes=order_in.notes or ""
        )
        db.add(new_order)
        await db.flush()

        for item_data in order_items_to_create:
            order_item = POSOrderItem(
                order_id=new_order.id,
                **item_data
            )
            db.add(order_item)

        for movement in movements_to_create:
            movement.reference_id = new_order.id
            db.add(movement)

        await db.commit()
        await db.refresh(new_order)
        return new_order
