import type { 
  FoodItem, 
  CategoryItem, 
  Order, 
  DeliveryLocation, 
  DeliveryPartner, 
  Offer 
} from '../types';

const API_BASE = '/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('adminToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `API request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

// ----------------- MAPPERS -----------------

export const mapFoodFromBackend = (item: any): FoodItem => ({
  id: String(item.id),
  name: item.name,
  description: item.description || '',
  price: Number(item.price),
  category: item.category,
  imageUrl: item.image_url || '',
  rating: item.rating != null ? Number(item.rating) : 4.5,
  prepTime: item.prep_time != null ? Number(item.prep_time) : 15,
  available: Boolean(item.available),
  featured: Boolean(item.featured),
  foodType: item.food_type || 'NONVEG',
  stock: item.stock != null ? Number(item.stock) : undefined,
  dailyLimits: item.daily_limits || {},
  lastStockReset: item.last_stock_reset || '',
});

export const mapFoodToBackend = (food: Partial<FoodItem>) => ({
  ...(food.name !== undefined && { name: food.name }),
  ...(food.description !== undefined && { description: food.description }),
  ...(food.price !== undefined && { price: food.price }),
  ...(food.category !== undefined && { category: food.category }),
  ...(food.imageUrl !== undefined && { image_url: food.imageUrl }),
  ...(food.rating !== undefined && { rating: food.rating }),
  ...(food.prepTime !== undefined && { prep_time: food.prepTime }),
  ...(food.available !== undefined && { available: food.available }),
  ...(food.featured !== undefined && { featured: food.featured }),
  ...(food.foodType !== undefined && { food_type: food.foodType }),
  ...(food.stock !== undefined && { stock: food.stock }),
  ...(food.dailyLimits !== undefined && { daily_limits: food.dailyLimits }),
  ...(food.lastStockReset !== undefined && { last_stock_reset: food.lastStockReset }),
});

export const mapCategoryFromBackend = (cat: any): CategoryItem => ({
  id: String(cat.id),
  name: cat.name,
  description: cat.description || '',
  displayOrder: Number(cat.display_order ?? 1),
  isActive: Boolean(cat.active),
});

export const mapLocationFromBackend = (loc: any): DeliveryLocation => ({
  id: String(loc.id),
  name: loc.name,
  type: loc.type,
  requiresMealType: Boolean(loc.requires_meal_type),
  offersBreakfast: Boolean(loc.offers_breakfast),
  offersLunch: Boolean(loc.offers_lunch),
  offersDinner: Boolean(loc.offers_dinner),
  breakfastCutoff: loc.breakfast_cutoff || undefined,
  lunchCutoff: loc.lunch_cutoff || undefined,
  dinnerCutoff: loc.dinner_cutoff || undefined,
  active: Boolean(loc.active),
});

export const mapLocationToBackend = (loc: Partial<DeliveryLocation>) => ({
  ...(loc.name !== undefined && { name: loc.name }),
  ...(loc.type !== undefined && { type: loc.type }),
  ...(loc.requiresMealType !== undefined && { requires_meal_type: loc.requiresMealType }),
  ...(loc.offersBreakfast !== undefined && { offers_breakfast: loc.offersBreakfast }),
  ...(loc.offersLunch !== undefined && { offers_lunch: loc.offersLunch }),
  ...(loc.offersDinner !== undefined && { offers_dinner: loc.offersDinner }),
  ...(loc.breakfastCutoff !== undefined && { breakfast_cutoff: loc.breakfastCutoff }),
  ...(loc.lunchCutoff !== undefined && { lunch_cutoff: loc.lunchCutoff }),
  ...(loc.dinnerCutoff !== undefined && { dinner_cutoff: loc.dinnerCutoff }),
  ...(loc.active !== undefined && { active: loc.active }),
});

export const mapOfferFromBackend = (off: any): Offer => ({
  id: String(off.id),
  code: off.code,
  discountType: off.discount_type,
  discountValue: Number(off.discount_value),
  minOrder: Number(off.min_order ?? 0),
  active: Boolean(off.active),
});

export const mapPartnerFromBackend = (p: any): DeliveryPartner => ({
  id: String(p.id),
  name: p.name,
  phone: p.phone,
  active: Boolean(p.active),
});

export const mapOrderFromBackend = (ord: any): Order => ({
  id: ord.id,
  customerName: ord.customer_name,
  phone: ord.phone,
  address: ord.address,
  total: Number(ord.total),
  status: ord.status,
  date: ord.date,
  paymentMethod: ord.payment_method,
  deliveryManName: ord.delivery_man_name || undefined,
  deliveryManPhone: ord.delivery_man_phone || undefined,
  items: (ord.items || []).map((i: any) => ({
    id: i.food_id || i.id,
    name: i.food_name,
    price: Number(i.price),
    quantity: Number(i.quantity),
    description: '',
    category: '',
    imageUrl: '',
    available: true,
    featured: false,
  })),
});

// ----------------- API ENDPOINTS -----------------

export const api = {
  // 1. Auth
  async loginAdmin(username: string, password: string) {
    const data = await handleResponse<{ access_token: string; username: string }>(
      await fetch(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
    );
    localStorage.setItem('adminToken', data.access_token);
    return data;
  },

  async verifyAdmin() {
    return handleResponse<{ valid: boolean; username: string }>(
      await fetch(`${API_BASE}/auth/admin/verify`, {
        headers: getAuthHeaders(),
      })
    );
  },

  logoutAdmin() {
    localStorage.removeItem('adminToken');
  },

  // 2. Categories
  async getCategories(): Promise<CategoryItem[]> {
    const list = await handleResponse<any[]>(await fetch(`${API_BASE}/categories`));
    return list.map(mapCategoryFromBackend);
  },

  async createCategory(cat: { name: string; description?: string; displayOrder?: number; active?: boolean }): Promise<CategoryItem> {
    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: cat.name,
          description: cat.description,
          display_order: cat.displayOrder ?? 1,
          active: cat.active ?? true,
        }),
      })
    );
    return mapCategoryFromBackend(res);
  },

  async updateCategory(id: string, updates: Partial<CategoryItem>): Promise<CategoryItem> {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
    if (updates.isActive !== undefined) payload.active = updates.isActive;

    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
    );
    return mapCategoryFromBackend(res);
  },

  async deleteCategory(id: string): Promise<void> {
    await handleResponse(
      await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
    );
  },

  // 3. Foods
  async getFoods(): Promise<FoodItem[]> {
    const list = await handleResponse<any[]>(await fetch(`${API_BASE}/foods`));
    return list.map(mapFoodFromBackend);
  },

  async getAdminFoods(): Promise<FoodItem[]> {
    const list = await handleResponse<any[]>(
      await fetch(`${API_BASE}/admin/foods`, {
        headers: getAuthHeaders(),
      })
    );
    return list.map(mapFoodFromBackend);
  },

  async createFood(food: Omit<FoodItem, 'id'>): Promise<FoodItem> {
    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/foods`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(mapFoodToBackend(food)),
      })
    );
    return mapFoodFromBackend(res);
  },

  async updateFood(id: string, food: Partial<FoodItem>): Promise<FoodItem> {
    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/foods/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(mapFoodToBackend(food)),
      })
    );
    return mapFoodFromBackend(res);
  },

  async toggleFoodAvailability(id: string): Promise<FoodItem> {
    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/foods/${id}/toggle-availability`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })
    );
    return mapFoodFromBackend(res);
  },

  async deleteFood(id: string): Promise<void> {
    await handleResponse(
      await fetch(`${API_BASE}/admin/foods/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
    );
  },

  // 4. Locations
  async getLocations(): Promise<DeliveryLocation[]> {
    const list = await handleResponse<any[]>(await fetch(`${API_BASE}/locations`));
    return list.map(mapLocationFromBackend);
  },

  async createLocation(loc: Omit<DeliveryLocation, 'id'>): Promise<DeliveryLocation> {
    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/locations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(mapLocationToBackend(loc)),
      })
    );
    return mapLocationFromBackend(res);
  },

  async updateLocation(id: string, loc: Partial<DeliveryLocation>): Promise<DeliveryLocation> {
    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/locations/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(mapLocationToBackend(loc)),
      })
    );
    return mapLocationFromBackend(res);
  },

  async deleteLocation(id: string): Promise<void> {
    await handleResponse(
      await fetch(`${API_BASE}/admin/locations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
    );
  },

  // 5. Offers
  async getOffers(): Promise<Offer[]> {
    const list = await handleResponse<any[]>(await fetch(`${API_BASE}/offers`));
    return list.map(mapOfferFromBackend);
  },

  async createOffer(offer: Omit<Offer, 'id'>): Promise<Offer> {
    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/offers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          code: offer.code,
          discount_type: offer.discountType,
          discount_value: offer.discountValue,
          min_order: offer.minOrder,
          active: offer.active,
        }),
      })
    );
    return mapOfferFromBackend(res);
  },

  async toggleOffer(id: string): Promise<Offer> {
    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/offers/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })
    );
    return mapOfferFromBackend(res);
  },

  async deleteOffer(id: string): Promise<void> {
    await handleResponse(
      await fetch(`${API_BASE}/admin/offers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
    );
  },

  // 6. Delivery Partners
  async getDeliveryPartners(): Promise<DeliveryPartner[]> {
    const list = await handleResponse<any[]>(
      await fetch(`${API_BASE}/admin/delivery-partners`, {
        headers: getAuthHeaders(),
      })
    );
    return list.map(mapPartnerFromBackend);
  },

  async createDeliveryPartner(partner: Omit<DeliveryPartner, 'id'>): Promise<DeliveryPartner> {
    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/delivery-partners`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(partner),
      })
    );
    return mapPartnerFromBackend(res);
  },

  async updateDeliveryPartner(id: string, updates: Partial<DeliveryPartner>): Promise<DeliveryPartner> {
    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/delivery-partners/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      })
    );
    return mapPartnerFromBackend(res);
  },

  async deleteDeliveryPartner(id: string): Promise<void> {
    await handleResponse(
      await fetch(`${API_BASE}/admin/delivery-partners/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
    );
  },

  // 7. Orders
  async getOrders(): Promise<Order[]> {
    const list = await handleResponse<any[]>(
      await fetch(`${API_BASE}/admin/orders`, {
        headers: getAuthHeaders(),
      })
    );
    return list.map(mapOrderFromBackend);
  },

  async placeOrder(order: Omit<Order, 'id' | 'status' | 'date'>): Promise<Order> {
    const payload = {
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address,
      items: order.items.map(item => ({
        food_id: item.id,
        food_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: order.total,
      payment_method: order.paymentMethod,
    };

    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
    return mapOrderFromBackend(res);
  },

  async updateOrderStatus(
    id: string, 
    status: string, 
    deliveryManName?: string, 
    deliveryManPhone?: string
  ): Promise<Order> {
    const payload: any = { status };
    if (deliveryManName) payload.delivery_man_name = deliveryManName;
    if (deliveryManPhone) payload.delivery_man_phone = deliveryManPhone;

    const res = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
    );
    return mapOrderFromBackend(res);
  },

  // 8. Store Status
  async getStoreStatus(): Promise<{ isOpen: boolean; reopenDate: string; closeReason: string; closeType: 'TOTAL' | 'ONLINE_ONLY' }> {
    const data = await handleResponse<any>(await fetch(`${API_BASE}/store/status`));
    return {
      isOpen: Boolean(data.is_open),
      reopenDate: data.reopen_date || '',
      closeReason: data.close_reason || '',
      closeType: data.close_type === 'ONLINE_ONLY' ? 'ONLINE_ONLY' : 'TOTAL',
    };
  },

  async updateStoreStatus(status: { isOpen: boolean; reopenDate?: string; closeReason?: string; closeType?: 'TOTAL' | 'ONLINE_ONLY' }) {
    const data = await handleResponse<any>(
      await fetch(`${API_BASE}/admin/store/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          is_open: status.isOpen,
          reopen_date: status.reopenDate || '',
          close_reason: status.closeReason || '',
          close_type: status.closeType || 'TOTAL',
        }),
      })
    );
    return {
      isOpen: Boolean(data.is_open),
      reopenDate: data.reopen_date || '',
      closeReason: data.close_reason || '',
      closeType: data.close_type === 'ONLINE_ONLY' ? 'ONLINE_ONLY' : 'TOTAL',
    };
  },
};
