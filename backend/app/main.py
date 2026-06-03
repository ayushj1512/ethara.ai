from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.middleware.errors import register_error_handlers
from app.routes import (
    admin_auth,
    admin_dashboard,
    admin_inventory,
    admin_orders,
    admin_products,
    auth,
    cart,
    orders,
    products,
)

settings = get_settings()

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
    "https://ethara-ai-rouge.vercel.app",
]

cors_origins = list(set([*DEFAULT_CORS_ORIGINS, *settings.cors_origin_list]))

app = FastAPI(
    title="Ethara Inventory & Order Management API",
    description="Production-style FastAPI backend for customers, admins, inventory, carts, orders, JWT auth, and session tracking.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

routers = [
    auth.router,
    admin_auth.router,
    products.router,
    cart.router,
    orders.router,
    admin_products.router,
    admin_inventory.router,
    admin_orders.router,
    admin_dashboard.router,
]

for router in routers:
    app.include_router(router, prefix="/api")


@app.get(
    "/",
    tags=["System"],
    summary="API welcome",
    description="Friendly landing response for the deployed backend.",
)
def root():
    return {
        "status": "running",
        "message": "Ethara backend is awake, stocked, and ready to ship orders.",
        "service": "Ethara Inventory & Order Management API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    description="Verify that the API service is running.",
)
def health():
    return {"status": "ok"}