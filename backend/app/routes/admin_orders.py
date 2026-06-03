from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.controllers.dependencies import require_admin
from app.core.database import get_db
from app.models import Order, User
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.services.order_service import update_order_status

router = APIRouter(prefix="/admin/orders", tags=["Admin Orders"])


@router.get("", response_model=list[OrderResponse], summary="List orders", description="Admin order management list.")
def list_orders(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderResponse, summary="Get order", description="Admin order detail.")
def get_order(order_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found.")
    return order


@router.patch("/{order_id}/status", response_model=OrderResponse, summary="Update order status", description="Move an order through its lifecycle.")
def patch_status(order_id: int, payload: OrderStatusUpdate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found.")
    return update_order_status(db, order, payload.status)
