import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { CheckCircle, Clock, ChefHat, Bike, Home, ArrowLeft } from 'lucide-react';

const statuses = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orders } = useStore();
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Link to="/orders" className="text-primary-600 hover:underline">Go to My Orders</Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statuses.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

  const getIconForStatus = (status: string, active: boolean) => {
    const className = `w-8 h-8 ${active ? 'text-primary-600' : 'text-gray-400'}`;
    switch(status) {
      case 'Placed': return <CheckCircle className={className} />;
      case 'Confirmed': return <Clock className={className} />;
      case 'Preparing': return <ChefHat className={className} />;
      case 'Ready': return <CheckCircle className={className} />;
      case 'Out for Delivery': return <Bike className={className} />;
      case 'Delivered': return <Home className={className} />;
      default: return <CheckCircle className={className} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/orders" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Orders
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 border border-gray-100">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Order Tracking</h1>
              <p className="text-gray-500 font-medium">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Expected Arrival</p>
              <p className="text-xl font-bold text-gray-900">30 - 40 min</p>
            </div>
          </div>

          {isCancelled ? (
            <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Order Cancelled</h2>
              <p className="text-red-500">This order has been cancelled.</p>
            </div>
          ) : (
            <div className="relative pl-4 md:pl-0">
              {/* Desktop Horizontal Timeline (Hidden on mobile) */}
              <div className="hidden md:flex justify-between items-center relative z-10 mb-16">
                {statuses.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isActive = index === currentStatusIndex;
                  return (
                    <div key={status} className="flex flex-col items-center relative z-20">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-white border-4 ${
                        isCompleted ? 'border-primary-500' : 'border-gray-200'
                      } ${isActive ? 'shadow-lg shadow-primary-500/30 scale-110' : ''} transition-all duration-300`}>
                        {getIconForStatus(status, isCompleted)}
                      </div>
                      <p className={`mt-4 text-sm font-bold ${isActive ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {status}
                      </p>
                    </div>
                  );
                })}
                {/* Horizontal Line */}
                <div className="absolute top-7 left-7 right-7 h-1 bg-gray-200 -z-10 rounded-full">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-1000 ease-in-out" 
                    style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="md:hidden space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {statuses.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isActive = index === currentStatusIndex;
                  return (
                    <div key={status} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 bg-white z-10 ${
                        isCompleted ? 'border-primary-500 text-primary-500' : 'border-gray-200 text-gray-400'
                      }`}>
                         {isCompleted ? <CheckCircle className="w-5 h-5 text-primary-500" /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                      </div>
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl ${
                        isActive ? 'bg-primary-50 border border-primary-100' : 'bg-white'
                      }`}>
                        <h3 className={`font-bold text-lg ${isActive ? 'text-primary-700' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{status}</h3>
                        {isActive && <p className="text-sm text-primary-600 mt-1">Currently in progress...</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-12 bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 text-lg border-b border-gray-200 pb-4">Order Details</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-gray-700 border border-gray-200 mr-4">
                      {item.quantity}x
                    </div>
                    <span className="font-medium text-gray-800">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            {/* Price Details */}
            <div className="mt-6 pt-6 border-t border-dashed border-gray-300">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{(() => {
                    const sub = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                    return sub.toFixed(2);
                  })()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Partner Fee</span>
                  <span className="font-medium">₹30.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>CGST (2.5%)</span>
                  <span className="font-medium">₹{(() => {
                    const sub = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                    return (sub * 0.025).toFixed(2);
                  })()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>SGST (2.5%)</span>
                  <span className="font-medium">₹{(() => {
                    const sub = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                    return (sub * 0.025).toFixed(2);
                  })()}</span>
                </div>
                
                {/* Round Off */}
                <div className="flex justify-between text-gray-500 text-xs italic">
                  <span>Round Off</span>
                  <span>{(() => {
                    const sub = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                    const exact = sub + 30 + (sub * 0.05);
                    const diff = Math.ceil(exact) - exact;
                    return diff > 0 ? `+₹${diff.toFixed(2)}` : `₹0.00`;
                  })()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="font-extrabold text-gray-900 text-lg">Grand Total</span>
                <span className="font-black text-gray-900 text-xl">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
