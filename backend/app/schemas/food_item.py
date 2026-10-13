from pydantic import BaseModel, Field
from typing import Optional, Dict

class FoodItemBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: str = Field(..., min_length=1)
    image_url: Optional[str] = None
    available: bool = True
    featured: bool = False
    food_type: str = "NONVEG"
    rating: Optional[float] = 4.5
    prep_time: Optional[int] = 15
    stock: Optional[int] = None
    daily_limits: Optional[Dict[str, Optional[int]]] = None
    last_stock_reset: Optional[str] = None

class FoodItemCreate(FoodItemBase):
    pass

class FoodItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None
    featured: Optional[bool] = None
    food_type: Optional[str] = None
    rating: Optional[float] = None
    prep_time: Optional[int] = None
    stock: Optional[int] = None
    daily_limits: Optional[Dict[str, Optional[int]]] = None
    last_stock_reset: Optional[str] = None

class FoodItemOut(FoodItemBase):
    id: str

    class Config:
        from_attributes = True

class DailyLimitUpdate(BaseModel):
    day: str
    limit: Optional[int] = None

class StockUpdate(BaseModel):
    stock: Optional[int] = None
    delta: Optional[int] = None
