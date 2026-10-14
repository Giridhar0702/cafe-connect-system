import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { Package, ChevronRight, ShieldAlert, Search, Clock, CheckCircle2, Bike, AlertCircle, ShoppingBag } from 'lucide-react';

const OrdersPage: React.FC = () => {
  const { orders } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Cancelled
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Bike className="w-3.5 h-3.5 mr-1" /> Out for Delivery
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <Clock className="w-3.5 h-3.5 mr-1" /> {status}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter(order => {
    // Status filter
    if (filter === 'Active' && ['Delivered', 'Cancelled'].includes(order.status)) return false;
    if (filter === 'Completed' && order.status !== 'Delivered') return false;
    if (filter === 'Cancelled' && order.status !== 'Cancelled') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchId = order.id?.toLowerCase().includes(query);
      const matchItem = (order.items || []).some(item => item.name?.toLowerCase().includes(query));
      const matchAddress = order.address?.toLowerCase().includes(query);
      return matchId || matchItem || matchAddress;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50/60 py-6 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
              <ShoppingBag className="w-8 h-8 mr-3 text-primary-600" /> My Orders
            </h1>
            <p className="text-gray-500 text-sm mt-1">Track current orders and review your past order history</p>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white font-bold text-sm rounded-xl hover:bg-primary-700 transition shadow-sm"
          >
            Order Food
          </Link>
        </div>

        {/* Terms & Conditions Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 flex items-start space-x-3 text-amber-950 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-amber-900 uppercase tracking-wide mr-1.5">Terms & Conditions:</span>
            <span className="font-semibold text-amber-800">
              Please note that once an order is placed, no cancellation is available and no refund will be provided at any cost.
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Status Filter Buttons */}
          <div className="flex overflow-x-auto pb-1 sm:pb-0 space-x-2">
            {(['All', 'Active', 'Completed', 'Cancelled'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  filter === f
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
        </div>

        {/* Orders List or Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
              {searchQuery ? (
                <>No orders matched your search &ldquo;{searchQuery}&rdquo;.</>
              ) : filter !== 'All' ? (
                <>You don&apos;t have any {filter.toLowerCase()} orders right now.</>
              ) : (
                <>You haven&apos;t placed any orders yet. Explore our delicious menu today!</>
              )}
            </p>
            <Link
              to="/menu"
              className="px-8 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition inline-block shadow-md shadow-primary-600/20"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-5 sm:p-6 flex flex-col gap-4">
                  {/* Card Header */}
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-extrabold text-gray-900">Order #{order.id}</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">
                        {order.date
                          ? new Date(order.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Recent'}
                      </p>
                      {order.address && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-1" title={order.address}>
                          <span className="font-semibold text-gray-500">Deliver to:</span> {order.address}
                        </p>
                      )}
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Card Body - Items */}
                  <div className="py-1">
                    <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">Items</p>
                    <div className="space-y-1.5">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-800 font-medium">
                            <span className="inline-block w-6 font-bold text-primary-600">{item.quantity}x</span> {item.name}
                          </span>
                          <span className="text-gray-600 font-semibold">
                            ₹{(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-100 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Total Amount</p>
                      <p className="text-gray-900 font-black text-xl">₹{Number(order.total || 0).toFixed(2)}</p>
                      <p className="text-[11px] text-amber-700 font-medium mt-0.5 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 inline-block"></span>
                        No cancellation &bull; Non-refundable
                      </p>
                    </div>

                    <div className="w-full sm:w-auto flex space-x-3">
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-colors flex items-center justify-center text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center text-sm shadow-sm"
                      >
                        Track Order <ChevronRight className="w-4 h-4 ml-1" />
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

export default OrdersPage;
