# Cafe Connect System - Backend API (FastAPI)

FastAPI backend built with **SQLAlchemy 2.0** ORM, Pydantic v2 schemas, JWT authentication, and support for both PostgreSQL and SQLite fallback.

---

## Getting Started

### 1. Activate Virtual Environment
On Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
```

### 2. Configuration (`.env`)
The backend is pre-configured with `.env`:
```ini
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/cafe_connect
FALLBACK_TO_SQLITE=True
JWT_SECRET=supersecretkey_cafe_connect_system_2026
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
FRONTEND_ORIGIN=http://localhost:5173
PORT=8000
```
> **Note**: If your local PostgreSQL instance is password-protected or not yet configured with `cafe_connect`, `FALLBACK_TO_SQLITE=True` automatically initializes and uses `cafe_connect.db` so development works out of the box.

### 3. Run the Development Server
```powershell
uvicorn app.main:app --reload --port 8000
```

### 4. Interactive API Documentation
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Endpoints Overview

| Category | Endpoint | Method | Description |
|---|---|---|---|
| **Auth** | `/api/auth/admin/login` | `POST` | Admin login with JWT token |
| **Auth** | `/api/auth/admin/verify` | `GET` | Verify admin token |
| **Categories** | `/api/categories` | `GET` | List active categories (public) |
| **Categories** | `/api/admin/categories` | `GET/POST` | Manage categories + food item counts |
| **Categories** | `/api/admin/categories/{id}` | `PUT/PATCH/DELETE` | Edit, toggle active, delete |
| **Foods** | `/api/foods` | `GET` | List foods (filters: category, search, available) |
| **Foods** | `/api/foods/{id}` | `GET` | Get single food details |
| **Foods** | `/api/admin/foods` | `GET/POST` | List all foods / create food |
| **Foods** | `/api/admin/foods/{id}` | `PUT/DELETE` | Edit / delete food |
| **Foods** | `/api/admin/foods/{id}/toggle-availability` | `PATCH` | Quick availability toggle (🟢/🔴) |
| **Stock** | `/api/admin/stock` | `GET` | Daily limits and live stock per weekday |
| **Stock** | `/api/admin/foods/{id}/daily-limit` | `PUT` | Set day-of-week limit |
| **Stock** | `/api/admin/foods/{id}/stock` | `PATCH` | Direct stock adjustment (+/-) |
| **Store** | `/api/store/status` | `GET` | Store open/closed status (public) |
| **Store** | `/api/admin/store/status` | `PUT` | Update store status, reopen date & reason |
| **Locations** | `/api/locations` | `GET` | Active delivery locations & meal cutoffs |
| **Locations** | `/api/admin/locations` | `GET/POST/PUT/PATCH/DELETE`| Manage delivery locations |
| **Orders** | `/api/orders` | `POST` | Place order (validates status, auto-decrements stock) |
| **Orders** | `/api/orders/track/{id}` | `GET` | Track specific order status |
| **Orders** | `/api/admin/orders` | `GET` | View all orders with filters & search |
| **Orders** | `/api/admin/orders/{id}/status` | `PATCH` | Update status & assign delivery partner |
| **Delivery** | `/api/admin/delivery-partners` | `GET/POST/PUT/PATCH/DELETE` | Manage delivery partners |
| **Offers** | `/api/offers` | `GET` | Active offers / coupons (public) |
| **Offers** | `/api/offers/validate` | `POST` | Validate promo code against cart subtotal |
| **Offers** | `/api/admin/offers` | `GET/POST/PATCH/DELETE` | Manage offers |
| **Customers**| `/api/customers/{phone}` | `GET/PUT` | Customer lookup and address update |
| **Customers**| `/api/admin/customers` | `GET` | Aggregated customer statistics |
| **Analytics**| `/api/admin/analytics/stats` | `GET` | Dashboard KPI counters |
| **Analytics**| `/api/admin/analytics/reports` | `GET` | Top-selling items and category breakdown |
