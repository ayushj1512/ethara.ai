from datetime import datetime
from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    sku: str = Field(min_length=2, max_length=80)
    description: str | None = None
    category: str = Field(min_length=2, max_length=100)
    price: float = Field(ge=0)
    stock_quantity: int = Field(ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)
    image_url: str | None = None
    status: str = "active"


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    description: str | None = None
    category: str | None = None
    price: float | None = Field(default=None, ge=0)
    stock_quantity: int | None = Field(default=None, ge=0)
    low_stock_threshold: int | None = Field(default=None, ge=0)
    image_url: str | None = None
    status: str | None = None


class StockUpdate(BaseModel):
    quantity: int
    type: str = Field(pattern="^(stock_in|stock_out|adjustment)$")
    note: str | None = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
