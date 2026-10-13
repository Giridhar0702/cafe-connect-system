from pydantic import BaseModel, Field
from typing import Optional

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=10)
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerOut(CustomerBase):
    id: str
    is_admin: bool = False

    class Config:
        from_attributes = True

class CustomerAdminOut(CustomerBase):
    id: str
    total_orders: int = 0
    total_spent: float = 0.0
    last_order_date: Optional[str] = None

    class Config:
        from_attributes = True
