import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.food_item import FoodItem
from app.models.customer import Customer
from app.models.store_settings import StoreSettings
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderOut
from app.auth.security import get_current_admin

router = APIRouter(tags=["Orders"])

@router.post("/api/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(data: OrderCreate, db: Session = Depends(get_db)):
    # 1. Check Store Status
    store_setting = db.query(StoreSettings).first()
    if store_setting and not store_setting.is_open:
        reason = store_setting.close_reason or "Restaurant is temporarily closed"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Orders are currently not accepted. Reason: {reason}"
        )

    # 2. Update or Create Customer Record
    customer = db.query(Customer).filter(Customer.phone == data.phone).first()
    if customer:
        customer.name = data.customer_name
        customer.address = data.address
    else:
        customer = Customer(
            name=data.customer_name,
            phone=data.phone,
            address=data.address
        )
        db.add(customer)

    # 3. Create Order
    order_id = f"ORD-{uuid.uuid4().hex[:6].upper()}"
    new_order = Order(
        id=order_id,
        customer_name=data.customer_name,
        phone=data.phone,
        address=data.address,
        total=data.total,
        status="Placed",
        payment_method=data.payment_method,
        date=datetime.now(timezone.utc)
    )
    db.add(new_order)
    db.flush()

    # 4. Create Order Items & Decrement Stock
    for item in data.items:
        order_item = OrderItem(
            order_id=new_order.id,
            food_id=item.food_id,
            food_name=item.food_name,
            price=item.price,
            quantity=item.quantity
        )
        db.add(order_item)

        # Decrement stock if item exists
        if item.food_id:
            food = db.query(FoodItem).filter(FoodItem.id == item.food_id).first()
            if food and food.stock is not None:
                food.stock = max(0, food.stock - item.quantity)
                if food.stock == 0:
                    food.available = False

    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/api/orders/track/{order_id}", response_model=OrderOut)
def track_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ----------------- ADMIN ORDER MANAGEMENT -----------------

@router.get("/api/admin/orders", response_model=List[OrderOut])
def get_admin_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    query = db.query(Order)
    if status_filter and status_filter != "All":
        query = query.filter(Order.status == status_filter)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Order.id.ilike(search_fmt),
                Order.customer_name.ilike(search_fmt),
                Order.phone.ilike(search_fmt),
                Order.address.ilike(search_fmt),
            )
        )
    return query.order_by(Order.date.desc()).limit(limit).all()

@router.get("/api/admin/orders/{id}", response_model=OrderOut)
def get_admin_order_by_id(id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.patch("/api/admin/orders/{id}/status", response_model=OrderOut)
def update_order_status(
    id: str,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = data.status
    if data.delivery_man_name is not None:
        order.delivery_man_name = data.delivery_man_name
    if data.delivery_man_phone is not None:
        order.delivery_man_phone = data.delivery_man_phone

    db.commit()
    db.refresh(order)
    return order
