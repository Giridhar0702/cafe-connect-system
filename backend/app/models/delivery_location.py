import uuid
from sqlalchemy import Column, String, Boolean
from app.database import Base

class DeliveryLocation(Base):
    __tablename__ = "delivery_locations"

    id = Column(String(64), primary_key=True, default=lambda: f"LOC-{uuid.uuid4().hex[:6]}")
    name = Column(String(255), nullable=False)
    type = Column(String(32), nullable=False)  # 'CAFE' | 'QUARTERS' | 'CUSTOM'
    requires_meal_type = Column(Boolean, default=False, nullable=False)
    offers_breakfast = Column(Boolean, default=False, nullable=False)
    offers_lunch = Column(Boolean, default=False, nullable=False)
    offers_dinner = Column(Boolean, default=False, nullable=False)
    breakfast_cutoff = Column(String(10), nullable=True)  # "HH:mm"
    lunch_cutoff = Column(String(10), nullable=True)
    dinner_cutoff = Column(String(10), nullable=True)
    active = Column(Boolean, default=True, nullable=False)
