import uuid
from sqlalchemy import Column, String, Boolean
from app.database import Base

class DeliveryPartner(Base):
    __tablename__ = "delivery_partners"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False)
    active = Column(Boolean, default=True, nullable=False)
