from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models import Cart, CartItem, InventoryTransaction, Order, OrderItem, Product, User
from app.services.product_service import normalize_product_status
from app.services.pricing_service import discounted_total, money


ORDER_FLOW = ["pending", "confirmed", "packed", "shipped", "delivered"]


def make_order_number() -> str:
    return f"ORD-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}"


def create_order_from_cart(db: Session, customer: User) -> Order:
    cart = db.query(Cart).filter(Cart.customer_id == customer.id).first()
    if not cart or not cart.items:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cart is empty.")
    required_address = [customer.address_line1, customer.city, customer.state, customer.postal_code, customer.country]
    if any(not value for value in required_address):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Please add your shipping address before checkout.")

    # Checkout is one database transaction: validate stock, create order, deduct stock, record inventory, clear cart.
    try:
        subtotal = 0.0
        order = Order(
            order_number=make_order_number(),
            customer_id=customer.id,
            status="pending",
            total_amount=0,
            shipping_name=customer.full_name,
            shipping_phone=customer.phone,
            shipping_address_line1=customer.address_line1,
            shipping_address_line2=customer.address_line2,
            shipping_city=customer.city,
            shipping_state=customer.state,
            shipping_postal_code=customer.postal_code,
            shipping_country=customer.country,
        )
        db.add(order)
        db.flush()
        for item in list(cart.items):
            product = db.get(Product, item.product_id)
            if not product or product.status in {"inactive", "out_of_stock"} or product.stock_quantity < item.quantity:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Insufficient stock available for {item.product.name}.")
            line_total = float(item.unit_price) * item.quantity
            subtotal += line_total
            product.stock_quantity -= item.quantity
            normalize_product_status(product)
            db.add(OrderItem(order_id=order.id, product_id=product.id, sku=product.sku, product_name=product.name, quantity=item.quantity, unit_price=item.unit_price, line_total=money(line_total)))
            db.add(InventoryTransaction(product_id=product.id, type="order_deduction", quantity=-item.quantity, note=f"Order {order.order_number}"))
            db.delete(item)
        order.total_amount = discounted_total(subtotal) if cart.discount_applied else money(subtotal)
        cart.discount_applied = False
        db.commit()
        db.refresh(order)
        return order
    except Exception:
        db.rollback()
        raise


def get_customer_order(db: Session, customer: User, order_id: int) -> Order:
    order = db.query(Order).filter(Order.id == order_id, Order.customer_id == customer.id).first()
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found.")
    return order


def update_order_status(db: Session, order: Order, status_value: str) -> Order:
    # The lifecycle is admin controlled so fulfillment state stays consistent.
    if order.status == "cancelled":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cancelled orders cannot be updated.")
    if order.status == "delivered":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Delivered orders cannot be updated.")
    if status_value == "cancelled":
        order.status = status_value
        db.commit()
        db.refresh(order)
        return order
    if order.status not in ORDER_FLOW or status_value not in ORDER_FLOW:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid order lifecycle status.")
    current_index = ORDER_FLOW.index(order.status)
    next_index = ORDER_FLOW.index(status_value)
    if next_index != current_index + 1:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Next allowed status is {ORDER_FLOW[current_index + 1]}.")
    order.status = status_value
    db.commit()
    db.refresh(order)
    return order
