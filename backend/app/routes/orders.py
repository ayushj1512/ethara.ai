from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.controllers.dependencies import require_customer
from app.core.database import get_db
from app.models import Order, User
from app.schemas.order import OrderResponse
from app.services.order_service import create_order_from_cart, get_customer_order

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=201, summary="Create order", description="Checkout cart, deduct stock, and create inventory transactions.")
def create_order(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return create_order_from_cart(db, user)


@router.get("", response_model=list[OrderResponse], summary="List customer orders", description="Return order history for the current customer.")
def list_orders(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.customer_id == user.id).order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderResponse, summary="Get customer order", description="Return one order owned by the current customer.")
def get_order(order_id: int, user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return get_customer_order(db, user, order_id)
