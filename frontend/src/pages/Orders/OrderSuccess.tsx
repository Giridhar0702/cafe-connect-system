import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Package, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/StoreContext';

const OrderSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orders } = useStore();
  const order = orders.find(o => o.id === id);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Small delay to trigger entry animations
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <Link to="/" className="text-primary-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-primary-50 via-white to-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className={`relative z-10 bg-white/90 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-w-lg w-full text-center border border-white transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        
        {/* Animated Checkmark */}
        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-24 h-24 bg-gradient-to-tr from-green-500 to-green-400 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transform transition-transform duration-700 hover:scale-105">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Order Confirmed!</h1>
        <p className="text-lg text-gray-500 mb-8 font-medium">Your order <span className="text-gray-900 font-bold">#{order.id}</span> is being prepared.</p>
        
        {/* Order Details Card */}
        <div className="bg-gray-50/80 rounded-3xl p-6 mb-8 border border-gray-100/80 shadow-inner">
          <div className="flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-3 text-primary-500" />
                <span className="font-medium">Estimated Delivery</span>
              </div>
              <span className="font-bold text-gray-900">30–40 mins</span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <CreditCard className="w-5 h-5 mr-3 text-primary-500" />
                <span className="font-medium">Amount Paid</span>
              </div>
              <span className="font-bold text-primary-600 text-lg">₹{order.total.toFixed(2)}</span>
            </div>
            
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
          <Link 
            to={`/orders/${order.id}`}
            className="group flex items-center justify-center px-8 py-3.5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 hover:shadow-primary-600/40 hover:-translate-y-0.5"
          >
            <Package className="w-5 h-5 mr-2 opacity-90 group-hover:animate-bounce" />
            Track Order
          </Link>
          <Link 
            to="/menu"
            className="group flex items-center justify-center px-8 py-3.5 bg-white text-gray-700 font-bold rounded-2xl border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all hover:-translate-y-0.5"
          >
            More Food <ChevronRight className="w-5 h-5 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;
