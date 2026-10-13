import uuid
from sqlalchemy import Column, String, Text, Numeric, Boolean, Integer, JSON
from app.database import Base

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(String(64), primary_key=True, default=lambda: f"f{uuid.uuid4().hex[:8]}")
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    image_url = Column(Text, nullable=True)
    available = Column(Boolean, default=True, nullable=False, index=True)
    featured = Column(Boolean, default=False, nullable=False)
    food_type = Column(String(20), default="NONVEG", nullable=False)
    rating = Column(Numeric(3, 1), default=4.5)
    prep_time = Column(Integer, default=15)
    stock = Column(Integer, nullable=True)
    daily_limits = Column(JSON, nullable=True)
    last_stock_reset = Column(String(32), nullable=True)
