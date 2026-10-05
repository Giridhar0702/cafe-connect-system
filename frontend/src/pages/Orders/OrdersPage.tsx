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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>
        
        {/* Filters */}
        <div className="flex overflow-x-auto pb-4 mb-6 hide-scrollbar space-x-2">
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
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Order ID</p>
                    <p className="text-lg font-bold text-gray-900">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Date</p>
                    <p className="text-gray-900 font-medium">{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Total Amount</p>
                    <p className="text-gray-900 font-bold text-lg">₹{order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex-1 w-full">
                    <p className="text-sm font-bold text-gray-900 mb-3">Items</p>
                    <p className="text-gray-600 line-clamp-2">
                      {order.items.map(item => `${item.quantity} x ${item.name}`).join(', ')}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center whitespace-nowrap"
                  >
                    View Details <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
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
