from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.controllers.dependencies import require_admin
from app.core.database import get_db
from app.models import InventoryTransaction, Product, User
from app.schemas.inventory import InventoryTransactionResponse
from app.schemas.product import ProductResponse

router = APIRouter(prefix="/admin/inventory", tags=["Admin Inventory"])


@router.get("", response_model=list[ProductResponse], summary="Inventory overview", description="Return products with stock levels.")
def overview(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.stock_quantity.asc()).all()


@router.get("/transactions", response_model=list[InventoryTransactionResponse], summary="Inventory transactions", description="Return the immutable inventory audit log.")
def transactions(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(InventoryTransaction).order_by(InventoryTransaction.created_at.desc()).all()


@router.get("/low-stock", response_model=list[ProductResponse], summary="Low stock", description="Return products at or below their low stock threshold.")
def low_stock(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.stock_quantity <= Product.low_stock_threshold, Product.status != "inactive").all()
