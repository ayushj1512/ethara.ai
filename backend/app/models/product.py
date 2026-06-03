from datetime import datetime
from sqlalchemy import DateTime, Enum, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(180))
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), index=True)
    price: Mapped[float] = mapped_column(Numeric(12, 2))
    stock_quantity: Mapped[int] = mapped_column(default=0)
    low_stock_threshold: Mapped[int] = mapped_column(default=5)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(Enum("active", "inactive", "out_of_stock", name="product_status"), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    inventory_transactions = relationship("InventoryTransaction", back_populates="product")
