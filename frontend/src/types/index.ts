export type FoodCategory = 'Biryani' | 'Starters' | 'Main Course' | 'Chinese' | 'Beverages' | 'Desserts' | string;

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
