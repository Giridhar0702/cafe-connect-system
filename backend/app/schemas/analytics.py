from pydantic import BaseModel
from typing import List, Dict

class DashboardStatsOut(BaseModel):
    today_orders_count: int
    today_revenue: float
    pending_orders_count: int
    total_customers_count: int

class TopSellingItem(BaseModel):
    name: str
    quantity: int
    revenue: float

class CategorySale(BaseModel):
    category: str
    revenue: float

class SalesReportOut(BaseModel):
    total_revenue: float
    total_orders: int
    top_items: List[TopSellingItem]
    category_sales: List[CategorySale]
