import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { Star, Clock, ChevronRight } from 'lucide-react';

const Home: React.FC = () => {
  const { foods, categories } = useStore();
  const navigate = useNavigate();

  const popularFoods = foods.filter(f => f.featured).slice(0, 4);

  const categoryImages: Record<string, string> = {
    'Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    'Starters': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
    'Main Course': 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=800&q=80',
    'Chinese': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
    'Beverages': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
    'Desserts': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80'
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
            alt="Hero background"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Fresh Food.<br />Made With Love.
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-300 mb-8">
            Order delicious food from our restaurant and get it delivered to your doorstep hot and fresh.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/menu" className="px-8 py-3 rounded-full bg-primary-600 hover:bg-primary-700 font-semibold text-white transition shadow-lg hover:shadow-primary-500/30">
              Order Now
            </Link>
            <Link to="/menu" className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md font-semibold text-white transition border border-white/20">
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Explore Categories</h2>
            <Link to="/menu" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map(cat => (
              <div
                key={cat}
                onClick={() => navigate(`/menu?category=${cat}`)}
                className="cursor-pointer group flex flex-col items-center"
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-sm mb-4 group-hover:shadow-lg transition-all duration-300 ring-4 ring-transparent group-hover:ring-primary-100">
                  <img 
                    src={categoryImages[cat] || 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80'} 
                    alt={cat} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-bold text-gray-800 text-center group-hover:text-primary-600 transition-colors text-lg tracking-tight">{cat}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Food Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Dishes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularFoods.map(food => (
              <div key={food.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow flex flex-col">
                <div className="relative h-48 overflow-hidden group">
                  <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {!food.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold px-3 py-1 bg-red-500 rounded-full text-sm">Unavailable</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{food.name}</h3>
                    <span className="font-semibold text-primary-600">₹{food.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{food.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                    <span className="flex items-center"><Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" /> {food.rating}</span>
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {food.prepTime} min</span>
                  </div>
                  <div className="mt-auto">
                    <button 
                      onClick={() => navigate(`/food/${food.id}`)}
                      className="w-full py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-primary-500 mb-4">Elai Virundhu</h3>
            <p className="text-gray-400 max-w-sm mb-6">Serving the best food in town. Order online and experience the taste of perfection.</p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/elai_virundhu_sathyamangalam/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/menu" className="hover:text-white transition">Menu</Link></li>
              <li><Link to="/profile" className="hover:text-white transition">Profile</Link></li>
              <li><Link to="/orders" className="hover:text-white transition">Track Order</Link></li>
              <li><Link to="/admin" className="hover:text-white transition text-primary-400">Admin Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>123 Food Street, City</li>
              <li>support@elaivirundhu.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>&copy; 2026 Elai Virundhu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
