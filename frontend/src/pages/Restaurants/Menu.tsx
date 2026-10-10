import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/StoreContext';
import { Search, Plus, Minus, ShoppingCart, SlidersHorizontal, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const VegIcon = () => (
  <div className="flex items-center justify-center w-4 h-4 border-[1.5px] border-green-600 rounded-[3px] bg-white mt-1 shrink-0">
    <div className="w-[8px] h-[8px] bg-green-600 rounded-full"></div>
  </div>
);

const NonVegIcon = () => (
  <div className="flex items-center justify-center w-4 h-4 border-[1.5px] border-red-600 rounded-[3px] bg-white mt-1 shrink-0">
    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-red-600"></div>
  </div>
);

const EggIcon = () => (
  <div className="flex items-center justify-center w-4 h-4 border-[1.5px] border-yellow-500 rounded-[3px] bg-white mt-1 shrink-0" title="Egg">
    <div className="w-[8px] h-[8px] bg-yellow-500 rounded-full"></div>
  </div>
);

const getFoodType = (food: { name: string; description: string; foodType?: string }): 'VEG' | 'EGG' | 'NONVEG' => {
  if (food.foodType === 'VEG' || food.foodType === 'EGG' || food.foodType === 'NONVEG') {
    return food.foodType;
  }
  const text = (food.name + ' ' + food.description).toLowerCase();
  if (/non veg|mutton|chicken|fish|prawn|beef|nattukozhi|kochai|meat/i.test(text)) {
    return 'NONVEG';
  }
  if (/egg|omelette|muttai/i.test(text)) {
    return 'EGG';
  }
  return 'VEG';
};

const Menu: React.FC = () => {
  const { foods, categories, cart, addToCart, updateCartQuantity } = useStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category');
  const initialSearch = queryParams.get('search');

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || categories[0]);
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const navigate = useNavigate();

  const [vegFilter, setVegFilter] = useState<'ALL' | 'VEG' | 'EGG' | 'NONVEG'>('ALL');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observer = useRef<IntersectionObserver | null>(null);

  const categoryCounts = categories.map(cat => ({
    name: cat,
    count: foods.filter(f => f.category === cat).length
  })).filter(c => c.count > 0);

  useEffect(() => {
    const handleScroll = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleScroll, {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when header hits top 20%
      threshold: 0,
    });

    Object.values(categoryRefs.current).forEach(ref => {
      if (ref) observer.current?.observe(ref);
    });

    return () => observer.current?.disconnect();
  }, [categoryCounts]);

  // Scroll to category on sidebar click
  const scrollToCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    const element = categoryRefs.current[categoryName];
    if (element) {
      const offset = window.innerWidth < 768 ? 120 : 170;
      const y = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // On mount, if URL has category, scroll to it
  useEffect(() => {
    if (initialCategory) {
      setTimeout(() => scrollToCategory(initialCategory), 100);
    }
  }, [initialCategory]);

  useEffect(() => {
    const handleFocusSearch = () => {
      setIsSearchOpen(true);
      setTimeout(() => {
        document.getElementById('menu-search-input')?.focus();
      }, 100);
    };
    
    window.addEventListener('focus-search' as any, handleFocusSearch);
    if (initialSearch === 'open') {
      handleFocusSearch();
      setSearchQuery('');
    }
    
    return () => window.removeEventListener('focus-search' as any, handleFocusSearch);
  }, [initialSearch]);

  const getCartQuantity = (foodId: string) => {
    return cart.find(item => item.id === foodId)?.quantity || 0;
  };

  const handleIncrement = (e: React.MouseEvent, food: any) => {
    e.stopPropagation();
    if (!food.available) return;
    const currentQty = getCartQuantity(food.id);
    if (currentQty === 0) {
      addToCart(food);
    } else {
      updateCartQuantity(food.id, currentQty + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent, foodId: string) => {
    e.stopPropagation();
    const currentQty = getCartQuantity(foodId);
    if (currentQty > 0) {
      updateCartQuantity(foodId, currentQty - 1);
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          food.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    const foodType = getFoodType(food);
    if (vegFilter !== 'ALL' && vegFilter !== foodType) return false;
    
    return true;
  });

  // Group filtered foods
  const groupedFoods = categoryCounts.map(cat => ({
    ...cat,
    items: filteredFoods.filter(f => f.category === cat.name)
  })).filter(cat => cat.items.length > 0 && (selectedCategories.length === 0 || selectedCategories.includes(cat.name)));

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="md:sticky md:top-[64px] z-30 bg-white border-b border-gray-100 px-4 py-2 md:py-4 md:px-8 md:shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
          <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Menu</h1>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Filter Button (Mobile Only) */}
            <button 
              className={`md:hidden flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white shadow-sm rounded-xl font-bold text-gray-700 transition active:bg-gray-50 ml-auto ${isSearchOpen ? 'hidden' : 'flex'}`}
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal className="w-5 h-5" /> Filters
            </button>

            {/* Veg / NonVeg Toggle (Desktop) */}
            <div className="hidden md:flex bg-gray-100 p-1 rounded-xl transition-all gap-1 w-fit">
              <button 
                onClick={() => setVegFilter('ALL')}
                className={`flex items-center justify-center px-5 py-1.5 rounded-lg transition-all ${vegFilter === 'ALL' ? 'bg-white shadow-sm font-bold text-gray-900' : 'hover:bg-gray-200 font-medium text-gray-600'}`}
              >
                <span className="text-[14px]">All</span>
              </button>
              <button 
                onClick={() => setVegFilter('VEG')}
                className={`flex items-center justify-center px-4 py-1.5 rounded-lg transition-all ${vegFilter === 'VEG' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Veg"
              >
                <VegIcon />
              </button>
              <button 
                onClick={() => setVegFilter('EGG')}
                className={`flex items-center justify-center px-4 py-1.5 rounded-lg transition-all ${vegFilter === 'EGG' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Egg"
              >
                <EggIcon />
              </button>
              <button 
                onClick={() => setVegFilter('NONVEG')}
                className={`flex items-center justify-center px-4 py-1.5 rounded-lg transition-all ${vegFilter === 'NONVEG' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Non-Veg"
              >
                <NonVegIcon />
              </button>
            </div>

            {/* Search Input */}
            <div className={`relative w-full md:w-96 transition-all duration-300 ${!isSearchOpen ? 'hidden md:block' : 'block'}`}>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              
              <input
                id="menu-search-input"
                type="text"
                className="block w-full h-[40px] pl-11 pr-4 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all shadow-inner"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isSearchOpen && (
              <button 
                className="md:hidden px-3 text-gray-500 font-medium shrink-0 hover:text-gray-900 transition" 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Categories (Hidden, now in Filter Modal) */}

      <div className="max-w-7xl mx-auto flex items-start">
        {/* Sidebar */}
        <div className="hidden md:block w-64 shrink-0 sticky top-[144px] h-[calc(100vh-144px)] overflow-y-auto border-r border-gray-100 py-6 custom-scrollbar">
          <ul className="space-y-1">
            {groupedFoods.map(cat => {
              const isActive = activeCategory === cat.name;
              return (
                <li key={cat.name}>
                  <button
                    onClick={() => scrollToCategory(cat.name)}
                    className={`w-full text-left px-6 py-3 text-[15px] transition-all flex items-center justify-between ${
                      isActive 
                        ? 'bg-gradient-to-r from-transparent via-primary-50/50 to-primary-100/50 border-r-2 border-primary-500 text-primary-500 font-semibold' 
                        : 'text-gray-600 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <span>{cat.name} ({cat.count})</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 py-3 md:px-8 md:py-8 min-h-screen">
          {groupedFoods.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-gray-700 mb-2">No food items found</h3>
              <p className="text-gray-500">Try adjusting your search query.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {groupedFoods.map(cat => (
                <div 
                  key={cat.name} 
                  id={cat.name} 
                  ref={el => { categoryRefs.current[cat.name] = el; }}
                  className="scroll-mt-[120px] md:scroll-mt-[170px]"
                >
                  <h2 className="text-[22px] font-bold text-gray-800 mb-6">{cat.name}</h2>
                  <div className="space-y-6">
                    {cat.items.map((food, idx) => {
                      const qty = getCartQuantity(food.id);
                      return (
                        <div key={food.id}>
                          <div className="flex justify-between items-start cursor-pointer group" onClick={() => navigate(`/food/${food.id}`)}>
                            <div className="flex gap-3 flex-1">
                              {getFoodType(food) === 'NONVEG' ? <NonVegIcon /> : 
                               getFoodType(food) === 'EGG' ? <EggIcon /> : <VegIcon />}
                              <div>
                                <h3 className="text-lg font-medium text-gray-800 group-hover:text-primary-600 transition-colors">{food.name}</h3>
                                <div className="text-[15px] font-medium text-gray-700 mt-1">₹{food.price}</div>
                              </div>
                            </div>
                            
                            <div className="ml-4 shrink-0 flex items-center justify-end w-[100px]" onClick={e => e.stopPropagation()}>
                              {!food.available ? (
                                <span className="text-sm font-medium text-red-500 bg-red-50 px-3 py-1 rounded-md">Sold Out</span>
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
                          {idx < cat.items.length - 1 && (
                            <hr className="mt-6 border-t border-gray-100" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Category Separator */}
                  <div className="h-4 border-b border-gray-100 mt-6 mb-10 w-full" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200" onClick={() => setIsFilterOpen(false)}>
          <div className="bg-white rounded-t-3xl p-6 pb-safe animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition">
                 <X className="w-5 h-5" />
              </button>
            </div>
            
            <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Dietary Preference</h4>
            <div className="flex bg-gray-100 p-1.5 rounded-2xl transition-all gap-1 w-full mb-8">
              <button 
                onClick={() => setVegFilter('ALL')}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${vegFilter === 'ALL' ? 'bg-white shadow-sm font-bold text-gray-900' : 'hover:bg-gray-200 font-medium text-gray-600'}`}
              >
                <span className="text-[14px]">All</span>
              </button>
              <button 
                onClick={() => setVegFilter('VEG')}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${vegFilter === 'VEG' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Veg"
              >
                <VegIcon /> <span className={`ml-2 text-[14px] ${vegFilter === 'VEG' ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>Veg</span>
              </button>
              <button 
                onClick={() => setVegFilter('EGG')}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${vegFilter === 'EGG' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Egg"
              >
                <EggIcon /> <span className={`ml-2 text-[14px] ${vegFilter === 'EGG' ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>Egg</span>
              </button>
              <button 
                onClick={() => setVegFilter('NONVEG')}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${vegFilter === 'NONVEG' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Non-Veg"
              >
                <NonVegIcon /> <span className={`ml-2 text-[14px] ${vegFilter === 'NONVEG' ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>Non-Veg</span>
              </button>
            </div>

            <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Categories</h4>
            <div className="flex flex-wrap gap-2.5 mb-8 max-h-[40vh] overflow-y-auto hide-scrollbar pb-4">
              {categoryCounts.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategories(prev => 
                      prev.includes(cat.name) 
                        ? prev.filter(c => c !== cat.name)
                        : [...prev, cat.name]
                    );
                  }}
                  className={`px-5 py-2.5 rounded-xl text-[14px] font-bold transition shadow-sm ${
                    selectedCategories.includes(cat.name) ? 'bg-primary-600 text-white border-transparent' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <button onClick={() => setIsFilterOpen(false)} className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg shadow-gray-900/20 active:scale-[0.98] transition-all">
              Show Menu
            </button>
          </div>
        </div>
      )}
      {/* Global CSS for scrollbar hiding */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default Menu;

