from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints():
    print("--- 1. Testing Health Check ---")
    res = client.get("/api/health")
    print("Health:", res.status_code, res.json())
    assert res.status_code == 200

    print("--- 2. Testing Public Categories ---")
    res = client.get("/api/categories")
    print("Categories count:", len(res.json()))
    assert res.status_code == 200
    assert len(res.json()) > 0

    print("--- 3. Testing Public Foods ---")
    res = client.get("/api/foods")
    print("Foods count:", len(res.json()))
    assert res.status_code == 200
    assert len(res.json()) >= 30

    print("--- 4. Testing Store Status ---")
    res = client.get("/api/store/status")
    print("Store Status:", res.json())
    assert res.status_code == 200
    assert res.json()["is_open"] is True

    print("--- 5. Testing Delivery Locations ---")
    res = client.get("/api/locations")
    print("Locations count:", len(res.json()))
    assert res.status_code == 200
    assert len(res.json()) > 0

    print("--- 6. Testing Offers ---")
    res = client.get("/api/offers")
    print("Offers count:", len(res.json()))
    assert res.status_code == 200

    print("--- 7. Testing Coupon Validation ---")
    res = client.post("/api/offers/validate", json={"code": "SAVE50", "cart_total": 400})
    print("Validate SAVE50: status =", res.status_code, "valid =", res.json()["valid"])
    assert res.status_code == 200
    assert res.json()["valid"] is True
    assert res.json()["discount_amount"] == 50.0

    print("--- 8. Testing Admin Login ---")
    res = client.post("/api/auth/admin/login", json={"username": "admin", "password": "admin123"})
    print("Admin login:", res.status_code, res.json())
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("--- 9. Testing Order Placement ---")
    order_payload = {
        "customer_name": "Test User",
        "phone": "9876543210",
        "address": "123 Main Road",
        "items": [
            {"food_id": "f1", "food_name": "Curd Rice", "price": 104.0, "quantity": 2}
        ],
        "total": 208.0,
        "payment_method": "UPI"
    }
    res = client.post("/api/orders", json=order_payload)
    print("Place Order:", res.status_code, res.json()["id"])
    assert res.status_code == 201
    order_id = res.json()["id"]

    print("--- 10. Testing Order Tracking ---")
    res = client.get(f"/api/orders/track/{order_id}")
    print("Track Order:", res.status_code, res.json()["status"])
    assert res.status_code == 200

    print("--- 11. Testing Admin Orders ---")
    res = client.get("/api/admin/orders", headers=headers)
    print("Admin Orders count:", len(res.json()))
    assert res.status_code == 200

    print("--- 12. Testing Admin Order Status Update ---")
    res = client.patch(
        f"/api/admin/orders/{order_id}/status",
        headers=headers,
        json={"status": "Preparing", "delivery_man_name": "Ramesh", "delivery_man_phone": "9876543210"}
    )
    print("Updated Order Status:", res.status_code, res.json()["status"])
    assert res.status_code == 200
    assert res.json()["status"] == "Preparing"

    print("--- 13. Testing Admin Analytics Stats ---")
    res = client.get("/api/admin/analytics/stats", headers=headers)
    print("Analytics Stats:", res.json())
    assert res.status_code == 200

    print("--- 14. Testing Admin Analytics Reports ---")
    res = client.get("/api/admin/analytics/reports?type=TODAY", headers=headers)
    print("Analytics Report:", res.json())
    assert res.status_code == 200

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
