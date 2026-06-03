from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.product import ProductResponse


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    sku: str
    product_name: str
    quantity: int
    unit_price: float
    line_total: float
    product: ProductResponse | None = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: int
    status: str
    subtotal_amount: float
    discount_rate: float
    discount_amount: float
    total_amount: float
    shipping_name: str | None
    shipping_phone: str | None
    shipping_address_line1: str | None
    shipping_address_line2: str | None
    shipping_city: str | None
    shipping_state: str | None
    shipping_postal_code: str | None
    shipping_country: str | None
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemResponse]

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|confirmed|packed|shipped|delivered|cancelled)$")
