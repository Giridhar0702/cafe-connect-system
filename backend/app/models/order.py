import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Numeric, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(64), primary_key=True, default=lambda: f"ORD-{uuid.uuid4().hex[:6].upper()}")
    customer_name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False, index=True)
    address = Column(Text, nullable=False)
    total = Column(Numeric(10, 2), nullable=False)
    status = Column(String(32), default="Placed", nullable=False, index=True)
    date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    payment_method = Column(String(20), default="UPI", nullable=False)
    delivery_man_name = Column(String(120), nullable=True)
    delivery_man_phone = Column(String(20), nullable=True)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="joined")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(64), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    food_id = Column(String(64), nullable=True)
    food_name = Column(String(255), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)

    order = relationship("Order", back_populates="items")
