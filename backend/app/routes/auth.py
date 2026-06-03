from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.controllers.dependencies import get_current_user, require_customer
from app.core.database import get_db
from app.models import SessionToken, User
from app.schemas.auth import AuthResponse, CustomerProfileUpdate, LoginRequest, SessionResponse, SignupRequest, UserResponse
from app.services.auth_service import login, signup

router = APIRouter(prefix="/auth", tags=["Customer Auth"])


@router.post("/signup", response_model=AuthResponse, summary="Customer signup", description="Create a customer account and return a JWT.")
def signup_route(payload: SignupRequest, request: Request, db: Session = Depends(get_db)):
    user = signup(db, payload)
    token, user = login(db, LoginRequest(email=payload.email, password=payload.password), request, role="customer")
    return {"access_token": token, "user": user}


@router.post("/login", response_model=AuthResponse, summary="Customer login", description="Authenticate a customer and create a tracked session.")
def login_route(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    token, user = login(db, payload, request, role="customer")
    return {"access_token": token, "user": user}


@router.get("/me", response_model=UserResponse, summary="Current customer", description="Return the current authenticated customer.")
def me(user: User = Depends(require_customer)):
    return user


@router.patch("/me", response_model=UserResponse, summary="Update customer profile", description="Update contact and shipping address details for checkout.")
def update_me(payload: CustomerProfileUpdate, user: User = Depends(require_customer), db: Session = Depends(get_db)):
    for field, value in payload.model_dump().items():
        setattr(user, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(user)
    return user


@router.post("/logout", summary="Logout", description="Revoke the current session token.")
def logout(request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(SessionToken).filter(SessionToken.user_id == user.id, SessionToken.token_id == request.state.token_id).first()
    if session:
        session.is_active = False
        db.commit()
    return {"message": "Logged out successfully."}


@router.get("/sessions", response_model=list[SessionResponse], summary="List sessions", description="Return active and historical customer sessions.")
def sessions(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return db.query(SessionToken).filter(SessionToken.user_id == user.id).order_by(SessionToken.created_at.desc()).all()


@router.delete("/sessions/{session_id}", summary="Revoke session", description="Revoke one customer session.")
def revoke_session(session_id: int, user: User = Depends(require_customer), db: Session = Depends(get_db)):
    session = db.query(SessionToken).filter(SessionToken.id == session_id, SessionToken.user_id == user.id).first()
    if session:
        session.is_active = False
        db.commit()
    return {"message": "Session revoked."}
