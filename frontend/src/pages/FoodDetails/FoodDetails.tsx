import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { Star, Clock, ArrowLeft, Plus, Minus, Info } from 'lucide-react';

const FoodDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { foods, cart, addToCart, updateCartQuantity } = useStore();
  
  const food = foods.find(f => f.id === id);
  const cartItem = cart.find(item => item.id === id);
  const qty = cartItem?.quantity || 0;

  if (!food) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Food item not found</h2>
        <button onClick={() => navigate('/menu')} className="px-6 py-2 bg-primary-600 text-white rounded-full">
          Back to Menu
        </button>
      </div>
    );
  }

  const handleIncrement = () => {
    if (!food.available) return;
    if (qty === 0) addToCart(food);
    else updateCartQuantity(food.id, qty + 1);
  };

  const handleDecrement = () => {
    if (qty > 0) updateCartQuantity(food.id, qty - 1);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96 w-full bg-gray-900">
        <img 
          src={food.imageUrl} 
          alt={food.name} 
          className="w-full h-full object-cover opacity-80"
        />
        <button 
          onClick={() => navigate('/menu')}
          className="absolute top-6 left-6 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {!food.available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold px-6 py-3 bg-red-500 rounded-full text-lg shadow-xl">Currently Unavailable</span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8 border-b border-gray-100 pb-8">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-bold rounded-full">
                  {food.category}
                </span>
                {food.featured && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{food.name}</h1>
              <div className="flex items-center space-x-6 text-gray-600">
                <span className="flex items-center font-medium bg-green-50 text-green-700 px-2 py-1 rounded-md">
                  <Star className="w-5 h-5 text-green-500 mr-1 fill-current" />
                  {food.rating} Rating
                </span>
                <span className="flex items-center font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                  <Clock className="w-5 h-5 text-blue-500 mr-1" />
                  {food.prepTime} min
                </span>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-gray-500 font-medium mb-1">Price</p>
              <p className="text-4xl font-extrabold text-primary-600">₹{food.price}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-8">{food.description}</p>
              
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start">
                <Info className="w-6 h-6 text-primary-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">Food images are for illustration purposes only. Actual product may vary slightly in presentation.</p>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Order Quantity</h3>
                
                <div className="flex flex-col items-center">
                  {!food.available ? (
                    <button disabled className="w-full py-4 bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed font-bold text-lg mb-4">
                      Unavailable
                    </button>
                  ) : qty > 0 ? (
                    <div className="w-full flex items-center justify-between bg-white rounded-xl border border-primary-200 p-2 mb-4 shadow-sm">
                      <button onClick={handleDecrement} className="p-3 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg transition">
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-12 text-center font-extrabold text-xl text-gray-900">{qty}</span>
                      <button onClick={handleIncrement} className="p-3 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg transition">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleIncrement}
                      className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition shadow-lg hover:shadow-primary-500/30 mb-4"
                    >
                      Add to Cart
                    </button>
                  )}
                  
                  {qty > 0 && (
                    <button 
                      onClick={() => navigate('/cart')}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition"
                    >
                      Go to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
