import type { FoodItem, Order, Review, Offer, FoodCategory, DeliveryLocation } from '../types';

export const initialCategories: FoodCategory[] = [
  'Meals', 'Briyanis', 'NKV', 'Hot Beverages', 'Cold Beverages', 
  'Mojito', 'Soda', 'Ice Cakes', 'Desserts', 'NK Chattichoru', 'Cool Drinks Tin'
];

export const initialFoods: FoodItem[] = [
  { id: 'f1', name: 'Curd Rice', description: 'Traditional South Indian curd rice.', price: 104, category: 'Meals', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80', rating: 4.5, prepTime: 10, available: true, featured: false },
  { id: 'f2', name: 'Non Veg Meals', description: 'Complete non-veg thali meals.', price: 170, category: 'Meals', imageUrl: 'https://images.unsplash.com/photo-1626804475297-41609ea004eb?w=800&q=80', rating: 4.8, prepTime: 20, available: true, featured: true },
  { id: 'f3', name: 'Veg Meals', description: 'Complete veg thali meals.', price: 157, category: 'Meals', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80', rating: 4.5, prepTime: 20, available: true, featured: false },
  { id: 'f4', name: 'Mutton Seeraga Samba Briyani', description: 'Authentic seeraga samba mutton briyani.', price: 395, category: 'Briyanis', imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80', rating: 4.9, prepTime: 30, available: true, featured: true },
  { id: 'f5', name: 'Nattukozhi Chinthamani Kochai Varuval (250g)', description: 'Spicy country chicken chinthamani.', price: 461, category: 'NKV', imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80', rating: 4.7, prepTime: 25, available: true, featured: true },
  { id: 'f6', name: 'Nattukozhi Nallampatti Kochai Varuval (250g)', description: 'Traditional Nallampatti style country chicken.', price: 461, category: 'NKV', imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80', rating: 4.6, prepTime: 25, available: true, featured: false },
  { id: 'f7', name: 'Nattukozhi Pallipalayam Kochai Varuval (250g)', description: 'Classic Pallipalayam style country chicken.', price: 461, category: 'NKV', imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80', rating: 4.8, prepTime: 25, available: true, featured: false },
  { id: 'f8', name: 'Black Tea', description: 'Hot black tea.', price: 15, category: 'Hot Beverages', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80', rating: 4.2, prepTime: 5, available: true, featured: false },
  { id: 'f9', name: 'Lemon Tea', description: 'Hot lemon tea.', price: 25, category: 'Hot Beverages', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', rating: 4.3, prepTime: 5, available: true, featured: false },
  { id: 'f10', name: 'Milk', description: 'Hot milk.', price: 30, category: 'Hot Beverages', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80', rating: 4.0, prepTime: 5, available: true, featured: false },
  { id: 'f11', name: 'Cold Boost', description: 'Refreshing cold boost.', price: 110, category: 'Cold Beverages', imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75bf699?w=800&q=80', rating: 4.5, prepTime: 10, available: true, featured: false },
  { id: 'f12', name: 'Cold Coffee', description: 'Chilled iced coffee.', price: 110, category: 'Cold Beverages', imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80', rating: 4.6, prepTime: 10, available: true, featured: false },
  { id: 'f13', name: 'Cold Horlicks', description: 'Chilled horlicks drink.', price: 110, category: 'Cold Beverages', imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75bf699?w=800&q=80', rating: 4.4, prepTime: 10, available: true, featured: false },
  { id: 'f14', name: 'Rose Milk', description: 'Sweet and chilled rose milk.', price: 53, category: 'Cold Beverages', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', rating: 4.7, prepTime: 5, available: true, featured: true },
  { id: 'f15', name: 'Blue Mojito', description: 'Refreshing blue curacao mojito.', price: 105, category: 'Mojito', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80', rating: 4.5, prepTime: 5, available: true, featured: false },
  { id: 'f16', name: 'Mint Lemon Mojito', description: 'Classic mint and lemon mojito.', price: 105, category: 'Mojito', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', rating: 4.6, prepTime: 5, available: true, featured: false },
  { id: 'f17', name: 'Lemon Salt', description: 'Fresh lemon soda with salt.', price: 55, category: 'Soda', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80', rating: 4.1, prepTime: 5, available: true, featured: false },
  { id: 'f18', name: 'Lemon Soda Sweet', description: 'Fresh sweet lemon soda.', price: 55, category: 'Soda', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80', rating: 4.2, prepTime: 5, available: true, featured: false },
  { id: 'f19', name: 'Lemon Sweet & Salt', description: 'Sweet and salted lemon soda.', price: 55, category: 'Soda', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80', rating: 4.3, prepTime: 5, available: true, featured: false },
  { id: 'f20', name: 'Black Forest', description: 'Classic black forest ice cake.', price: 69, category: 'Ice Cakes', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', rating: 4.5, prepTime: 5, available: true, featured: false },
  { id: 'f21', name: 'Butter Scotch', description: 'Butter scotch ice cake.', price: 69, category: 'Ice Cakes', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', rating: 4.4, prepTime: 5, available: true, featured: false },
  { id: 'f22', name: 'Choco Truffle', description: 'Rich chocolate truffle cake.', price: 83, category: 'Ice Cakes', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', rating: 4.7, prepTime: 5, available: true, featured: true },
  { id: 'f23', name: 'Chocolate Lollipop', description: 'Chocolate cake lollipop.', price: 26, category: 'Ice Cakes', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', rating: 4.2, prepTime: 5, available: true, featured: false },
  { id: 'f24', name: 'Dream Cake', description: 'Special dream ice cake.', price: 66, category: 'Ice Cakes', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', rating: 4.8, prepTime: 5, available: true, featured: true },
  { id: 'f25', name: 'Red Velvet', description: 'Red velvet ice cake.', price: 83, category: 'Ice Cakes', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', rating: 4.6, prepTime: 5, available: true, featured: false },
  { id: 'f26', name: 'Strawberry', description: 'Strawberry ice cake.', price: 66, category: 'Ice Cakes', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', rating: 4.3, prepTime: 5, available: true, featured: false },
  { id: 'f27', name: 'Gulab Jamun', description: 'Sweet gulab jamun.', price: 66, category: 'Desserts', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80', rating: 4.7, prepTime: 5, available: true, featured: false },
  { id: 'f28', name: 'Honey Sweet Nuts', description: 'Nuts soaked in sweet honey.', price: 26, category: 'Desserts', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80', rating: 4.4, prepTime: 5, available: true, featured: false },
  { id: 'f29', name: 'Chinthamani Chatti Choru', description: 'Special Chinthamani style chatti choru.', price: 527, category: 'NK Chattichoru', imageUrl: 'https://images.unsplash.com/photo-1626804475297-41609ea004eb?w=800&q=80', rating: 4.9, prepTime: 25, available: true, featured: true },
  { id: 'f30', name: 'Nallampatti Chatti Choru', description: 'Nallampatti style chatti choru.', price: 527, category: 'NK Chattichoru', imageUrl: 'https://images.unsplash.com/photo-1626804475297-41609ea004eb?w=800&q=80', rating: 4.8, prepTime: 25, available: true, featured: false },
  { id: 'f31', name: 'Pallipalayam Chatti Choru', description: 'Pallipalayam style chatti choru.', price: 527, category: 'NK Chattichoru', imageUrl: 'https://images.unsplash.com/photo-1626804475297-41609ea004eb?w=800&q=80', rating: 4.8, prepTime: 25, available: true, featured: false },
  { id: 'f32', name: '7 Up', description: '7 Up Tin.', price: 53, category: 'Cool Drinks Tin', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80', rating: 4.0, prepTime: 2, available: true, featured: false },
  { id: 'f33', name: 'Mirinda', description: 'Mirinda Tin.', price: 53, category: 'Cool Drinks Tin', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80', rating: 4.0, prepTime: 2, available: true, featured: false },
  { id: 'f34', name: 'Mountain Dew', description: 'Mountain Dew Tin.', price: 53, category: 'Cool Drinks Tin', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80', rating: 4.0, prepTime: 2, available: true, featured: false },
  { id: 'f35', name: 'Pepsi', description: 'Pepsi Tin.', price: 53, category: 'Cool Drinks Tin', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80', rating: 4.0, prepTime: 2, available: true, featured: false }
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
    foodName: 'Curd Rice',
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

export const initialLocations: DeliveryLocation[] = [
  { id: 'loc1', name: 'BIT MINI CAFE - BOYS', type: 'CAFE', requiresMealType: true, offersBreakfast: true, offersLunch: true, offersDinner: true, active: true, breakfastCutoff: '08:30', lunchCutoff: '11:00', dinnerCutoff: '17:30' },
  { id: 'loc2', name: 'BIT MINI CAFE - GIRLS', type: 'CAFE', requiresMealType: true, offersBreakfast: true, offersLunch: true, offersDinner: true, active: true, breakfastCutoff: '08:30', lunchCutoff: '11:00', dinnerCutoff: '17:30' },
  { id: 'loc3', name: 'BIT QUARTERS', type: 'QUARTERS', requiresMealType: false, active: true },
  { id: 'loc4', name: 'Custom Address', type: 'CUSTOM', requiresMealType: false, active: true }
];
