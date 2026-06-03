"""initial schema

Revision ID: 20260602_0001
Revises:
Create Date: 2026-06-02
"""
from alembic import op
import sqlalchemy as sa

revision = "20260602_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("users", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("full_name", sa.String(120), nullable=False), sa.Column("email", sa.String(255), nullable=False), sa.Column("password_hash", sa.String(255), nullable=False), sa.Column("phone", sa.String(40)), sa.Column("role", sa.Enum("customer", "admin", name="user_role"), nullable=False), sa.Column("is_active", sa.Boolean(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table("products", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("name", sa.String(180), nullable=False), sa.Column("sku", sa.String(80), nullable=False), sa.Column("description", sa.Text()), sa.Column("category", sa.String(100), nullable=False), sa.Column("price", sa.Numeric(12, 2), nullable=False), sa.Column("stock_quantity", sa.Integer(), nullable=False), sa.Column("low_stock_threshold", sa.Integer(), nullable=False), sa.Column("image_url", sa.String(500)), sa.Column("status", sa.Enum("active", "inactive", "out_of_stock", name="product_status"), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_products_sku", "products", ["sku"], unique=True)
    op.create_table("sessions", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE")), sa.Column("token_id", sa.String(80), nullable=False), sa.Column("device_info", sa.String(255)), sa.Column("ip_address", sa.String(80)), sa.Column("is_active", sa.Boolean(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("last_activity_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False))
    op.create_index("ix_sessions_token_id", "sessions", ["token_id"], unique=True)
    op.create_table("carts", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("customer_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("inventory_transactions", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id", ondelete="CASCADE")), sa.Column("type", sa.Enum("stock_in", "stock_out", "order_deduction", "adjustment", name="inventory_type"), nullable=False), sa.Column("quantity", sa.Integer(), nullable=False), sa.Column("note", sa.String(255)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("orders", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("order_number", sa.String(40), nullable=False), sa.Column("customer_id", sa.Integer(), sa.ForeignKey("users.id")), sa.Column("status", sa.Enum("pending", "confirmed", "packed", "shipped", "delivered", "cancelled", name="order_status"), nullable=False), sa.Column("total_amount", sa.Numeric(12, 2), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_orders_order_number", "orders", ["order_number"], unique=True)
    op.create_table("cart_items", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("cart_id", sa.Integer(), sa.ForeignKey("carts.id", ondelete="CASCADE")), sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id", ondelete="CASCADE")), sa.Column("quantity", sa.Integer(), nullable=False), sa.Column("unit_price", sa.Numeric(12, 2), nullable=False), sa.UniqueConstraint("cart_id", "product_id", name="uq_cart_product"))
    op.create_table("order_items", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE")), sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id")), sa.Column("sku", sa.String(80), nullable=False), sa.Column("product_name", sa.String(180), nullable=False), sa.Column("quantity", sa.Integer(), nullable=False), sa.Column("unit_price", sa.Numeric(12, 2), nullable=False), sa.Column("line_total", sa.Numeric(12, 2), nullable=False))


def downgrade() -> None:
    for table in ["order_items", "cart_items", "orders", "inventory_transactions", "carts", "sessions", "products", "users"]:
        op.drop_table(table)
    for enum_name in ["order_status", "inventory_type", "product_status", "user_role"]:
        sa.Enum(name=enum_name).drop(op.get_bind(), checkfirst=True)
