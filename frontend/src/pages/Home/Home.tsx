import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { Star, ChevronRight, Search, MapPin, Plus, Minus, Mail, Phone } from 'lucide-react';

const VegIcon = () => (
  <div className="flex items-center justify-center w-4 h-4 border-[1.5px] border-green-600 rounded-[3px] bg-white shrink-0">
    <div className="w-[8px] h-[8px] bg-green-600 rounded-full"></div>
  </div>
);

const NonVegIcon = () => (
  <div className="flex items-center justify-center w-4 h-4 border-[1.5px] border-red-600 rounded-[3px] bg-white shrink-0">
    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-red-600"></div>
  </div>
);

const isNonVeg = (name: string, description: string) => {
  return /non veg|mutton|chicken|fish|prawn|egg|beef|nattukozhi|kochai|meat/i.test(name + ' ' + description);
};

const Home: React.FC = () => {
  const { foods, categories, cart, addToCart, updateCartQuantity } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic for mobile slider
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const interval = setInterval(() => {
      // Only auto-scroll on mobile (where it's not a grid)
      if (window.innerWidth < 768) {
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        if (slider.scrollLeft >= maxScroll - 10) {
          // Reset to start if we reached the end
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by one card width (280px + 24px gap = 304px)
          slider.scrollBy({ left: 304, behavior: 'smooth' });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Use only featured or top 8 foods for home page
  const featuredFoods = foods.filter(f => f.featured).slice(0, 8);
  const displayFoods = featuredFoods.length > 0 ? featuredFoods : foods.slice(0, 8);

  const getCartQuantity = (foodId: string) => cart.find(item => item.id === foodId)?.quantity || 0;

  const handleIncrement = (e: React.MouseEvent, food: any) => {
    e.stopPropagation();
    if (!food.available) return;
    const currentQty = getCartQuantity(food.id);
    if (currentQty === 0) addToCart(food);
    else updateCartQuantity(food.id, currentQty + 1);
  };

  const handleDecrement = (e: React.MouseEvent, foodId: string) => {
    e.stopPropagation();
    const currentQty = getCartQuantity(foodId);
    if (currentQty > 0) updateCartQuantity(foodId, currentQty - 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categoryImages: Record<string, string> = {
    'Meals': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80',
    'Briyanis': 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80',
    'NKV': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80',
    'Hot Beverages': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
    'Cold Beverages': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80',
    'Mojito': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
    'Soda': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
    'Ice Cakes': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    'Desserts': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
    'NK Chattichoru': 'https://images.unsplash.com/photo-1626804475297-41609ea004eb?w=800&q=80',
    'Cool Drinks Tin': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80'
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/shop-night.jpg"
            alt="Ela Cafe Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center mt-12">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 italic drop-shadow-lg">
            Elai Virundhu & Cafe
          </h1>
          <p className="text-xl md:text-3xl text-gray-100 mb-8 font-medium drop-shadow-md">
            Discover the best food & drinks in Sathyamangalam
          </p>
          
          <form onSubmit={handleSearch} className="w-full max-w-3xl flex bg-white rounded-xl shadow-2xl overflow-hidden p-2 mb-8">
            <div className="flex items-center px-4 border-r border-gray-200 w-1/3 hidden md:flex">
              <MapPin className="w-5 h-5 text-primary-500 mr-2 shrink-0" />
              <input type="text" placeholder="Sathyamangalam" disabled className="w-full bg-transparent text-gray-700 focus:outline-none placeholder-gray-400" />
            </div>
            <div className="flex items-center px-4 flex-1">
              <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search for restaurant, cuisine or a dish" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 bg-transparent text-gray-700 focus:outline-none placeholder-gray-400" 
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition">
              Search
            </button>
          </form>

          <Link 
            to="/menu" 
            className="px-10 py-4 bg-primary-600 text-white font-extrabold text-lg rounded-full hover:bg-primary-700 hover:scale-105 transition-all shadow-xl flex items-center"
          >
            ORDER NOW <ChevronRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Categories Section - Inspired by Zomato's round circles */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Eat what makes you happy</h2>
            <Link to="/menu" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              See All Menu <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-8 pb-4">
            {categories.map(cat => (
              <div
                key={cat}
                onClick={() => navigate(`/menu?category=${cat}`)}
                className="cursor-pointer group flex flex-col items-center flex-shrink-0 w-32"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-primary-100">
                  <img 
                    src={categoryImages[cat] || 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80'} 
                    alt={cat} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-semibold text-gray-700 text-center group-hover:text-primary-600 transition-colors">{cat}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / Popular Section */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 tracking-tight">Popular right now</h2>
          
          <div ref={sliderRef} className="flex overflow-x-auto hide-scrollbar snap-x gap-6 pb-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:pb-0 md:overflow-visible scroll-smooth">
            {displayFoods.map(food => {
              const qty = getCartQuantity(food.id);
              return (
                <div 
                  key={food.id} 
                  onClick={() => navigate(`/food/${food.id}`)}
                  className="min-w-[280px] w-full md:min-w-0 snap-center bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group cursor-pointer"
                >
                  <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                    <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {!food.available && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-gray-900 font-bold px-4 py-2 bg-white rounded-full text-sm shadow-md">Sold Out</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold flex items-center shadow-sm">
                      <Star className="w-3.5 h-3.5 text-green-600 mr-1 fill-current" />
                      {food.rating}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-primary-600 transition-colors">{food.name}</h3>
                    {isNonVeg(food.name, food.description) ? <NonVegIcon /> : <VegIcon />}
                  </div>
                  
                  <p className="text-gray-500 text-sm line-clamp-1 mb-4">{food.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="font-bold text-gray-800 text-lg">₹{food.price}</div>
                    
                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                      {!food.available ? (
                        <span className="text-sm font-medium text-red-500">Unavailable</span>
                      ) : qty > 0 ? (
                        <div className="flex items-center justify-between w-[90px] h-[36px] bg-primary-50 border border-primary-200 rounded-lg overflow-hidden shadow-sm">
                          <button onClick={(e) => handleDecrement(e, food.id)} className="w-1/3 h-full flex items-center justify-center text-primary-600 hover:bg-primary-100 transition">
                            <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                          </button>
                          <span className="w-1/3 text-center text-sm font-bold text-primary-600">{qty}</span>
                          <button onClick={(e) => handleIncrement(e, food)} className="w-1/3 h-full flex items-center justify-center text-primary-600 hover:bg-primary-100 transition">
                            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => handleIncrement(e, food)}
                          className="w-[90px] h-[36px] flex items-center justify-center text-[14px] font-bold text-primary-500 bg-primary-50/50 border border-primary-200 rounded-lg hover:bg-primary-50 hover:shadow-sm transition-all shadow-sm"
                        >
                          ADD <Plus className="w-3.5 h-3.5 ml-1" strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
            <div className="col-span-1 lg:col-span-2">
              <h3 className="text-3xl font-extrabold text-white mb-6 italic tracking-tight">Ela Cafe</h3>
              <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
                Serving the best authentic food in town. Order online and experience the taste of perfection right at your doorstep.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/elai_virundhu_sathyamangalam/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 text-gray-300 flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white text-lg mb-6 flex items-center">
                <span className="w-1.5 h-5 bg-primary-500 rounded-full mr-3"></span>
                Quick Links
              </h4>
              <ul className="space-y-4 text-gray-400 font-medium">
                <li><Link to="/" className="hover:text-primary-400 transition-colors flex items-center group"><ChevronRight className="w-4 h-4 mr-2 text-gray-600 group-hover:text-primary-400 transition-colors" />Home</Link></li>
                <li><Link to="/menu" className="hover:text-primary-400 transition-colors flex items-center group"><ChevronRight className="w-4 h-4 mr-2 text-gray-600 group-hover:text-primary-400 transition-colors" />Our Menu</Link></li>
                <li><Link to="/profile" className="hover:text-primary-400 transition-colors flex items-center group"><ChevronRight className="w-4 h-4 mr-2 text-gray-600 group-hover:text-primary-400 transition-colors" />My Account</Link></li>
                <li><Link to="/orders" className="hover:text-primary-400 transition-colors flex items-center group"><ChevronRight className="w-4 h-4 mr-2 text-gray-600 group-hover:text-primary-400 transition-colors" />Track Order</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white text-lg mb-6 flex items-center">
                <span className="w-1.5 h-5 bg-primary-500 rounded-full mr-3"></span>
                Contact Us
              </h4>
              <ul className="space-y-4 text-gray-400 font-medium">
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 text-gray-600 shrink-0 mt-0.5" />
                  <span>123 Food Street, Sathyamangalam</span>
                </li>
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-gray-600 shrink-0" />
                  <span>support@elacafe.com</span>
                </li>
                <li className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-gray-600 shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm font-medium">
            <p className="mb-4 md:mb-0">&copy; 2026 Ela Cafe & Elai Virunthu. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link to="/admin" className="hover:text-primary-400 transition-colors">Admin Login</Link>
              <span className="text-gray-800 hidden md:inline">•</span>
              <span className="hover:text-gray-300 cursor-pointer transition-colors">Terms</span>
              <span className="text-gray-800 hidden md:inline">•</span>
              <span className="hover:text-gray-300 cursor-pointer transition-colors">Privacy</span>
            </div>
          </div>
        </div>
      </footer>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Home;
