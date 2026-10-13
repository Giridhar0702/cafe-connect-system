from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.food_item import FoodItem
from app.models.customer import Customer
from app.schemas.analytics import DashboardStatsOut, SalesReportOut, TopSellingItem, CategorySale
from app.auth.security import get_current_admin

router = APIRouter(prefix="/api/admin/analytics", tags=["Analytics"])

@router.get("/stats", response_model=DashboardStatsOut)
def get_dashboard_stats(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Today's orders & revenue
    today_orders = db.query(Order).filter(Order.date >= today_start).all()
    today_orders_count = len(today_orders)
    today_revenue = sum(float(o.total) for o in today_orders)

    # Pending orders count
    pending_orders_count = (
        db.query(func.count(Order.id))
        .filter(Order.status.in_(["Placed", "Confirmed", "Preparing"]))
        .scalar()
        or 0
    )

    # Total customers count
    total_customers_count = db.query(func.count(Customer.id)).scalar() or 0

    return DashboardStatsOut(
        today_orders_count=today_orders_count,
        today_revenue=round(today_revenue, 2),
        pending_orders_count=pending_orders_count,
        total_customers_count=total_customers_count
    )

@router.get("/reports", response_model=SalesReportOut)
def get_sales_report(
    report_type: str = Query("TODAY", alias="type"),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    query = db.query(Order)
    if report_type.upper() == "TODAY":
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(Order.date >= today_start)

    orders = query.all()
    order_ids = [o.id for o in orders]

    total_revenue = sum(float(o.total) for o in orders)
    total_orders = len(orders)

    if not order_ids:
        return SalesReportOut(
            total_revenue=0.0,
            total_orders=0,
            top_items=[],
            category_sales=[]
        )

    # Get items for these orders
    items = db.query(OrderItem).filter(OrderItem.order_id.in_(order_ids)).all()
    
    # Map food_id to category
    foods = db.query(FoodItem).all()
    food_cat_map = {f.id: f.category for f in foods}
    food_name_cat_map = {f.name: f.category for f in foods}

    item_aggregates = {}
    category_aggregates = {}

    for item in items:
        # Item sales
        if item.food_name not in item_aggregates:
            item_aggregates[item.food_name] = {"quantity": 0, "revenue": 0.0}
        item_aggregates[item.food_name]["quantity"] += item.quantity
        item_aggregates[item.food_name]["revenue"] += float(item.price) * item.quantity

        # Category sales
        cat = food_cat_map.get(item.food_id) or food_name_cat_map.get(item.food_name) or "Other"
        category_aggregates[cat] = category_aggregates.get(cat, 0.0) + (float(item.price) * item.quantity)

    top_items = [
        TopSellingItem(name=k, quantity=v["quantity"], revenue=round(v["revenue"], 2))
        for k, v in item_aggregates.items()
    ]
    top_items.sort(key=lambda x: x.quantity, reverse=True)

    category_sales = [
        CategorySale(category=k, revenue=round(v, 2))
        for k, v in category_aggregates.items()
    ]
    category_sales.sort(key=lambda x: x.revenue, reverse=True)

    return SalesReportOut(
        total_revenue=round(total_revenue, 2),
        total_orders=total_orders,
        top_items=top_items,
        category_sales=category_sales
    )
