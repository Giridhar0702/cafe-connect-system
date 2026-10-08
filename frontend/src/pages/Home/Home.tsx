import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { Star, ChevronRight, MapPin, Plus, Minus, Mail, Phone, ShoppingCart } from 'lucide-react';

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

  // Use only top 4 foods for home page
  const featuredFoods = foods.filter(f => f.featured).slice(0, 4);
  const displayFoods = featuredFoods.length > 0 ? featuredFoods : foods.slice(0, 4);

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

  const categoryImages: Record<string, string> = {
    'Meals': '/images/categories/meals_icon_1791393191076.jpg',
    'Briyanis': '/images/categories/biryani_icon_1791393207259.jpg',
    'NKV': '/images/categories/nkv_icon_1791393224083.jpg',
    'Hot Beverages': '/images/categories/hot_beverage_icon_1791393238957.jpg',
    'Cold Beverages': '/images/categories/cold_beverage_icon_1791393250962.jpg',
    'Mojito': '/images/categories/mojito_icon_1791393262926.jpg',
    'Soda': '/images/categories/soda_icon_1791393274215.jpg',
    'Ice Cakes': '/images/categories/ice_cake_icon_1791393287698.jpg',
    'Desserts': '/images/categories/dessert_icon_1791393314405.jpg',
    'NK Chattichoru': '/images/categories/chattichoru_icon_1791393352108.jpg',
    'Cool Drinks Tin': '/images/categories/tin_icon_1791393450743.jpg'
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - Premium Zomato Style Background */}
      <section className="relative sticky top-16 z-0 h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image Composition */}
        <div className="absolute inset-0 z-0 bg-black">
          {/* Main Background: Nattukozhi */}
          <img 
            src="/images/hero/nattukozhi_bg.png" 
            alt="Nattukozhi Special" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Left Side Overlay: Vegetables from previous image */}
          <img 
            src="https://images.unsplash.com/photo-1615719413546-198b25453f85?w=1600&q=80" 
            alt="Vegetables" 
            className="absolute inset-0 w-full h-full object-cover object-left"
            style={{ maskImage: 'linear-gradient(to right, black 15%, transparent 35%)', WebkitMaskImage: 'linear-gradient(to right, black 15%, transparent 35%)' }}
          />
          {/* Brand Red & Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-800/80 to-gray-900/80"></div>
        </div>

        <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center mt-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 italic drop-shadow-lg">
            Elai Virundhu & Cafe
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 font-medium">
            Discover the best food & drinks in Sathyamangalam
          </p>
          
          <Link 
            to="/menu" 
            className="px-10 py-4 bg-white text-primary-600 font-extrabold text-lg rounded-full hover:bg-gray-50 hover:scale-105 transition-all shadow-xl flex items-center pointer-events-auto"
          >
            ORDER NOW <ChevronRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Main Content Wrapper - Slides over hero */}
      <div className="relative z-10 bg-white -mt-10 pt-10 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        
        {/* Three Large Options - Swiggy Style */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Link to="/menu?category=Meals" className="relative bg-white rounded-3xl p-6 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[160px] md:min-h-[200px] flex flex-col justify-start border border-gray-100 group">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight z-10">HOME TASTE</h2>
            <p className="text-gray-500 font-medium z-10 mt-1">TRADITIONAL MEALS</p>
            <div className="mt-4 z-10">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-full group-hover:bg-primary-700 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </span>
            </div>
            <img 
              src="/images/categories/meals_icon_1791393191076.jpg" 
              alt="Home Taste Meals" 
              className="absolute bottom-2 right-2 w-32 h-32 md:w-44 md:h-44 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
              style={{ maskImage: 'radial-gradient(circle, black 65%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 100%)' }}
            />
          </Link>
          
          <Link to="/menu?category=Hot Beverages" className="relative bg-white rounded-3xl p-6 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[160px] md:min-h-[200px] flex flex-col justify-start border border-gray-100 group">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight z-10">CAFE ITEMS</h2>
            <p className="text-gray-500 font-medium z-10 mt-1">DRINKS & SNACKS</p>
            <div className="mt-4 z-10">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-full group-hover:bg-primary-700 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </span>
            </div>
            <img 
              src="/images/categories/ice_cake_icon_1791393287698.jpg" 
              alt="Cafe Items" 
              className="absolute bottom-2 right-2 w-32 h-32 md:w-44 md:h-44 object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
            />
          </Link>

          <Link to="/menu" className="relative bg-white rounded-3xl p-6 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[160px] md:min-h-[200px] flex flex-col justify-start border border-gray-100 group">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight z-10">FREE DELIVERY</h2>
             <p className="text-gray-500 font-medium z-10 mt-1">Around 5 KM</p>
            <p className="text-gray-500 font-medium z-10 mt-1">AT YOUR DOORSTEP</p>
            <div className="mt-4 z-10">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-full group-hover:bg-primary-700 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </span>
            </div>
            {/* CSS Colorization Trick: Blue -> Red while keeping White background */}
            <div className="absolute bottom-2 right-2 w-32 h-32 md:w-44 md:h-44 group-hover:scale-110 transition-transform duration-500 mix-blend-multiply pointer-events-none">
              <img 
                src="/images/delivery_logo.png" 
                alt="Food Delivery" 
                className="w-full h-full object-contain"
                style={{ filter: 'grayscale(100%) contrast(1000%) brightness(150%)' }}
              />
              {/* Screen blending turns black pixels to red, leaves white pixels white */}
              <div className="absolute inset-0 bg-primary-600 mix-blend-screen"></div>
            </div>
          </Link>
        </div>
      </section>

        {/* Categories Section - Swiggy Style Isolated Images */}
        <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Order our best food options</h2>
            <div className="hidden md:flex space-x-2">
              <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition" onClick={() => {
                const scrollContainer = document.getElementById('category-scroll');
                if (scrollContainer) scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
              }}>
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition" onClick={() => {
                const scrollContainer = document.getElementById('category-scroll');
                if (scrollContainer) scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
              }}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div id="category-scroll" className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-8 pb-6 pt-2 scroll-smooth">
            {categories.map(cat => (
              <div
                key={cat}
                onClick={() => navigate(`/menu?category=${cat}`)}
                className="cursor-pointer group flex flex-col items-center flex-shrink-0 w-24 md:w-36"
              >
                <div className="w-24 h-24 md:w-36 md:h-36 mb-2 transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                  <img 
                    src={categoryImages[cat]} 
                    alt={cat} 
                    className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm"
                  />
                </div>
                <h3 className="font-semibold text-gray-700 text-center text-sm md:text-base group-hover:text-primary-600 transition-colors leading-tight line-clamp-2 px-1">{cat}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Featured / Popular Section */}
        <section className="py-16 bg-gray-50">
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
                          ADD <ShoppingCart className="w-4 h-4 ml-1.5" strokeWidth={2.5} />
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
        <footer className="bg-gray-900 pt-16 pb-8 mt-auto rounded-b-[2.5rem] md:rounded-none">
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
    </div>
  );
};

export default Home;
