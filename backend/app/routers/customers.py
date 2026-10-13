from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.customer import CustomerOut, CustomerUpdate, CustomerAdminOut
from app.auth.security import get_current_admin

router = APIRouter(tags=["Customers"])

@router.get("/api/customers/{phone}", response_model=CustomerOut)
def get_customer_by_phone(phone: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.phone == phone).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/api/customers/{phone}", response_model=CustomerOut)
def update_customer_by_phone(phone: str, data: CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.phone == phone).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if data.name is not None:
        customer.name = data.name
    if data.email is not None:
        customer.email = data.email
    if data.address is not None:
        customer.address = data.address

    db.commit()
    db.refresh(customer)
    return customer

@router.get("/api/admin/customers", response_model=List[CustomerAdminOut])
def get_admin_customers(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    query = db.query(Customer)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(Customer.name.ilike(search_fmt) | Customer.phone.ilike(search_fmt))
    
    customers = query.all()
    
    # Compute aggregate stats from Orders table per phone
    stats = (
        db.query(
            Order.phone,
            func.count(Order.id).label("total_orders"),
            func.sum(Order.total).label("total_spent"),
            func.max(Order.date).label("last_order_date")
        )
        .group_by(Order.phone)
        .all()
    )
    stats_map = {
        s[0]: {
            "total_orders": s[1] or 0,
            "total_spent": float(s[2] or 0.0),
            "last_order_date": s[3].isoformat() if s[3] else None
        }
        for s in stats
    }

    result = []
    for c in customers:
        cust_stats = stats_map.get(c.phone, {"total_orders": 0, "total_spent": 0.0, "last_order_date": None})
        item = CustomerAdminOut(
            id=c.id,
            name=c.name,
            phone=c.phone,
            email=c.email,
            address=c.address,
            total_orders=cust_stats["total_orders"],
            total_spent=cust_stats["total_spent"],
            last_order_date=cust_stats["last_order_date"]
        )
        result.append(item)

    # Sort descending by total_spent
    result.sort(key=lambda x: x.total_spent, reverse=True)
    return result
