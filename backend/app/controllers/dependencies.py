from datetime import datetime, timezone
from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models import SessionToken, User


def get_current_user(
    request: Request,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized access.")

    try:
        payload = decode_token(authorization.split(" ", 1)[1])
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    user = db.get(User, int(payload["sub"]))
    session = db.query(SessionToken).filter(SessionToken.token_id == payload["token_id"]).first()
    if not user or not user.is_active or not session or not session.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired.")

    # Session activity is intentionally updated on each authenticated request for auditability.
    request.state.token_id = payload["token_id"]
    session.last_activity_at = datetime.now(timezone.utc)
    session.ip_address = request.client.host if request.client else session.ip_address
    db.commit()
    return user


def require_customer(user: User = Depends(get_current_user)) -> User:
    if user.role != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer access required.")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin authorization required.")
    return user
