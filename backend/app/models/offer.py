import uuid
from sqlalchemy import Column, String, Numeric, Boolean
from app.database import Base

class Offer(Base):
    __tablename__ = "offers"

    id = Column(String(64), primary_key=True, default=lambda: f"OFF-{uuid.uuid4().hex[:6]}")
    code = Column(String(50), unique=True, nullable=False)
    discount_type = Column(String(20), nullable=False)  # 'flat' | 'percentage'
    discount_value = Column(Numeric(10, 2), nullable=False)
    min_order = Column(Numeric(10, 2), default=0.0, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
