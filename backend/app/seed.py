from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import Cart, InventoryTransaction, Order, OrderItem, Product, User


PRODUCT_IMAGES = {
    "Studio Desk Lamp": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    "Modular Storage Box": "https://images.unsplash.com/photo-1588615419962-8e731b857a2f?auto=format&fit=crop&w=900&q=80",
    "Premium Notebook": "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?auto=format&fit=crop&w=900&q=80",
    "Cable Organizer": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
    "Standing Mat": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80",
    "Desk Shelf": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
    "Wireless Charger": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80",
    "Travel Pouch": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    "Monitor Arm": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    "Focus Timer": "https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=900&q=80",
}


def run() -> None:
    Base.metadata.create_all(bind=engine)
    settings = get_settings()
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == settings.admin_email).first():
            db.add(User(full_name="Ethara Admin", email=settings.admin_email, password_hash=hash_password(settings.admin_password), role="admin"))

        customers = []
        for index in range(1, 6):
            email = f"customer{index}@example.com"
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(full_name=f"Customer {index}", email=email, phone=f"+9199990000{index}", password_hash=hash_password("Password@123"), role="customer")
                db.add(user)
                db.flush()
                db.add(Cart(customer_id=user.id))
            customers.append(user)

        products_data = [
            ("Studio Desk Lamp", "ETH-LAMP-001", "Lighting", 79, 35, 5),
            ("Modular Storage Box", "ETH-BOX-002", "Storage", 29, 60, 8),
            ("Premium Notebook", "ETH-NOTE-003", "Office", 12, 120, 15),
            ("Cable Organizer", "ETH-CABLE-004", "Accessories", 9, 3, 5),
            ("Standing Mat", "ETH-MAT-005", "Office", 49, 4, 6),
            ("Desk Shelf", "ETH-SHELF-006", "Furniture", 99, 2, 5),
            ("Wireless Charger", "ETH-CHARGE-007", "Tech", 39, 0, 5),
            ("Travel Pouch", "ETH-POUCH-008", "Accessories", 24, 0, 5),
            ("Monitor Arm", "ETH-ARM-009", "Furniture", 129, 18, 4),
            ("Focus Timer", "ETH-TIMER-010", "Tech", 34, 22, 5),
        ]
        products = []
        for name, sku, category, price, stock, threshold in products_data:
            product = db.query(Product).filter(Product.sku == sku).first()
            if not product:
                product = Product(name=name, sku=sku, description=f"{name} for modern teams.", category=category, price=price, stock_quantity=stock, low_stock_threshold=threshold, image_url=PRODUCT_IMAGES[name], status="out_of_stock" if stock == 0 else "active")
                db.add(product)
                db.flush()
                db.add(InventoryTransaction(product_id=product.id, type="stock_in", quantity=stock, note="Seed stock"))
            elif not product.image_url or "source.unsplash.com" in product.image_url or product.image_url == "https://images.unsplash.com/photo-1516321318423-f06f85e504b3":
                product.image_url = PRODUCT_IMAGES[name]
            products.append(product)
        db.commit()

        if db.query(Order).count() == 0:
            order_products = db.query(Product).filter(Product.stock_quantity > 5).limit(5).all()
            for index, customer in enumerate(db.query(User).filter(User.role == "customer").limit(5).all()):
                product = order_products[index % len(order_products)]
                qty = 1 + (index % 2)
                order = Order(order_number=f"ORD-SEED-{index+1:03d}", customer_id=customer.id, status=["pending", "confirmed", "packed", "shipped", "delivered"][index], total_amount=float(product.price) * qty)
                db.add(order)
                db.flush()
                db.add(OrderItem(order_id=order.id, product_id=product.id, sku=product.sku, product_name=product.name, quantity=qty, unit_price=product.price, line_total=float(product.price) * qty))
                product.stock_quantity -= qty
                db.add(InventoryTransaction(product_id=product.id, type="order_deduction", quantity=-qty, note=order.order_number))
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
