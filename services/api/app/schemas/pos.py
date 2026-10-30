from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

class CategoryCreate(BaseModel):
    name: str
    sort_order: int = 0

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    app_id: str
    name: str
    sort_order: int

class ProductCreate(BaseModel):
    name: str
    category_id: Optional[str] = None
    description: Optional[str] = ""
    sku: Optional[str] = ""
    barcode: Optional[str] = ""
    price: Decimal = Decimal("0.00")
    cost: Decimal = Decimal("0.00")
    stock_quantity: int = 0
    low_stock_threshold: int = 5
    image_url: Optional[str] = ""

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    price: Optional[Decimal] = None
    cost: Optional[Decimal] = None
    stock_quantity: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    app_id: str
    category_id: Optional[str]
    name: str
    description: Optional[str]
    sku: Optional[str]
    barcode: Optional[str]
    price: Decimal
    cost: Decimal
    stock_quantity: int
    low_stock_threshold: int
    image_url: Optional[str]
    is_active: bool
    created_at: datetime

class OrderItemIn(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)

class OrderCreate(BaseModel):
    idempotency_key: str
    items: List[OrderItemIn]
    customer_name: Optional[str] = "Customer"
    customer_telegram_id: Optional[str] = None
    payment_method: Optional[str] = "cash"
    notes: Optional[str] = ""

class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: Optional[str]
    product_name: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    app_id: str
    order_number: str
    idempotency_key: str
    customer_name: str
    customer_telegram_id: Optional[str]
    subtotal: Decimal
    tax: Decimal
    discount: Decimal
    total: Decimal
    payment_method: str
    payment_status: str
    order_status: str
    notes: Optional[str]
    items: List[OrderItemOut] = []
    created_at: datetime

class StockMovementIn(BaseModel):
    product_id: str
    movement_type: str # IN, OUT, ADJUSTMENT
    quantity_delta: int
    notes: Optional[str] = ""

class StockMovementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    movement_type: str
    quantity_delta: int
    quantity_after: int
    reference_id: Optional[str]
    notes: Optional[str]
    created_at: datetime
