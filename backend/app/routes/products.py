from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Product
from app.schemas.product import ProductResponse
from app.services.product_service import list_public_products

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=list[ProductResponse], summary="List public products", description="Return active products available to customers.")
def list_products(db: Session = Depends(get_db)):
    return list_public_products(db)


@router.get("/{product_id}", response_model=ProductResponse, summary="Get public product", description="Return one active product.")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product or product.status == "inactive":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    return product
