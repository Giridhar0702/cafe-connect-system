from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.store_settings import StoreSettings
from app.schemas.store_settings import StoreSettingsUpdate, StoreSettingsOut
from app.auth.security import get_current_admin

router = APIRouter(tags=["Store Status"])

def get_or_create_store_settings(db: Session) -> StoreSettings:
    setting = db.query(StoreSettings).first()
    if not setting:
        setting = StoreSettings(
            id="default",
            is_open=True,
            reopen_date="",
            close_reason="",
            close_type="TOTAL"
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@router.get("/api/store/status", response_model=StoreSettingsOut)
def get_store_status(db: Session = Depends(get_db)):
    return get_or_create_store_settings(db)

@router.put("/api/admin/store/status", response_model=StoreSettingsOut)
def update_store_status(
    data: StoreSettingsUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    setting = get_or_create_store_settings(db)
    setting.is_open = data.is_open
    setting.reopen_date = data.reopen_date or ""
    setting.close_reason = data.close_reason or ""
    setting.close_type = data.close_type or "TOTAL"
    db.commit()
    db.refresh(setting)
    return setting
