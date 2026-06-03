from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.security import create_access_token, hash_password, verify_password
from app.models import SessionToken, User
from app.schemas.auth import LoginRequest, SignupRequest


def signup(db: Session, payload: SignupRequest) -> User:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already exists.")
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        address_line1=payload.address_line1,
        address_line2=payload.address_line2,
        city=payload.city,
        state=payload.state,
        postal_code=payload.postal_code,
        country=payload.country or "India",
        password_hash=hash_password(payload.password),
        role="customer",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login(db: Session, payload: LoginRequest, request: Request, role: str | None = None) -> tuple[str, User]:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash) or (role and user.role != role):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials.")
    token, token_id, expires_at = create_access_token(user.id, user.role)
    # Sessions support revocation and future multi-device management.
    db.add(SessionToken(user_id=user.id, token_id=token_id, device_info=request.headers.get("user-agent"), ip_address=request.client.host if request.client else None, expires_at=expires_at))
    db.commit()
    return token, user
