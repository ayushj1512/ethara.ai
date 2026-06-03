from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models import InventoryTransaction, Product
from app.schemas.product import ProductCreate, ProductUpdate, StockUpdate


def normalize_product_status(product: Product) -> None:
    if product.stock_quantity == 0:
        product.status = "out_of_stock"
    elif product.status == "out_of_stock":
        product.status = "active"


def list_public_products(db: Session) -> list[Product]:
    return db.query(Product).filter(Product.status != "inactive").order_by(Product.created_at.desc()).all()


def create_product(db: Session, payload: ProductCreate) -> Product:
    if db.query(Product).filter(Product.sku == payload.sku).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "SKU already exists.")
    product = Product(**payload.model_dump())
    normalize_product_status(product)
    db.add(product)
    db.commit()
    db.refresh(product)
    if product.stock_quantity:
        db.add(InventoryTransaction(product_id=product.id, type="stock_in", quantity=product.stock_quantity, note="Opening stock"))
        db.commit()
    return product


def update_product(db: Session, product: Product, payload: ProductUpdate) -> Product:
    data = payload.model_dump(exclude_unset=True)
    if "sku" in data and data["sku"] != product.sku and db.query(Product).filter(Product.sku == data["sku"]).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "SKU already exists.")
    for key, value in data.items():
        setattr(product, key, value)
    normalize_product_status(product)
    db.commit()
    db.refresh(product)
    return product


def update_stock(db: Session, product: Product, payload: StockUpdate) -> Product:
    # Stock changes are recorded as immutable inventory transactions for audit trails.
    if payload.type == "stock_in":
        product.stock_quantity += payload.quantity
        tx_quantity = payload.quantity
    elif payload.type == "stock_out":
        if product.stock_quantity < payload.quantity:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Insufficient stock available.")
        product.stock_quantity -= payload.quantity
        tx_quantity = -payload.quantity
    else:
        if payload.quantity < 0:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Stock cannot be negative.")
        tx_quantity = payload.quantity - product.stock_quantity
        product.stock_quantity = payload.quantity
    normalize_product_status(product)
    db.add(InventoryTransaction(product_id=product.id, type=payload.type, quantity=tx_quantity, note=payload.note))
    db.commit()
    db.refresh(product)
    return product
