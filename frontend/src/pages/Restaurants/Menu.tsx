import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { Star, Search, Plus, Minus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Menu: React.FC = () => {
  const { foods, categories, cart, addToCart, updateCartQuantity } = useStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredFoods = foods.filter(food => {
    const matchesCategory = activeCategory === 'All' || food.category === activeCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          food.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Our Menu</h1>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm shadow-sm transition"
            placeholder="Search food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar space-x-4 justify-start md:justify-center">
          <button
            onClick={() => setActiveCategory('All')}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition ${
              activeCategory === 'All' ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition ${
                activeCategory === cat ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Grid */}
        {filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods.map(food => {
              const qty = getCartQuantity(food.id);
              return (
                <div 
                  key={food.id} 
                  onClick={() => navigate(`/food/${food.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col cursor-pointer border border-gray-100"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                    {!food.available && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-gray-900 font-bold px-4 py-2 bg-white rounded-full text-sm shadow-lg">Currently Unavailable</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{food.name}</h3>
                      <span className="font-bold text-primary-600 text-lg">₹{food.price}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{food.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                        <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                        {food.rating}
                      </div>

                      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                        {!food.available ? (
                          <button disabled className="px-4 py-2 bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed font-medium">
                            Unavailable
                          </button>
                        ) : qty > 0 ? (
                          <div className="flex items-center bg-primary-50 rounded-lg border border-primary-200">
                            <button onClick={(e) => handleDecrement(e, food.id)} className="p-2 text-primary-600 hover:bg-primary-100 rounded-l-lg transition">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold text-primary-700">{qty}</span>
                            <button onClick={(e) => handleIncrement(e, food)} className="p-2 text-primary-600 hover:bg-primary-100 rounded-r-lg transition">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => handleIncrement(e, food)}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium shadow-sm hover:shadow-md"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No food items found</h3>
            <p className="text-gray-500">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
