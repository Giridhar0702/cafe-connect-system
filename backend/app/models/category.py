import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer
from app.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=1, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
