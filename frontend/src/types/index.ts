export type FoodCategory = 'Biryani' | 'Starters' | 'Main Course' | 'Chinese' | 'Beverages' | 'Desserts' | string;

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: FoodCategory;
  imageUrl: string;
  rating: number;
  prepTime: number;
  available: boolean;
  featured: boolean;
  foodType?: 'VEG' | 'NONVEG' | 'EGG';
  stock?: number;
  dailyLimits?: Partial<Record<DayOfWeek, number>>;
  lastStockReset?: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  paymentMethod: 'UPI' | 'Card' | 'COD';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  isAdmin: boolean;
}

export interface Review {
  id: string;
  customerName: string;
  foodId: string;
  foodName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Offer {
  id: string;
  code: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrder: number;
  active: boolean;
}

export interface DeliveryLocation {
  id: string;
  name: string;
  type: 'CAFE' | 'QUARTERS' | 'CUSTOM';
  requiresMealType: boolean;
  offersBreakfast?: boolean;
  offersLunch?: boolean;
  offersDinner?: boolean;
  active: boolean;
  breakfastCutoff?: string; // HH:mm format, e.g. "08:30"
  lunchCutoff?: string;     // HH:mm format, e.g. "11:00"
  dinnerCutoff?: string;    // HH:mm format, e.g. "17:30"
}
