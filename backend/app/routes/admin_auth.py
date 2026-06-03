from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.controllers.dependencies import require_admin
from app.core.database import get_db
from app.models import User
from app.schemas.auth import AuthResponse, LoginRequest, UserResponse
from app.services.auth_service import login

router = APIRouter(prefix="/admin/auth", tags=["Admin Auth"])


@router.post("/login", response_model=AuthResponse, summary="Admin login", description="Authenticate an admin user and create a tracked session.")
def admin_login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    token, user = login(db, payload, request, role="admin")
    return {"access_token": token, "user": user}


@router.get("/me", response_model=UserResponse, summary="Current admin", description="Return the current authenticated admin.")
def admin_me(user: User = Depends(require_admin)):
    return user
