from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.offer import Offer
from app.schemas.offer import (
    OfferCreate, OfferValidateRequest, OfferValidateResponse, OfferOut
)
from app.auth.security import get_current_admin

router = APIRouter(tags=["Offers"])

@router.get("/api/offers", response_model=List[OfferOut])
def get_public_offers(db: Session = Depends(get_db)):
    return db.query(Offer).filter(Offer.active == True).all()

@router.post("/api/offers/validate", response_model=OfferValidateResponse)
def validate_offer(data: OfferValidateRequest, db: Session = Depends(get_db)):
    code_clean = data.code.strip().upper()
    offer = db.query(Offer).filter(Offer.code.ilike(code_clean), Offer.active == True).first()
    if not offer:
        return OfferValidateResponse(valid=False, discount_amount=0.0, message="Invalid or inactive coupon code")
    
    if data.cart_total < float(offer.min_order):
        return OfferValidateResponse(
            valid=False,
            discount_amount=0.0,
            message=f"Minimum order of ₹{offer.min_order} required for coupon {offer.code}"
        )
    
    if offer.discount_type == "flat":
        discount = float(offer.discount_value)
    else:  # percentage
        discount = round((data.cart_total * float(offer.discount_value)) / 100.0, 2)
    
    # Cap discount at cart total
    discount = min(discount, data.cart_total)
    return OfferValidateResponse(
        valid=True,
        discount_amount=discount,
        message=f"Coupon {offer.code} applied successfully! You saved ₹{discount}"
    )

@router.get("/api/admin/offers", response_model=List[OfferOut])
def get_admin_offers(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(Offer).all()

@router.post("/api/admin/offers", response_model=OfferOut, status_code=status.HTTP_201_CREATED)
def create_offer(data: OfferCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    existing = db.query(Offer).filter(Offer.code.ilike(data.code.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Offer with this code already exists")
    
    offer = Offer(
        code=data.code.strip().upper(),
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        min_order=data.min_order,
        active=data.active
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer

@router.patch("/api/admin/offers/{id}/toggle-active", response_model=OfferOut)
def toggle_offer_active(id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    offer = db.query(Offer).filter(Offer.id == id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    offer.active = not offer.active
    db.commit()
    db.refresh(offer)
    return offer

@router.delete("/api/admin/offers/{id}")
def delete_offer(id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    offer = db.query(Offer).filter(Offer.id == id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    db.delete(offer)
    db.commit()
    return {"message": "Offer deleted successfully"}
