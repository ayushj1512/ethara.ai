"""Add cart discount applied flag

Revision ID: 20260603_0002
Revises: 20260602_0001
Create Date: 2026-06-03
"""

from alembic import op
import sqlalchemy as sa


revision = "20260603_0002"
down_revision = "20260602_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("carts", sa.Column("discount_applied", sa.Boolean(), server_default=sa.false(), nullable=False))


def downgrade() -> None:
    op.drop_column("carts", "discount_applied")
