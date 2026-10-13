import logging
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import (
    Customer, Category, FoodItem, Order, OrderItem,
    DeliveryLocation, DeliveryPartner, Offer, StoreSettings, AdminUser
)
from app.auth.security import get_password_hash
from app.config import settings

logger = logging.getLogger(__name__)

INITIAL_CATEGORIES = [
    'Meals', 'Briyanis', 'NKV', 'Hot Beverages', 'Cold Beverages', 
    'Mojito', 'Soda', 'Ice Cakes', 'Desserts', 'NK Chattichoru', 'Cool Drinks Tin'
]

INITIAL_FOODS = [
    { "id": "f1", "name": "Curd Rice", "description": "Traditional South Indian curd rice.", "price": 104, "category": "Meals", "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80", "rating": 4.5, "prep_time": 10, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f2", "name": "Non Veg Meals", "description": "Complete non-veg thali meals.", "price": 170, "category": "Meals", "image_url": "https://images.unsplash.com/photo-1626804475297-41609ea004eb?w=800&q=80", "rating": 4.8, "prep_time": 20, "available": True, "featured": True, "food_type": "NONVEG" },
    { "id": "f3", "name": "Veg Meals", "description": "Complete veg thali meals.", "price": 157, "category": "Meals", "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80", "rating": 4.5, "prep_time": 20, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f4", "name": "Mutton Seeraga Samba Briyani", "description": "Authentic seeraga samba mutton briyani.", "price": 395, "category": "Briyanis", "image_url": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80", "rating": 4.9, "prep_time": 30, "available": True, "featured": True, "food_type": "NONVEG" },
    { "id": "f5", "name": "Nattukozhi Chinthamani Kochai Varuval (250g)", "description": "Spicy country chicken chinthamani.", "price": 461, "category": "NKV", "image_url": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80", "rating": 4.7, "prep_time": 25, "available": True, "featured": True, "food_type": "NONVEG" },
    { "id": "f6", "name": "Nattukozhi Nallampatti Kochai Varuval (250g)", "description": "Traditional Nallampatti style country chicken.", "price": 461, "category": "NKV", "image_url": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80", "rating": 4.6, "prep_time": 25, "available": True, "featured": False, "food_type": "NONVEG" },
    { "id": "f7", "name": "Nattukozhi Pallipalayam Kochai Varuval (250g)", "description": "Classic Pallipalayam style country chicken.", "price": 461, "category": "NKV", "image_url": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80", "rating": 4.8, "prep_time": 25, "available": True, "featured": False, "food_type": "NONVEG" },
    { "id": "f8", "name": "Black Tea", "description": "Hot black tea.", "price": 15, "category": "Hot Beverages", "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80", "rating": 4.2, "prep_time": 5, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f9", "name": "Lemon Tea", "description": "Hot lemon tea.", "price": 25, "category": "Hot Beverages", "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80", "rating": 4.3, "prep_time": 5, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f10", "name": "Milk", "description": "Hot milk.", "price": 30, "category": "Hot Beverages", "image_url": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80", "rating": 4.0, "prep_time": 5, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f11", "name": "Cold Boost", "description": "Refreshing cold boost.", "price": 110, "category": "Cold Beverages", "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75bf699?w=800&q=80", "rating": 4.5, "prep_time": 10, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f12", "name": "Cold Coffee", "description": "Chilled iced coffee.", "price": 110, "category": "Cold Beverages", "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80", "rating": 4.6, "prep_time": 10, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f13", "name": "Cold Horlicks", "description": "Chilled horlicks drink.", "price": 110, "category": "Cold Beverages", "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75bf699?w=800&q=80", "rating": 4.4, "prep_time": 10, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f14", "name": "Rose Milk", "description": "Sweet and chilled rose milk.", "price": 53, "category": "Cold Beverages", "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80", "rating": 4.7, "prep_time": 5, "available": True, "featured": True, "food_type": "VEG" },
    { "id": "f15", "name": "Blue Mojito", "description": "Refreshing blue curacao mojito.", "price": 105, "category": "Mojito", "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80", "rating": 4.5, "prep_time": 5, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f16", "name": "Mint Lemon Mojito", "description": "Classic mint and lemon mojito.", "price": 105, "category": "Mojito", "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80", "rating": 4.6, "prep_time": 5, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f17", "name": "Lemon Salt", "description": "Fresh lemon soda with salt.", "price": 55, "category": "Soda", "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80", "rating": 4.1, "prep_time": 5, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f18", "name": "Lemon Soda Sweet", "description": "Fresh sweet lemon soda.", "price": 55, "category": "Soda", "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80", "rating": 4.2, "prep_time": 5, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f19", "name": "Lemon Sweet & Salt", "description": "Sweet and salted lemon soda.", "price": 55, "category": "Soda", "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80", "rating": 4.3, "prep_time": 5, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f20", "name": "Black Forest", "description": "Classic black forest ice cake.", "price": 69, "category": "Ice Cakes", "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", "rating": 4.5, "prep_time": 5, "available": True, "featured": False, "food_type": "EGG" },
    { "id": "f21", "name": "Butter Scotch", "description": "Butter scotch ice cake.", "price": 69, "category": "Ice Cakes", "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", "rating": 4.4, "prep_time": 5, "available": True, "featured": False, "food_type": "EGG" },
    { "id": "f22", "name": "Choco Truffle", "description": "Rich chocolate truffle cake.", "price": 83, "category": "Ice Cakes", "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", "rating": 4.7, "prep_time": 5, "available": True, "featured": True, "food_type": "EGG" },
    { "id": "f23", "name": "Chocolate Lollipop", "description": "Chocolate cake lollipop.", "price": 26, "category": "Ice Cakes", "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", "rating": 4.2, "prep_time": 5, "available": True, "featured": False, "food_type": "EGG" },
    { "id": "f24", "name": "Dream Cake", "description": "Special dream ice cake.", "price": 66, "category": "Ice Cakes", "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", "rating": 4.8, "prep_time": 5, "available": True, "featured": True, "food_type": "EGG" },
    { "id": "f25", "name": "Red Velvet", "description": "Red velvet ice cake.", "price": 83, "category": "Ice Cakes", "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", "rating": 4.6, "prep_time": 5, "available": True, "featured": False, "food_type": "EGG" },
    { "id": "f26", "name": "Strawberry", "description": "Strawberry ice cake.", "price": 66, "category": "Ice Cakes", "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", "rating": 4.3, "prep_time": 5, "available": True, "featured": False, "food_type": "EGG" },
    { "id": "f27", "name": "Gulab Jamun", "description": "Sweet gulab jamun.", "price": 66, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80", "rating": 4.7, "prep_time": 5, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f28", "name": "Honey Sweet Nuts", "description": "Nuts soaked in sweet honey.", "price": 26, "category": "Desserts", "image_url": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80", "rating": 4.4, "prep_time": 5, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f29", "name": "Chinthamani Chatti Choru", "description": "Special Chinthamani style chatti choru.", "price": 527, "category": "NK Chattichoru", "image_url": "https://images.unsplash.com/photo-1626804475297-41609ea004eb?w=800&q=80", "rating": 4.9, "prep_time": 25, "available": True, "featured": True, "food_type": "NONVEG" },
    { "id": "f30", "name": "Nallampatti Chatti Choru", "description": "Nallampatti style chatti choru.", "price": 527, "category": "NK Chattichoru", "image_url": "https://images.unsplash.com/photo-1626804475297-41609ea004eb?w=800&q=80", "rating": 4.8, "prep_time": 25, "available": True, "featured": False, "food_type": "NONVEG" },
    { "id": "f31", "name": "Pallipalayam Chatti Choru", "description": "Pallipalayam style chatti choru.", "price": 527, "category": "NK Chattichoru", "image_url": "https://images.unsplash.com/photo-1626804475297-41609ea004eb?w=800&q=80", "rating": 4.8, "prep_time": 25, "available": True, "featured": False, "food_type": "NONVEG" },
    { "id": "f32", "name": "7 Up", "description": "7 Up Tin.", "price": 53, "category": "Cool Drinks Tin", "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80", "rating": 4.0, "prep_time": 2, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f33", "name": "Mirinda", "description": "Mirinda Tin.", "price": 53, "category": "Cool Drinks Tin", "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80", "rating": 4.0, "prep_time": 2, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f34", "name": "Mountain Dew", "description": "Mountain Dew Tin.", "price": 53, "category": "Cool Drinks Tin", "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80", "rating": 4.0, "prep_time": 2, "available": True, "featured": False, "food_type": "VEG" },
    { "id": "f35", "name": "Pepsi", "description": "Pepsi Tin.", "price": 53, "category": "Cool Drinks Tin", "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80", "rating": 4.0, "prep_time": 2, "available": True, "featured": False, "food_type": "VEG" }
]

INITIAL_LOCATIONS = [
    { "id": "loc1", "name": "BIT MINI CAFE - BOYS", "type": "CAFE", "requires_meal_type": True, "offers_breakfast": True, "offers_lunch": True, "offers_dinner": True, "active": True },
    { "id": "loc2", "name": "BIT MINI CAFE - GIRLS", "type": "CAFE", "requires_meal_type": True, "offers_breakfast": True, "offers_lunch": True, "offers_dinner": True, "active": True },
    { "id": "loc3", "name": "BIT QUARTERS", "type": "QUARTERS", "requires_meal_type": False, "offers_breakfast": False, "offers_lunch": False, "offers_dinner": False, "active": True },
    { "id": "loc4", "name": "Custom Address", "type": "CUSTOM", "requires_meal_type": False, "offers_breakfast": False, "offers_lunch": False, "offers_dinner": False, "active": True }
]

INITIAL_OFFERS = [
    { "id": "o1", "code": "SAVE50", "discount_type": "flat", "discount_value": 50, "min_order": 300, "active": True },
    { "id": "o2", "code": "WELCOME10", "discount_type": "percentage", "discount_value": 10, "min_order": 200, "active": True }
]

INITIAL_DELIVERY_PARTNERS = [
    { "id": "1", "name": "Ramesh", "phone": "9876543210", "active": True },
    { "id": "2", "name": "Suresh", "phone": "8765432109", "active": True }
]

def init_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Admin User
        admin = db.query(AdminUser).filter(AdminUser.username == settings.ADMIN_USERNAME).first()
        if not admin:
            admin = AdminUser(
                username=settings.ADMIN_USERNAME,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD)
            )
            db.add(admin)
            logger.info("Created default admin user")

        # 2. Store Settings
        store = db.query(StoreSettings).first()
        if not store:
            store = StoreSettings(id="default", is_open=True, reopen_date="", close_reason="", close_type="TOTAL")
            db.add(store)

        # 3. Categories
        if db.query(Category).count() == 0:
            for idx, name in enumerate(INITIAL_CATEGORIES, 1):
                cat = Category(
                    id=f"cat-{idx}",
                    name=name,
                    description=f"{name} items and specials",
                    display_order=idx,
                    active=True
                )
                db.add(cat)
            logger.info("Seeded initial categories")

        # 4. Food Items
        if db.query(FoodItem).count() == 0:
            for item in INITIAL_FOODS:
                food = FoodItem(**item)
                db.add(food)
            logger.info("Seeded initial foods")

        # 5. Locations
        if db.query(DeliveryLocation).count() == 0:
            for loc_data in INITIAL_LOCATIONS:
                loc = DeliveryLocation(**loc_data)
                db.add(loc)
            logger.info("Seeded initial locations")

        # 6. Offers
        if db.query(Offer).count() == 0:
            for off_data in INITIAL_OFFERS:
                off = Offer(**off_data)
                db.add(off)
            logger.info("Seeded initial offers")

        # 7. Delivery Partners
        if db.query(DeliveryPartner).count() == 0:
            for partner_data in INITIAL_DELIVERY_PARTNERS:
                partner = DeliveryPartner(**partner_data)
                db.add(partner)
            logger.info("Seeded initial delivery partners")

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
    print("Database initialization and seeding completed!")
