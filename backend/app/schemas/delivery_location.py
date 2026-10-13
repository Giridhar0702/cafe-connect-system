from pydantic import BaseModel, Field
from typing import Optional

class DeliveryLocationBase(BaseModel):
    name: str = Field(..., min_length=1)
    type: str = "CAFE"  # 'CAFE' | 'QUARTERS' | 'CUSTOM'
    requires_meal_type: bool = False
    offers_breakfast: bool = False
    offers_lunch: bool = False
    offers_dinner: bool = False
    breakfast_cutoff: Optional[str] = None
    lunch_cutoff: Optional[str] = None
    dinner_cutoff: Optional[str] = None
    active: bool = True

class DeliveryLocationCreate(DeliveryLocationBase):
    pass

class DeliveryLocationUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    requires_meal_type: Optional[bool] = None
    offers_breakfast: Optional[bool] = None
    offers_lunch: Optional[bool] = None
    offers_dinner: Optional[bool] = None
    breakfast_cutoff: Optional[str] = None
    lunch_cutoff: Optional[str] = None
    dinner_cutoff: Optional[str] = None
    active: Optional[bool] = None

class DeliveryLocationOut(DeliveryLocationBase):
    id: str

    class Config:
        from_attributes = True
