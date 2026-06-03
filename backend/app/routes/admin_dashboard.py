from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.controllers.dependencies import require_admin
from app.core.database import get_db
from app.core.security import hash_password
from app.models import Order, Product, SessionToken, User
from app.schemas.auth import AdminPasswordResetRequest, UserResponse
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


@router.get("/customers", response_model=list[UserResponse], summary="List customers", description="Return customer accounts for admin review.")
def customers(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == "customer").order_by(User.created_at.desc()).all()


@router.patch("/customers/{customer_id}/password", response_model=UserResponse, summary="Reset customer password", description="Allow an admin to reset a customer's password and revoke active sessions.")
def reset_customer_password(customer_id: int, payload: AdminPasswordResetRequest, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    customer = db.query(User).filter(User.id == customer_id, User.role == "customer").first()
    if not customer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found.")

    # Password resets hash the new secret and revoke active sessions so old tokens cannot keep working.
    customer.password_hash = hash_password(payload.new_password)
    db.query(SessionToken).filter(SessionToken.user_id == customer.id, SessionToken.is_active == True).update({"is_active": False}, synchronize_session=False)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/dashboard/stats", response_model=DashboardStats, summary="Dashboard stats", description="Return operational metrics for the admin dashboard.")
def stats(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    delivered_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(Order.status == "delivered").scalar()
    return {
        "total_products": db.query(Product).count(),
        "total_customers": db.query(User).filter(User.role == "customer").count(),
        "total_orders": db.query(Order).count(),
        "total_revenue": float(delivered_revenue or 0),
        "low_stock_products": db.query(Product).filter(Product.stock_quantity <= Product.low_stock_threshold).count(),
        "out_of_stock_products": db.query(Product).filter(Product.status == "out_of_stock").count(),
        "pending_orders": db.query(Order).filter(Order.status == "pending").count(),
        "delivered_orders": db.query(Order).filter(Order.status == "delivered").count(),
    }
