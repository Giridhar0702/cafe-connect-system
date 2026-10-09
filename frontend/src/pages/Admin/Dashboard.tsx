import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { ShoppingBag, DollarSign, Clock, Users, AlertTriangle, X } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { orders, isStoreOpen, storeReopenDate, setStoreStatus } = useStore();
  
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [tempDate, setTempDate] = useState(storeReopenDate);

  const todayOrders = orders.filter(o => {
    const today = new Date().toISOString().split('T')[0];
    const orderDate = new Date(o.date).toISOString().split('T')[0];
    return today === orderDate;
  });

  const todayRevenue = todayOrders.reduce((acc, order) => acc + order.total, 0);
  const pendingOrders = orders.filter(o => ['Placed', 'Confirmed', 'Preparing'].includes(o.status)).length;

  const stats = [
    { title: "Today's Orders", value: todayOrders.length, icon: <ShoppingBag className="w-8 h-8 text-blue-500" />, bg: "bg-blue-50" },
    { title: "Today's Revenue", value: `₹${todayRevenue}`, icon: <DollarSign className="w-8 h-8 text-green-500" />, bg: "bg-green-50" },
    { title: "Pending Orders", value: pendingOrders, icon: <Clock className="w-8 h-8 text-yellow-500" />, bg: "bg-yellow-50" },
    { title: "Total Customers", value: "125", icon: <Users className="w-8 h-8 text-purple-500" />, bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Store Status</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isStoreOpen 
              ? 'The store is currently open and accepting orders.' 
              : `The store is closed. Reopening on: ${new Date(storeReopenDate).toLocaleString()}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`text-sm font-bold ${!isStoreOpen ? 'text-gray-400' : 'text-green-600'}`}>
            {isStoreOpen ? 'ONLINE' : 'OFFLINE'}
          </span>
          <button
            onClick={() => {
              if (isStoreOpen) {
                // If it's open, open the modal to confirm and set date
                setShowCloseModal(true);
              } else {
                // If it's closed, turn it back on directly
                setStoreStatus(true, '');
                setTempDate('');
              }
            }}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isStoreOpen ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isStoreOpen ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-red-50 p-6 flex justify-between items-start border-b border-red-100">
              <div className="flex items-center text-red-700">
                <AlertTriangle className="w-6 h-6 mr-3" />
                <h3 className="text-xl font-bold">Turn Off Store</h3>
              </div>
              <button onClick={() => setShowCloseModal(false)} className="text-red-400 hover:text-red-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-gray-600">
                Are you sure you want to close the store? Customers will not be able to place any orders until you turn it back on.
              </p>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  When will the store reopen?
                </label>
                <input
                  type="datetime-local"
                  required
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
                />
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!tempDate) {
                    alert("Please select a reopen date and time.");
                    return;
                  }
                  setStoreStatus(false, tempDate);
                  setShowCloseModal(false);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition"
              >
                Confirm & Close Store
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
