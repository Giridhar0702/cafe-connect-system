from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OrderItemCreate(BaseModel):
    food_id: Optional[str] = None
    food_name: str
    price: float = Field(..., gt=0)
    quantity: int = Field(1, ge=1)

class OrderItemOut(BaseModel):
    id: str
    food_id: Optional[str] = None
    food_name: str
    price: float
    quantity: int

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=10)
    address: str = Field(..., min_length=1)
    items: List[OrderItemCreate] = Field(..., min_length=1)
    total: float = Field(..., gt=0)
    payment_method: str = "UPI"

class OrderStatusUpdate(BaseModel):
    status: str
    delivery_man_name: Optional[str] = None
    delivery_man_phone: Optional[str] = None

class OrderOut(BaseModel):
    id: str
    customer_name: str
    phone: str
    address: str
    total: float
    status: str
    date: datetime
    payment_method: str
    delivery_man_name: Optional[str] = None
    delivery_man_phone: Optional[str] = None
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True
