from pydantic import BaseModel, Field
from typing import Optional

class DeliveryPartnerBase(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=10)
    active: bool = True

class DeliveryPartnerCreate(DeliveryPartnerBase):
    pass

class DeliveryPartnerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    active: Optional[bool] = None

class DeliveryPartnerOut(DeliveryPartnerBase):
    id: str

    class Config:
        from_attributes = True
