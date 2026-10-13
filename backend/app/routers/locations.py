from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.delivery_location import DeliveryLocation
from app.schemas.delivery_location import (
    DeliveryLocationCreate, DeliveryLocationUpdate, DeliveryLocationOut
)
from app.auth.security import get_current_admin

router = APIRouter(tags=["Delivery Locations"])

@router.get("/api/locations", response_model=List[DeliveryLocationOut])
def get_public_locations(db: Session = Depends(get_db)):
    return db.query(DeliveryLocation).filter(DeliveryLocation.active == True).all()

@router.get("/api/admin/locations", response_model=List[DeliveryLocationOut])
def get_admin_locations(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(DeliveryLocation).all()

@router.post("/api/admin/locations", response_model=DeliveryLocationOut, status_code=status.HTTP_201_CREATED)
def create_location(data: DeliveryLocationCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    loc = DeliveryLocation(**data.model_dump())
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc

@router.put("/api/admin/locations/{id}", response_model=DeliveryLocationOut)
def update_location(id: str, data: DeliveryLocationUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    loc = db.query(DeliveryLocation).filter(DeliveryLocation.id == id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(loc, field, val)

    db.commit()
    db.refresh(loc)
    return loc

@router.patch("/api/admin/locations/{id}/toggle-active", response_model=DeliveryLocationOut)
def toggle_location_active(id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    loc = db.query(DeliveryLocation).filter(DeliveryLocation.id == id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    loc.active = not loc.active
    db.commit()
    db.refresh(loc)
    return loc

@router.delete("/api/admin/locations/{id}")
def delete_location(id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    loc = db.query(DeliveryLocation).filter(DeliveryLocation.id == id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(loc)
    db.commit()
    return {"message": "Location deleted successfully"}
