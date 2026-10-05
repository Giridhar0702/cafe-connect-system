import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

const Cart: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useStore();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const delivery = subtotal > 0 ? 30 : 0;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + delivery + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-6">
          <span className="text-6xl">🛒</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">Looks like you haven't added anything to your cart yet. Go ahead and explore our delicious menu.</p>
        <button 
          onClick={() => navigate('/menu')}
          className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition shadow-lg hover:shadow-primary-500/30"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">MY CART</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-800">Items ({cart.length})</h2>
                <button 
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Clear Cart
                </button>
              </div>
              <ul className="divide-y divide-gray-100">
                {cart.map(item => (
                  <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-xl shadow-sm" />
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-primary-600 font-semibold mb-4 sm:mb-0">₹{item.price}</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200">
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-l-lg transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-semibold text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-r-lg transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
              
              <div className="space-y-4 text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-medium text-gray-900">₹{delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">TOTAL</span>
                    <span className="text-2xl font-bold text-primary-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition shadow-lg hover:shadow-primary-500/30 flex items-center justify-center group"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
