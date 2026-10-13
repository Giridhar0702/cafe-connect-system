from pydantic import BaseModel, Field
from typing import Optional

class OfferBase(BaseModel):
    code: str = Field(..., min_length=1)
    discount_type: str = "flat"  # 'flat' | 'percentage'
    discount_value: float = Field(..., gt=0)
    min_order: float = 0.0
    active: bool = True

class OfferCreate(OfferBase):
    pass

class OfferValidateRequest(BaseModel):
    code: str
    cart_total: float

class OfferValidateResponse(BaseModel):
    valid: bool
    discount_amount: float = 0.0
    message: str

class OfferOut(OfferBase):
    id: str

    class Config:
        from_attributes = True
