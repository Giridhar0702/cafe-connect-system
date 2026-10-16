import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FoodItem, FoodCategory, Order, CartItem, Review, Offer, DeliveryLocation, DeliveryPartner, CategoryItem } from '../types';
import { api } from '../services/api';

interface StoreContextType {
  foods: FoodItem[];
  categories: FoodCategory[];
  categoryItems: CategoryItem[];
  orders: Order[];
  reviews: Review[];
  offers: Offer[];
  cart: CartItem[];
  locations: DeliveryLocation[];
  deliveryPartners: DeliveryPartner[];
  
  isAdminLoggedIn: boolean;
  setAdminLoggedIn: (status: boolean) => void;
  
  isStoreOpen: boolean;
  storeReopenDate: string;
  storeCloseReason: string;
  storeCloseType: 'TOTAL' | 'ONLINE_ONLY';
  setStoreStatus: (isOpen: boolean, reopenDate?: string, closeReason?: string, closeType?: 'TOTAL' | 'ONLINE_ONLY') => void;
  
  // Actions
  addFood: (food: FoodItem) => void;
  updateFood: (food: FoodItem) => void;
  deleteFood: (id: string) => void;
  toggleFoodAvailability: (id: string) => void;
  
  addCategory: (category: FoodCategory) => void;
  deleteCategory: (category: FoodCategory) => void;
  addCategoryItem: (item: Omit<CategoryItem, 'id'>) => void;
  updateCategoryItem: (item: CategoryItem) => void;
  deleteCategoryItem: (id: string) => void;
  toggleCategoryItemActive: (id: string) => void;
  
  addToCart: (food: FoodItem) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'date'>) => string;
  updateOrderStatus: (id: string, status: Order['status'], deliveryManName?: string, deliveryManPhone?: string) => void;
  
  addOffer: (offer: Omit<Offer, 'id'>) => void;
  toggleOfferActive: (id: string) => void;
  deleteOffer: (id: string) => void;

  addLocation: (location: Omit<DeliveryLocation, 'id'>) => void;
  updateLocation: (location: DeliveryLocation) => void;
  toggleLocationActive: (id: string) => void;
  deleteLocation: (id: string) => void;

  addDeliveryPartner: (partner: Omit<DeliveryPartner, 'id'>) => void;
  updateDeliveryPartner: (partner: DeliveryPartner) => void;
  toggleDeliveryPartnerActive: (id: string) => void;
  deleteDeliveryPartner: (id: string) => void;
  adminSearchQuery: string;
  setAdminSearchQuery: (query: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  
  const [foods, setFoods] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('foods');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem('categoryItems');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const categories = categoryItems
    .filter(c => c.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(c => c.name);
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    if (saved) {
      try {
        const parsed: Order[] = JSON.parse(saved);
        // Filter out legacy hardcoded mock orders
        return parsed.filter(o => o.id !== 'ORD-1025' && o.id !== 'ORD-1020');
      } catch {
        return [];
      }
    }
    return [];
  });
  
  const [reviews] = useState<Review[]>([]);
  
  const [offers, setOffers] = useState<Offer[]>(() => {
    const saved = localStorage.getItem('offers');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [locations, setLocations] = useState<DeliveryLocation[]>(() => {
    const saved = localStorage.getItem('locations');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(() => {
    const saved = localStorage.getItem('deliveryPartners');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('isStoreOpen');
    return saved !== 'false';
  });
  
  const [storeReopenDate, setStoreReopenDate] = useState<string>(() => {
    return localStorage.getItem('storeReopenDate') || '';
  });

  const [storeCloseReason, setStoreCloseReason] = useState<string>(() => {
    return localStorage.getItem('storeCloseReason') || '';
  });

  const [storeCloseType, setStoreCloseType] = useState<'TOTAL' | 'ONLINE_ONLY'>(() => {
    const saved = localStorage.getItem('storeCloseType');
    return (saved === 'ONLINE_ONLY') ? 'ONLINE_ONLY' : 'TOTAL';
  });

  // ----------------- BACKEND API SYNCHRONIZATION -----------------

  // 1. Initial data load on mount from backend
  useEffect(() => {
    // Foods
    api.getFoods()
      .then(fetchedFoods => {
        if (fetchedFoods && fetchedFoods.length > 0) {
          setFoods(fetchedFoods);
        }
      })
      .catch(err => console.warn('Could not load foods from API, using cached:', err));

    // Categories
    api.getCategories()
      .then(fetchedCats => {
        if (fetchedCats && fetchedCats.length > 0) {
          setCategoryItems(fetchedCats);
        }
      })
      .catch(err => console.warn('Could not load categories from API, using cached:', err));

    // Locations
    api.getLocations()
      .then(fetchedLocs => {
        if (fetchedLocs && fetchedLocs.length > 0) {
          setLocations(fetchedLocs);
        }
      })
      .catch(err => console.warn('Could not load locations from API, using cached:', err));

    // Offers
    api.getOffers()
      .then(fetchedOffers => {
        if (fetchedOffers) {
          setOffers(fetchedOffers);
        }
      })
      .catch(err => console.warn('Could not load offers from API, using cached:', err));

    // Store Status
    api.getStoreStatus()
      .then(status => {
        setIsStoreOpen(status.isOpen);
        setStoreReopenDate(status.reopenDate);
        setStoreCloseReason(status.closeReason);
        setStoreCloseType(status.closeType);
      })
      .catch(err => console.warn('Could not load store status from API, using cached:', err));
  }, []);

  // 2. Fetch admin data and poll for live incoming orders
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const fetchAdminData = () => {
      api.getOrders()
        .then(fetchedOrders => {
          if (fetchedOrders) {
            setOrders(fetchedOrders);
          }
        })
        .catch(err => console.warn('Could not load admin orders from API:', err));

      api.getDeliveryPartners()
        .then(partners => {
          if (partners) setDeliveryPartners(partners);
        })
        .catch(err => console.warn('Could not load delivery partners from API:', err));
    };

    // Initial fetch on login
    fetchAdminData();

    // Poll every 4 seconds so new orders from customers trigger in real-time
    const pollInterval = setInterval(fetchAdminData, 4000);
    return () => clearInterval(pollInterval);
  }, [isAdminLoggedIn]);

  // Save to localStorage as secondary backup
  useEffect(() => { localStorage.setItem('foods', JSON.stringify(foods)); }, [foods]);
  useEffect(() => { 
    localStorage.setItem('categoryItems', JSON.stringify(categoryItems)); 
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categoryItems, categories]);
  useEffect(() => { localStorage.setItem('orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('reviews', JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem('offers', JSON.stringify(offers)); }, [offers]);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('locations', JSON.stringify(locations)); }, [locations]);
  useEffect(() => { localStorage.setItem('deliveryPartners', JSON.stringify(deliveryPartners)); }, [deliveryPartners]);

  const setAdminLoggedIn = (status: boolean) => {
    setIsAdminLoggedIn(status);
    localStorage.setItem('isAdminLoggedIn', String(status));
    if (!status) {
      api.logoutAdmin();
    }
  };

  const setStoreStatus = (isOpen: boolean, reopenDate: string = '', closeReason: string = '', closeType: 'TOTAL' | 'ONLINE_ONLY' = 'TOTAL') => {
    setIsStoreOpen(isOpen);
    setStoreReopenDate(reopenDate);
    setStoreCloseReason(closeReason);
    setStoreCloseType(closeType);
    localStorage.setItem('isStoreOpen', String(isOpen));
    localStorage.setItem('storeReopenDate', reopenDate);
    localStorage.setItem('storeCloseReason', closeReason);
    localStorage.setItem('storeCloseType', closeType);

    api.updateStoreStatus({ isOpen, reopenDate, closeReason, closeType })
      .catch(err => console.error('Failed to update store status on backend:', err));
  };

  // ----------------- ACTIONS (API-CONNECTED) -----------------

  const addFood = (food: FoodItem) => {
    setFoods(prev => [...prev, food]);
    api.createFood(food)
      .then(created => {
        setFoods(prev => prev.map(f => f.id === food.id ? created : f));
      })
      .catch(err => console.error('Failed to add food to backend:', err));
  };

  const updateFood = (updatedFood: FoodItem) => {
    setFoods(foods.map(f => f.id === updatedFood.id ? updatedFood : f));
    api.updateFood(updatedFood.id, updatedFood)
      .catch(err => console.error('Failed to update food on backend:', err));
  };

  const deleteFood = (id: string) => {
    setFoods(foods.filter(f => f.id !== id));
    api.deleteFood(id)
      .catch(err => console.error('Failed to delete food on backend:', err));
  };

  const toggleFoodAvailability = (id: string) => {
    setFoods(foods.map(f => f.id === id ? { ...f, available: !f.available } : f));
    api.toggleFoodAvailability(id)
      .catch(err => console.error('Failed to toggle food availability on backend:', err));
  };

  const addCategoryItem = (item: Omit<CategoryItem, 'id'>) => {
    const tempId = `cat-${Date.now()}`;
    const newItem: CategoryItem = {
      ...item,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCategoryItems(prev => [...prev, newItem]);

    api.createCategory({
      name: item.name,
      description: item.description,
      displayOrder: item.displayOrder,
      active: item.isActive,
    })
      .then(created => {
        setCategoryItems(prev => prev.map(c => c.id === tempId ? created : c));
      })
      .catch(err => console.error('Failed to add category on backend:', err));
  };

  const updateCategoryItem = (updated: CategoryItem) => {
    const existing = categoryItems.find(c => c.id === updated.id);
    if (existing && existing.name !== updated.name) {
      setFoods(prev => prev.map(f => f.category === existing.name ? { ...f, category: updated.name } : f));
    }
    setCategoryItems(prev => prev.map(c => c.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : c));

    api.updateCategory(updated.id, updated)
      .catch(err => console.error('Failed to update category on backend:', err));
  };

  const deleteCategoryItem = (id: string) => {
    setCategoryItems(prev => prev.filter(c => c.id !== id));
    api.deleteCategory(id)
      .catch(err => console.error('Failed to delete category on backend:', err));
  };

  const toggleCategoryItemActive = (id: string) => {
    const item = categoryItems.find(c => c.id === id);
    if (item) {
      const nextActive = !item.isActive;
      setCategoryItems(prev => prev.map(c => c.id === id ? { ...c, isActive: nextActive, updatedAt: new Date().toISOString() } : c));
      api.updateCategory(id, { isActive: nextActive })
        .catch(err => console.error('Failed to toggle category on backend:', err));
    }
  };

  const addCategory = (cat: FoodCategory) => {
    addCategoryItem({
      name: cat,
      description: `${cat} items`,
      displayOrder: categoryItems.length + 1,
      isActive: true
    });
  };

  const deleteCategory = (cat: FoodCategory) => {
    const item = categoryItems.find(c => c.name === cat);
    if (item) {
      deleteCategoryItem(item.id);
    } else {
      setCategoryItems(prev => prev.filter(c => c.name !== cat));
    }
  };

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
    const tempId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: tempId,
      status: 'Placed',
      date: new Date().toISOString()
    };
    
    // Decrement stock optimistically
    const todayStr = new Date().toISOString().split('T')[0];
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    setFoods(prevFoods => prevFoods.map(food => {
      let currentStock = food.stock;
      let lastReset = food.lastStockReset;
      let isAvailable = food.available;

      if (lastReset !== todayStr) {
        currentStock = food.dailyLimits?.[dayName as keyof typeof food.dailyLimits];
        lastReset = todayStr;
        if (currentStock === 0) {
          isAvailable = false;
        } else if (currentStock !== undefined && currentStock > 0) {
          isAvailable = true;
        }
      }

      const orderedItem = orderData.items.find(item => item.id === food.id);
      if (orderedItem && currentStock != null) {
        currentStock = Math.max(0, currentStock - orderedItem.quantity);
        if (currentStock === 0) {
          isAvailable = false;
        }
      }

      return {
        ...food,
        stock: currentStock,
        lastStockReset: lastReset,
        available: isAvailable
      };
    }));

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Persist to backend and Supabase
    api.placeOrder(orderData)
      .then(savedOrder => {
        setOrders(prev => prev.map(o => o.id === tempId ? savedOrder : o));
        // Refresh foods to reflect verified stock decrement from backend
        api.getFoods().then(f => setFoods(f)).catch(console.error);
      })
      .catch(err => {
        console.error('Failed to sync placed order with backend:', err);
      });

    return tempId;
  };

  const updateOrderStatus = (id: string, status: Order['status'], deliveryManName?: string, deliveryManPhone?: string) => {
    setOrders(orders.map(o => o.id === id ? { 
      ...o, 
      status, 
      ...(deliveryManName && { deliveryManName }),
      ...(deliveryManPhone && { deliveryManPhone }) 
    } : o));

    api.updateOrderStatus(id, status, deliveryManName, deliveryManPhone)
      .catch(err => console.error('Failed to update order status on backend:', err));
  };

  const addOffer = (offerData: Omit<Offer, 'id'>) => {
    const tempId = `OFF-${Math.random().toString(36).substr(2, 9)}`;
    const newOffer: Offer = { ...offerData, id: tempId };
    setOffers(prev => [...prev, newOffer]);

    api.createOffer(offerData)
      .then(created => {
        setOffers(prev => prev.map(o => o.id === tempId ? created : o));
      })
      .catch(err => console.error('Failed to add offer on backend:', err));
  };

  const toggleOfferActive = (id: string) => {
    setOffers(offers.map(o => o.id === id ? { ...o, active: !o.active } : o));
    api.toggleOffer(id)
      .catch(err => console.error('Failed to toggle offer on backend:', err));
  };

  const deleteOffer = (id: string) => {
    setOffers(offers.filter(o => o.id !== id));
    api.deleteOffer(id)
      .catch(err => console.error('Failed to delete offer on backend:', err));
  };

  const addLocation = (locData: Omit<DeliveryLocation, 'id'>) => {
    const tempId = `LOC-${Math.random().toString(36).substr(2, 9)}`;
    const newLoc: DeliveryLocation = { ...locData, id: tempId };
    setLocations(prev => [...prev, newLoc]);

    api.createLocation(locData)
      .then(created => {
        setLocations(prev => prev.map(l => l.id === tempId ? created : l));
      })
      .catch(err => console.error('Failed to add location on backend:', err));
  };

  const updateLocation = (updatedLoc: DeliveryLocation) => {
    setLocations(locations.map(l => l.id === updatedLoc.id ? updatedLoc : l));
    api.updateLocation(updatedLoc.id, updatedLoc)
      .catch(err => console.error('Failed to update location on backend:', err));
  };

  const toggleLocationActive = (id: string) => {
    const loc = locations.find(l => l.id === id);
    if (loc) {
      const nextActive = !loc.active;
      setLocations(locations.map(l => l.id === id ? { ...l, active: nextActive } : l));
      api.updateLocation(id, { active: nextActive })
        .catch(err => console.error('Failed to toggle location on backend:', err));
    }
  };

  const deleteLocation = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
    api.deleteLocation(id)
      .catch(err => console.error('Failed to delete location on backend:', err));
  };

  const addDeliveryPartner = (partnerData: Omit<DeliveryPartner, 'id'>) => {
    const tempId = Date.now().toString();
    const newPartner = { ...partnerData, id: tempId };
    setDeliveryPartners(prev => [...prev, newPartner]);

    api.createDeliveryPartner(partnerData)
      .then(created => {
        setDeliveryPartners(prev => prev.map(p => p.id === tempId ? created : p));
      })
      .catch(err => console.error('Failed to add delivery partner on backend:', err));
  };

  const updateDeliveryPartner = (partner: DeliveryPartner) => {
    setDeliveryPartners(deliveryPartners.map(p => p.id === partner.id ? partner : p));
    api.updateDeliveryPartner(partner.id, partner)
      .catch(err => console.error('Failed to update delivery partner on backend:', err));
  };

  const toggleDeliveryPartnerActive = (id: string) => {
    const p = deliveryPartners.find(part => part.id === id);
    if (p) {
      const nextActive = !p.active;
      setDeliveryPartners(deliveryPartners.map(part => part.id === id ? { ...part, active: nextActive } : part));
      api.updateDeliveryPartner(id, { active: nextActive })
        .catch(err => console.error('Failed to toggle delivery partner on backend:', err));
    }
  };

  const deleteDeliveryPartner = (id: string) => {
    setDeliveryPartners(deliveryPartners.filter(p => p.id !== id));
    api.deleteDeliveryPartner(id)
      .catch(err => console.error('Failed to delete delivery partner on backend:', err));
  };

  return (
    <StoreContext.Provider value={{
      foods, categories, categoryItems, orders, reviews, offers, cart,
      addFood, updateFood, deleteFood, toggleFoodAvailability,
      addCategory, deleteCategory,
      addCategoryItem, updateCategoryItem, deleteCategoryItem, toggleCategoryItemActive,
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      placeOrder, updateOrderStatus,
      addOffer, toggleOfferActive, deleteOffer,
      locations, addLocation, updateLocation, toggleLocationActive, deleteLocation,
      deliveryPartners, addDeliveryPartner, updateDeliveryPartner, toggleDeliveryPartnerActive, deleteDeliveryPartner,
      isAdminLoggedIn, setAdminLoggedIn,
      isStoreOpen, storeReopenDate, storeCloseReason, storeCloseType, setStoreStatus,
      adminSearchQuery, setAdminSearchQuery
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
