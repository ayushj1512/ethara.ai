"""Add customer and order shipping address fields

Revision ID: 20260603_0003
Revises: 20260603_0002
Create Date: 2026-06-03
"""

from alembic import op
import sqlalchemy as sa


revision = "20260603_0003"
down_revision = "20260603_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("address_line1", sa.String(length=180), nullable=True))
    op.add_column("users", sa.Column("address_line2", sa.String(length=180), nullable=True))
    op.add_column("users", sa.Column("city", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("state", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("postal_code", sa.String(length=20), nullable=True))
    op.add_column("users", sa.Column("country", sa.String(length=80), nullable=True))
    op.add_column("orders", sa.Column("shipping_name", sa.String(length=120), nullable=True))
    op.add_column("orders", sa.Column("shipping_phone", sa.String(length=40), nullable=True))
    op.add_column("orders", sa.Column("shipping_address_line1", sa.String(length=180), nullable=True))
    op.add_column("orders", sa.Column("shipping_address_line2", sa.String(length=180), nullable=True))
    op.add_column("orders", sa.Column("shipping_city", sa.String(length=100), nullable=True))
    op.add_column("orders", sa.Column("shipping_state", sa.String(length=100), nullable=True))
    op.add_column("orders", sa.Column("shipping_postal_code", sa.String(length=20), nullable=True))
    op.add_column("orders", sa.Column("shipping_country", sa.String(length=80), nullable=True))


def downgrade() -> None:
    for column in [
        "shipping_country",
        "shipping_postal_code",
        "shipping_state",
        "shipping_city",
        "shipping_address_line2",
        "shipping_address_line1",
        "shipping_phone",
        "shipping_name",
    ]:
        op.drop_column("orders", column)
    for column in ["country", "postal_code", "state", "city", "address_line2", "address_line1"]:
        op.drop_column("users", column)
