from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(Enum("stock_in", "stock_out", "order_deduction", "adjustment", name="inventory_type"))
    quantity: Mapped[int]
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="inventory_transactions")
