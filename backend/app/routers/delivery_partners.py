from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.delivery_partner import DeliveryPartner
from app.schemas.delivery_partner import (
    DeliveryPartnerCreate, DeliveryPartnerUpdate, DeliveryPartnerOut
)
from app.auth.security import get_current_admin

router = APIRouter(prefix="/api/admin/delivery-partners", tags=["Delivery Partners"])

@router.get("", response_model=List[DeliveryPartnerOut])
def get_delivery_partners(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(DeliveryPartner).all()

@router.post("", response_model=DeliveryPartnerOut, status_code=status.HTTP_201_CREATED)
def create_delivery_partner(data: DeliveryPartnerCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    partner = DeliveryPartner(**data.model_dump())
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner

@router.put("/{id}", response_model=DeliveryPartnerOut)
def update_delivery_partner(id: str, data: DeliveryPartnerUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    partner = db.query(DeliveryPartner).filter(DeliveryPartner.id == id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Delivery partner not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(partner, field, val)

    db.commit()
    db.refresh(partner)
    return partner

@router.patch("/{id}/toggle-active", response_model=DeliveryPartnerOut)
def toggle_delivery_partner_active(id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    partner = db.query(DeliveryPartner).filter(DeliveryPartner.id == id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Delivery partner not found")
    partner.active = not partner.active
    db.commit()
    db.refresh(partner)
    return partner

@router.delete("/{id}")
def delete_delivery_partner(id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    partner = db.query(DeliveryPartner).filter(DeliveryPartner.id == id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Delivery partner not found")
    db.delete(partner)
    db.commit()
    return {"message": "Delivery partner deleted successfully"}
