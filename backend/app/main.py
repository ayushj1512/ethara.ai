from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.middleware.errors import register_error_handlers
from app.routes import (
    admin_auth, admin_dashboard, admin_inventory, admin_orders,
    admin_products, auth, cart, orders, products
)

settings = get_settings()

app = FastAPI(
    title="Ethara Inventory & Order Management API",
    description="FastAPI backend for inventory, carts, orders, auth, and admin management.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://ethara-ai-rouge.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

for router in [
    auth.router,
    admin_auth.router,
    products.router,
    cart.router,
    orders.router,
    admin_products.router,
    admin_inventory.router,
    admin_orders.router,
    admin_dashboard.router,
]:
    app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    return {"status": "ok"}