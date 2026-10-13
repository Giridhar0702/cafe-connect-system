from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.admin_user import AdminUser
from app.schemas.auth import LoginRequest, TokenResponse
from app.auth.security import verify_password, create_access_token, get_current_admin

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/admin/login", response_model=TokenResponse)
def admin_login(data: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.username == data.username).first()
    
    # Check default config fallback if admin user hasn't been seeded yet
    valid = False
    if admin and verify_password(data.password, admin.hashed_password):
        valid = True
    elif data.username == settings.ADMIN_USERNAME and data.password == settings.ADMIN_PASSWORD:
        valid = True

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    token = create_access_token(data={"sub": data.username})
    return TokenResponse(access_token=token, username=data.username)

@router.get("/admin/verify")
def verify_admin(current_admin: AdminUser = Depends(get_current_admin)):
    return {"valid": True, "username": current_admin.username}
