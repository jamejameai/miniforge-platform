import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Numeric, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class POSCategory(Base):
    __tablename__ = "pos_categories"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    tenant_id = Column(String(36), nullable=False, index=True)
    app_id = Column(String(36), ForeignKey("apps.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    products = relationship("POSProduct", back_populates="category")

class POSProduct(Base):
    __tablename__ = "pos_products"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    tenant_id = Column(String(36), nullable=False, index=True)
    app_id = Column(String(36), ForeignKey("apps.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("pos_categories.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    sku = Column(String(64), index=True, default="")
    barcode = Column(String(64), index=True, default="")
    price = Column(Numeric(10, 2), nullable=False, default=0.00)
    cost = Column(Numeric(10, 2), nullable=False, default=0.00)
    stock_quantity = Column(Integer, nullable=False, default=0)
    low_stock_threshold = Column(Integer, default=5)
    image_url = Column(String(512), default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    app = relationship("App", back_populates="products")
    category = relationship("POSCategory", back_populates="products")
    movements = relationship("InventoryMovement", back_populates="product", cascade="all, delete-orphan")

class POSOrder(Base):
    __tablename__ = "pos_orders"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    tenant_id = Column(String(36), nullable=False, index=True)
    app_id = Column(String(36), ForeignKey("apps.id", ondelete="CASCADE"), nullable=False, index=True)
    order_number = Column(String(32), unique=True, nullable=False)
    idempotency_key = Column(String(128), unique=True, index=True, nullable=False)
    customer_name = Column(String(128), default="Guest")
    customer_telegram_id = Column(String(64), nullable=True)
    subtotal = Column(Numeric(10, 2), nullable=False, default=0.00)
    tax = Column(Numeric(10, 2), nullable=False, default=0.00)
    discount = Column(Numeric(10, 2), nullable=False, default=0.00)
    total = Column(Numeric(10, 2), nullable=False, default=0.00)
    payment_method = Column(String(32), default="cash") # cash, telegram_pay, card
    payment_status = Column(String(32), default="pending") # pending, paid, refunded
    order_status = Column(String(32), default="completed") # pending, preparing, completed, cancelled
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    app = relationship("App", back_populates="orders")
    items = relationship("POSOrderItem", back_populates="order", cascade="all, delete-orphan")

class POSOrderItem(Base):
    __tablename__ = "pos_order_items"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    order_id = Column(String(36), ForeignKey("pos_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("pos_products.id", ondelete="SET NULL"), nullable=True)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)

    order = relationship("POSOrder", back_populates="items")

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    tenant_id = Column(String(36), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("pos_products.id", ondelete="CASCADE"), nullable=False, index=True)
    movement_type = Column(String(32), nullable=False) # IN, OUT, ADJUSTMENT, SALE, RETURN
    quantity_delta = Column(Integer, nullable=False) # e.g. -3 for sale, +20 for purchase
    quantity_after = Column(Integer, nullable=False)
    reference_id = Column(String(64), nullable=True) # order_id or batch_id
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    product = relationship("POSProduct", back_populates="movements")

