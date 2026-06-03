from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    status: Mapped[str] = mapped_column(Enum("pending", "confirmed", "packed", "shipped", "delivered", "cancelled", name="order_status"), default="pending")
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2))
    shipping_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    shipping_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    shipping_address_line1: Mapped[str | None] = mapped_column(String(180), nullable=True)
    shipping_address_line2: Mapped[str | None] = mapped_column(String(180), nullable=True)
    shipping_city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    shipping_state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    shipping_postal_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    shipping_country: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    customer = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    @property
    def subtotal_amount(self) -> float:
        return round(sum(float(item.line_total or 0) for item in self.items), 2)

    @property
    def discount_amount(self) -> float:
        return round(max(self.subtotal_amount - float(self.total_amount or 0), 0), 2)

    @property
    def discount_rate(self) -> float:
        return round(self.discount_amount / self.subtotal_amount, 2) if self.subtotal_amount else 0.0


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    sku: Mapped[str] = mapped_column(String(80))
    product_name: Mapped[str] = mapped_column(String(180))
    quantity: Mapped[int]
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2))
    line_total: Mapped[float] = mapped_column(Numeric(12, 2))

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
