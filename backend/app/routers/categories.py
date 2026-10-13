from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.category import Category
from app.models.food_item import FoodItem
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut, CategoryWithCountOut
from app.auth.security import get_current_admin

router = APIRouter(tags=["Categories"])

@router.get("/api/categories", response_model=List[CategoryOut])
def get_public_categories(db: Session = Depends(get_db)):
    return (
        db.query(Category)
        .filter(Category.active == True)
        .order_by(Category.display_order.asc())
        .all()
    )

@router.get("/api/admin/categories", response_model=List[CategoryWithCountOut])
def get_admin_categories(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    categories = db.query(Category).order_by(Category.display_order.asc()).all()
    
    # Get food item counts per category
    counts = (
        db.query(FoodItem.category, func.count(FoodItem.id))
        .group_by(FoodItem.category)
        .all()
    )
    counts_map = {c[0]: c[1] for c in counts}

    results = []
    for cat in categories:
        data = CategoryWithCountOut.from_orm(cat) if hasattr(CategoryWithCountOut, "from_orm") else CategoryWithCountOut.model_validate(cat)
        data.item_count = counts_map.get(cat.name, 0)
        results.append(data)
    return results

@router.post("/api/admin/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    existing = db.query(Category).filter(Category.name.ilike(data.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    cat = Category(
        name=data.name,
        description=data.description,
        display_order=data.display_order,
        active=data.active
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.put("/api/admin/categories/{id}", response_model=CategoryOut)
def update_category(id: str, data: CategoryUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    cat = db.query(Category).filter(Category.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    old_name = cat.name
    if data.name is not None and data.name.strip() != "":
        # If renamed, also update food items with this category
        new_name = data.name.strip()
        if new_name != old_name:
            db.query(FoodItem).filter(FoodItem.category == old_name).update({"category": new_name})
            cat.name = new_name

    if data.description is not None:
        cat.description = data.description
    if data.display_order is not None:
        cat.display_order = data.display_order
    if data.active is not None:
        cat.active = data.active

    db.commit()
    db.refresh(cat)
    return cat

@router.patch("/api/admin/categories/{id}/toggle-active", response_model=CategoryOut)
def toggle_category_active(id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    cat = db.query(Category).filter(Category.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat.active = not cat.active
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/api/admin/categories/{id}")
def delete_category(id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    cat = db.query(Category).filter(Category.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}
