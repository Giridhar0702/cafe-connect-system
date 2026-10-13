from pydantic import BaseModel
from typing import Optional

class StoreSettingsUpdate(BaseModel):
    is_open: bool
    reopen_date: Optional[str] = ""
    close_reason: Optional[str] = ""
    close_type: Optional[str] = "TOTAL"

class StoreSettingsOut(BaseModel):
    is_open: bool
    reopen_date: str
    close_reason: str
    close_type: str

    class Config:
        from_attributes = True
