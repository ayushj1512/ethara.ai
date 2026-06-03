from datetime import datetime
from pydantic import BaseModel
from app.schemas.product import ProductResponse


class InventoryTransactionResponse(BaseModel):
    id: int
    product_id: int
    type: str
    quantity: int
    note: str | None
    created_at: datetime
    product: ProductResponse | None = None

    model_config = {"from_attributes": True}
