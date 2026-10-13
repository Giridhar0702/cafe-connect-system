from sqlalchemy import Column, String, Boolean
from app.database import Base

class StoreSettings(Base):
    __tablename__ = "store_settings"

    id = Column(String(32), primary_key=True, default="default")
    is_open = Column(Boolean, default=True, nullable=False)
    reopen_date = Column(String(64), default="", nullable=False)
    close_reason = Column(String(255), default="", nullable=False)
    close_type = Column(String(32), default="TOTAL", nullable=False)  # 'TOTAL' | 'ONLINE_ONLY'
