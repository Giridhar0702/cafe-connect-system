from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.init_db import init_database
from app.routers import (
    auth_router,
    categories_router,
    foods_router,
    orders_router,
    locations_router,
    delivery_partners_router,
    offers_router,
    store_router,
    customers_router,
    analytics_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed default data
    init_database()
    yield

app = FastAPI(
    title="Cafe Connect API",
    version="1.0.0",
    description="Backend API for Cafe Connect System",
    lifespan=lifespan
)

# CORS setup
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(foods_router)
app.include_router(orders_router)
app.include_router(locations_router)
app.include_router(delivery_partners_router)
app.include_router(offers_router)
app.include_router(store_router)
app.include_router(customers_router)
app.include_router(analytics_router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Cafe Connect API", "version": "1.0.0"}
