import uuid
from sqlalchemy import Column, String
from app.database import Base

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(64), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
