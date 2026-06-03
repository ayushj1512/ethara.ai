from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.controllers.dependencies import require_admin
from app.core.database import get_db
from app.models import Product, User
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate, StockUpdate
from app.services.product_service import create_product, update_product, update_stock

router = APIRouter(prefix="/admin/products", tags=["Admin Products"])


@router.get("", response_model=list[ProductResponse], summary="List products", description="Admin list of all products.")
def list_products(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.created_at.desc()).all()


@router.get("/{product_id}", response_model=ProductResponse, summary="Get product", description="Admin product detail.")
def get_product(product_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    return product


@router.post("", response_model=ProductResponse, status_code=201, summary="Create product", description="Create a product and opening inventory transaction.")
def create(payload: ProductCreate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    return create_product(db, payload)


@router.put("/{product_id}", response_model=ProductResponse, summary="Update product", description="Update product details.")
def update(product_id: int, payload: ProductUpdate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    return update_product(db, product, payload)


@router.delete("/{product_id}", summary="Delete product", description="Delete a product.")
def delete(product_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted."}


@router.patch("/{product_id}/stock", response_model=ProductResponse, summary="Update stock", description="Adjust stock and create an inventory transaction.")
def stock(product_id: int, payload: StockUpdate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    return update_stock(db, product, payload)
