from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models import Cart, CartItem, Product, User
from app.services.pricing_service import CUSTOMER_DISCOUNT_RATE, customer_discount, discounted_total, money


def get_or_create_cart(db: Session, customer: User) -> Cart:
    cart = db.query(Cart).filter(Cart.customer_id == customer.id).first()
    if not cart:
        cart = Cart(customer_id=customer.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def validate_product(product: Product | None, quantity: int) -> Product:
    if not product or product.status in {"inactive", "out_of_stock"}:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Product is out of stock.")
    if quantity > product.stock_quantity:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot exceed stock quantity.")
    return product


def add_item(db: Session, customer: User, product_id: int, quantity: int) -> Cart:
    cart = get_or_create_cart(db, customer)
    product = validate_product(db.get(Product, product_id), quantity)
    item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == product.id).first()
    if item:
        new_quantity = item.quantity + quantity
        validate_product(product, new_quantity)
        item.quantity = new_quantity
    else:
        db.add(CartItem(cart_id=cart.id, product_id=product.id, quantity=quantity, unit_price=product.price))
    db.commit()
    db.refresh(cart)
    return cart


def update_item(db: Session, customer: User, item_id: int, quantity: int) -> Cart:
    cart = get_or_create_cart(db, customer)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cart item not found.")
    validate_product(item.product, quantity)
    item.quantity = quantity
    db.commit()
    db.refresh(cart)
    return cart


def apply_offer(db: Session, customer: User) -> Cart:
    cart = get_or_create_cart(db, customer)
    if not cart.items:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Add products before applying the offer.")
    cart.discount_applied = True
    db.commit()
    db.refresh(cart)
    return cart


def cart_payload(cart: Cart) -> dict:
    items = []
    subtotal = 0.0
    for item in cart.items:
        line_total = float(item.unit_price) * item.quantity
        subtotal += line_total
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "unit_price": money(item.unit_price),
            "product": item.product,
            "line_total": money(line_total),
        })
    discount_rate = CUSTOMER_DISCOUNT_RATE if cart.discount_applied else 0
    discount_amount = customer_discount(subtotal) if cart.discount_applied else 0
    return {
        "id": cart.id,
        "customer_id": cart.customer_id,
        "items": items,
        "subtotal_amount": money(subtotal),
        "discount_rate": discount_rate,
        "discount_amount": discount_amount,
        "discount_applied": cart.discount_applied,
        "total_amount": discounted_total(subtotal) if cart.discount_applied else money(subtotal),
    }
