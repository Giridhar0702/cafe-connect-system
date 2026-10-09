import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { Package, ChevronRight } from 'lucide-react';

const Orders: React.FC = () => {
  const { orders } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const filteredOrders = orders.filter(order => {
    if (filter === 'All') return true;
    if (filter === 'Active') return !['Delivered', 'Cancelled'].includes(order.status);
    if (filter === 'Completed') return order.status === 'Delivered';
    if (filter === 'Cancelled') return order.status === 'Cancelled';
    return true;
  });

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 py-6 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>
        
        {/* Filters */}
        <div className="flex overflow-x-auto pb-4 mb-6 hide-scrollbar space-x-3">
          {['All', 'Active', 'Completed', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition ${
                filter === f ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">You don't have any {filter.toLowerCase()} orders right now.</p>
            <Link to="/menu" className="px-8 py-3 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition inline-block">
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-4 sm:p-6 flex flex-col gap-4">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start border-b border-dashed border-gray-200 pb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-extrabold text-gray-900">Elai Virundhu & Cafe</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">Sathyamangalam • {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-200' :
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  
                  {/* Card Body - Items */}
                  <div className="py-2">
                    <p className="text-gray-700 font-medium leading-relaxed">
                      {order.items.map(item => `${item.quantity} x ${item.name}`).join(', ')}
                    </p>
                  </div>
                  
                  {/* Card Footer - Total & Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-50 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Total Amount</p>
                      <p className="text-gray-900 font-black text-lg">₹{order.total.toFixed(2)}</p>
                    </div>
                    <div className="w-full sm:w-auto flex space-x-3">
                      <button 
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-colors flex items-center justify-center"
                      >
                        View Order
                      </button>
                      <button 
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center"
                      >
                        Track <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
