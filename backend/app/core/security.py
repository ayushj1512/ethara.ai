from datetime import datetime, timedelta, timezone
from uuid import uuid4
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import get_settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: int, role: str, token_id: str | None = None) -> tuple[str, str, datetime]:
    settings = get_settings()
    jwt_id = token_id or str(uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    # token_id lets the API revoke a single session without invalidating every user token.
    payload = {"sub": str(user_id), "role": role, "token_id": jwt_id, "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm), jwt_id, expires_at


def decode_token(token: str) -> dict:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Session expired or token is invalid.") from exc
