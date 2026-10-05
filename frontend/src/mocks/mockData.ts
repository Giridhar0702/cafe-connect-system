import type { FoodItem, Order, Review, Offer, FoodCategory } from '../types';

export const initialCategories: FoodCategory[] = ['Biryani', 'Starters', 'Main Course', 'Chinese', 'Beverages', 'Desserts'];

export const initialFoods: FoodItem[] = [
  {
    id: 'f1',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice cooked with traditional spices and tender chicken.',
    price: 180,
    category: 'Biryani',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    prepTime: 25,
    available: true,
    featured: true,
  },
  {
    id: 'f2',
    name: 'Mutton Biryani',
    description: 'Rich and flavorful mutton biryani cooked slow for the perfect taste.',
    price: 250,
    category: 'Biryani',
    imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    prepTime: 30,
    available: false,
    featured: false,
  },
  {
    id: 'f3',
    name: 'Chicken 65',
    description: 'Spicy, deep-fried chicken bites, perfect as a starter.',
    price: 150,
    category: 'Starters',
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.3,
    prepTime: 15,
    available: true,
    featured: true,
  },
  {
    id: 'f4',
    name: 'Paneer 65',
    description: 'Crispy fried paneer tossed in spicy south indian sauce.',
    price: 130,
    category: 'Starters',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.1,
    prepTime: 15,
    available: true,
    featured: false,
  },
  {
    id: 'f5',
    name: 'Veg Fried Rice',
    description: 'Wok-tossed rice with fresh vegetables and soy sauce.',
    price: 140,
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.0,
    prepTime: 20,
    available: true,
    featured: false,
  },
  {
    id: 'f6',
    name: 'Chicken Fried Rice',
    description: 'Classic fried rice with scrambled egg and chicken pieces.',
    price: 170,
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    prepTime: 20,
    available: true,
    featured: false,
  },
  {
    id: 'f7',
    name: 'Fresh Lime Soda',
    description: 'Refreshing sweet and salt lime soda.',
    price: 60,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.2,
    prepTime: 5,
    available: true,
    featured: false,
  },
  {
    id: 'f8',
    name: 'Gulab Jamun',
    description: 'Soft milk balls soaked in rose flavored sugar syrup.',
    price: 80,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
    rating: 4.9,
    prepTime: 5,
    available: true,
    featured: true,
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ORD-1025',
    customerName: 'Giridhar',
    phone: '9876543210',
    address: '123 Main St, City',
    items: [
      { ...initialFoods[0], quantity: 2 },
    ],
    total: 390, // 360 + 30 delivery
    status: 'Preparing',
    date: '2026-10-04T10:30:00Z',
    paymentMethod: 'COD'
  },
  {
    id: 'ORD-1020',
    customerName: 'Alice',
    phone: '9876543211',
    address: '456 Side Ave, Town',
    items: [
      { ...initialFoods[2], quantity: 1 },
      { ...initialFoods[3], quantity: 1 }
    ],
    total: 310, 
    status: 'Delivered',
    date: '2026-10-02T14:20:00Z',
    paymentMethod: 'UPI'
  }
];

export const initialReviews: Review[] = [
  {
    id: 'r1',
    customerName: 'Giridhar',
    foodId: 'f1',
    foodName: 'Chicken Biryani',
    rating: 5,
    comment: 'Very tasty and fresh.',
    date: '2026-10-04'
  }
];

export const initialOffers: Offer[] = [
  {
    id: 'o1',
    code: 'SAVE50',
    discountType: 'flat',
    discountValue: 50,
    minOrder: 300,
    active: true
  },
  {
    id: 'o2',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 200,
    active: true
  }
];
