import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FoodItem, FoodCategory, Order, CartItem, Review, Offer, DeliveryLocation } from '../types';
import { initialFoods, initialCategories, initialOrders, initialReviews, initialOffers, initialLocations } from '../mocks/mockData';

interface StoreContextType {
  foods: FoodItem[];
  categories: FoodCategory[];
  orders: Order[];
  reviews: Review[];
  offers: Offer[];
  cart: CartItem[];
  locations: DeliveryLocation[];
  
  // Actions
  addFood: (food: FoodItem) => void;
  updateFood: (food: FoodItem) => void;
  deleteFood: (id: string) => void;
  toggleFoodAvailability: (id: string) => void;
  
  addCategory: (category: FoodCategory) => void;
  deleteCategory: (category: FoodCategory) => void;
  
  addToCart: (food: FoodItem) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'date'>) => string;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  
  addOffer: (offer: Omit<Offer, 'id'>) => void;
  toggleOfferActive: (id: string) => void;
  deleteOffer: (id: string) => void;

  addLocation: (location: Omit<DeliveryLocation, 'id'>) => void;
  updateLocation: (location: DeliveryLocation) => void;
  toggleLocationActive: (id: string) => void;
  deleteLocation: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [foods, setFoods] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('foods');
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed && parsed.length >= 30) {
      return parsed;
    }
    return initialFoods;
  });
  
  const [categories, setCategories] = useState<FoodCategory[]>(() => {
    const saved = localStorage.getItem('categories');
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed && parsed.length >= 10) {
      return parsed;
    }
    return initialCategories;
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });
  
  const [reviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('reviews');
    return saved ? JSON.parse(saved) : initialReviews;
  });
  
  const [offers, setOffers] = useState<Offer[]>(() => {
    const saved = localStorage.getItem('offers');
    return saved ? JSON.parse(saved) : initialOffers;
  });
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [locations, setLocations] = useState<DeliveryLocation[]>(() => {
    const saved = localStorage.getItem('locations');
    return saved ? JSON.parse(saved) : initialLocations;
  });

  // Save to localStorage on change
  useEffect(() => { localStorage.setItem('foods', JSON.stringify(foods)); }, [foods]);
  useEffect(() => { localStorage.setItem('categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('reviews', JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem('offers', JSON.stringify(offers)); }, [offers]);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('locations', JSON.stringify(locations)); }, [locations]);

  const addFood = (food: FoodItem) => setFoods([...foods, food]);
  const updateFood = (updatedFood: FoodItem) => setFoods(foods.map(f => f.id === updatedFood.id ? updatedFood : f));
  const deleteFood = (id: string) => setFoods(foods.filter(f => f.id !== id));
  const toggleFoodAvailability = (id: string) => {
    setFoods(foods.map(f => f.id === id ? { ...f, available: !f.available } : f));
  };
  
  const addCategory = (cat: FoodCategory) => setCategories([...categories, cat]);
  const deleteCategory = (cat: FoodCategory) => setCategories(categories.filter(c => c !== cat));

  const addToCart = (food: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === food.id);
      if (existing) {
        return prev.map(item => item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...food, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));
  
  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
  };
  
  const clearCart = () => setCart([]);

  const placeOrder = (orderData: Omit<Order, 'id' | 'status' | 'date'>) => {
    const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id,
      status: 'Placed',
      date: new Date().toISOString()
    };
    setOrders([newOrder, ...orders]);
    clearCart();
    return id;
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const addOffer = (offerData: Omit<Offer, 'id'>) => {
    const newOffer: Offer = {
      ...offerData,
      id: `OFF-${Math.random().toString(36).substr(2, 9)}`
    };
    setOffers([...offers, newOffer]);
  };

  const toggleOfferActive = (id: string) => {
    setOffers(offers.map(o => o.id === id ? { ...o, active: !o.active } : o));
  };

  const deleteOffer = (id: string) => {
    setOffers(offers.filter(o => o.id !== id));
  };

  const addLocation = (locData: Omit<DeliveryLocation, 'id'>) => {
    const newLoc: DeliveryLocation = {
      ...locData,
      id: `LOC-${Math.random().toString(36).substr(2, 9)}`
    };
    setLocations([...locations, newLoc]);
  };

  const updateLocation = (updatedLoc: DeliveryLocation) => {
    setLocations(locations.map(l => l.id === updatedLoc.id ? updatedLoc : l));
  };

  const toggleLocationActive = (id: string) => {
    setLocations(locations.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  const deleteLocation = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
  };

  return (
    <StoreContext.Provider value={{
      foods, categories, orders, reviews, offers, cart,
      addFood, updateFood, deleteFood, toggleFoodAvailability,
      addCategory, deleteCategory,
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      placeOrder, updateOrderStatus,
      addOffer, toggleOfferActive, deleteOffer,
      locations, addLocation, updateLocation, toggleLocationActive, deleteLocation
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
