from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.food_item import FoodItem
from app.schemas.food_item import (
    FoodItemCreate, FoodItemUpdate, FoodItemOut,
    DailyLimitUpdate, StockUpdate
)
from app.auth.security import get_current_admin

router = APIRouter(tags=["Foods & Stock"])

def ensure_daily_stock_reset(food: FoodItem, db: Session):
    """Resets stock for today if new day has started."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_day_name = datetime.now(timezone.utc).strftime("%A")
    
    if food.last_stock_reset != today_str and food.daily_limits:
        daily_limit = food.daily_limits.get(today_day_name)
        if daily_limit is not None:
            food.stock = daily_limit
            food.last_stock_reset = today_str
            if daily_limit == 0:
                food.available = False
            elif daily_limit > 0:
                food.available = True
            db.commit()

@router.get("/api/foods", response_model=List[FoodItemOut])
def get_public_foods(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    available_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(FoodItem)
    if available_only:
        query = query.filter(FoodItem.available == True)
    if category:
        query = query.filter(FoodItem.category == category)
    if featured is not None:
        query = query.filter(FoodItem.featured == featured)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(or_(FoodItem.name.ilike(search_fmt), FoodItem.description.ilike(search_fmt)))
    
    foods = query.all()
    for food in foods:
        ensure_daily_stock_reset(food, db)
    return foods

@router.get("/api/foods/{id}", response_model=FoodItemOut)
def get_food_by_id(id: str, db: Session = Depends(get_db)):
    food = db.query(FoodItem).filter(FoodItem.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    ensure_daily_stock_reset(food, db)
    return food

@router.get("/api/admin/foods", response_model=List[FoodItemOut])
def get_admin_foods(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    foods = db.query(FoodItem).all()
    for food in foods:
        ensure_daily_stock_reset(food, db)
    return foods

@router.post("/api/admin/foods", response_model=FoodItemOut, status_code=status.HTTP_201_CREATED)
def create_food(data: FoodItemCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    food = FoodItem(**data.model_dump())
    db.add(food)
    db.commit()
    db.refresh(food)
    return food

@router.put("/api/admin/foods/{id}", response_model=FoodItemOut)
def update_food(id: str, data: FoodItemUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    food = db.query(FoodItem).filter(FoodItem.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(food, field, val)
        
    db.commit()
    db.refresh(food)
    return food

@router.patch("/api/admin/foods/{id}/toggle-availability", response_model=FoodItemOut)
def toggle_food_availability(id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    food = db.query(FoodItem).filter(FoodItem.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    food.available = not food.available
    db.commit()
    db.refresh(food)
    return food

@router.delete("/api/admin/foods/{id}")
def delete_food(id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    food = db.query(FoodItem).filter(FoodItem.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    db.delete(food)
    db.commit()
    return {"message": "Food item deleted successfully"}

# ----------------- STOCK MANAGEMENT ENDPOINTS -----------------

@router.get("/api/admin/stock", response_model=List[FoodItemOut])
def get_stock_by_day(
    day: Optional[str] = Query(None, description="e.g. Monday, Tuesday..."),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    foods = db.query(FoodItem).all()
    for food in foods:
        ensure_daily_stock_reset(food, db)
    return foods

@router.put("/api/admin/foods/{id}/daily-limit", response_model=FoodItemOut)
def update_daily_limit(
    id: str,
    data: DailyLimitUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    food = db.query(FoodItem).filter(FoodItem.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    limits = dict(food.daily_limits or {})
    limits[data.day] = data.limit
    food.daily_limits = limits

    today_day_name = datetime.now(timezone.utc).strftime("%A")
    if data.day == today_day_name:
        food.stock = data.limit
        food.last_stock_reset = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if data.limit == 0:
            food.available = False
        elif data.limit is not None and data.limit > 0:
            food.available = True

    db.commit()
    db.refresh(food)
    return food

@router.patch("/api/admin/foods/{id}/stock", response_model=FoodItemOut)
def update_stock(
    id: str,
    data: StockUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    food = db.query(FoodItem).filter(FoodItem.id == id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    if data.stock is not None:
        food.stock = data.stock
    elif data.delta is not None and food.stock is not None:
        food.stock = max(0, food.stock + data.delta)

    if food.stock == 0:
        food.available = False
    elif food.stock is not None and food.stock > 0:
        food.available = True

    db.commit()
    db.refresh(food)
    return food
