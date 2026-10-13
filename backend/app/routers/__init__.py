from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router
from app.routers.foods import router as foods_router
from app.routers.orders import router as orders_router
from app.routers.locations import router as locations_router
from app.routers.delivery_partners import router as delivery_partners_router
from app.routers.offers import router as offers_router
from app.routers.store import router as store_router
from app.routers.customers import router as customers_router
from app.routers.analytics import router as analytics_router

__all__ = [
    "auth_router",
    "categories_router",
    "foods_router",
    "orders_router",
    "locations_router",
    "delivery_partners_router",
    "offers_router",
    "store_router",
    "customers_router",
    "analytics_router",
]
