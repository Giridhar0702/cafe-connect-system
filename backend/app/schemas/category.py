from pydantic import BaseModel, Field
from typing import Optional

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    display_order: int = 1
    active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    active: Optional[bool] = None

class CategoryOut(CategoryBase):
    id: str

    class Config:
        from_attributes = True

class CategoryWithCountOut(CategoryOut):
    item_count: int = 0
