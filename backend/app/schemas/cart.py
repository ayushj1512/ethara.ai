from pydantic import BaseModel, Field
from app.schemas.product import ProductResponse


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: ProductResponse
    line_total: float

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    id: int
    customer_id: int
    items: list[CartItemResponse]
    subtotal_amount: float
    discount_rate: float
    discount_amount: float
    discount_applied: bool
    total_amount: float

    model_config = {"from_attributes": True}
