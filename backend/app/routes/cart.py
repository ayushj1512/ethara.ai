from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.controllers.dependencies import require_customer
from app.core.database import get_db
from app.models import CartItem, User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse
from app.services.cart_service import add_item, apply_offer, cart_payload, get_or_create_cart, update_item

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=CartResponse, summary="Get cart", description="Return the current customer cart with backend-calculated totals.")
def get_cart(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return cart_payload(get_or_create_cart(db, user))


@router.post("/items", response_model=CartResponse, summary="Add item", description="Add a product to cart after stock validation.")
def create_item(payload: CartItemCreate, user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return cart_payload(add_item(db, user, payload.product_id, payload.quantity))


@router.patch("/items/{item_id}", response_model=CartResponse, summary="Update item", description="Update cart item quantity.")
def patch_item(item_id: int, payload: CartItemUpdate, user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return cart_payload(update_item(db, user, item_id, payload.quantity))


@router.post("/offer", response_model=CartResponse, summary="Apply cart offer", description="Apply the customer 10% offer to the current cart.")
def post_offer(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return cart_payload(apply_offer(db, user))


@router.post("/apply-offer", response_model=CartResponse, summary="Apply cart offer alias", description="Alias for applying the customer 10% offer.")
def post_apply_offer(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return post_offer(user, db)


@router.get("/offer", summary="Offer route status", description="Browser-friendly check for the cart offer endpoint.")
def offer_status():
    return {
        "status": "ready",
        "message": "Use POST /api/cart/offer from a logged-in customer cart to apply 10% off.",
        "discount_percent": 10,
    }


@router.delete("/items/{item_id}", response_model=CartResponse, summary="Remove item", description="Remove one cart item.")
def remove_item(item_id: int, user: User = Depends(require_customer), db: Session = Depends(get_db)):
    cart = get_or_create_cart(db, user)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cart item not found.")
    was_last_item = len(cart.items) <= 1
    db.delete(item)
    if was_last_item:
        cart.discount_applied = False
    db.commit()
    db.refresh(cart)
    return cart_payload(cart)


@router.delete("/clear", response_model=CartResponse, summary="Clear cart", description="Remove all cart items.")
def clear_cart(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    cart = get_or_create_cart(db, user)
    for item in list(cart.items):
        db.delete(item)
    cart.discount_applied = False
    db.commit()
    db.refresh(cart)
    return cart_payload(cart)
