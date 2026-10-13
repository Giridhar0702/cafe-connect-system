import uuid
from sqlalchemy import Column, String, Text, Boolean
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(120), nullable=False)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    is_admin = Column(Boolean, default=False, nullable=False)
