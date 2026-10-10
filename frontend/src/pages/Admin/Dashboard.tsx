import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { ShoppingBag, DollarSign, Clock, Users, AlertTriangle, X, TrendingUp, PieChart, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { orders, isStoreOpen, storeReopenDate, storeCloseReason, setStoreStatus } = useStore();
  
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [tempDate, setTempDate] = useState(storeReopenDate);
  const [tempReason, setTempReason] = useState('Kitchen Rush');
  const [customReason, setCustomReason] = useState('');
  const [tempCloseType, setTempCloseType] = useState<'TOTAL' | 'ONLINE_ONLY'>('ONLINE_ONLY');
  const [reportType, setReportType] = useState<'TODAY' | 'ALL_TIME'>('TODAY');

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

  // Analytics Calculations
  const ordersToAnalyze = reportType === 'TODAY' ? todayOrders : orders;
  const totalAnalyzedRevenue = ordersToAnalyze.reduce((acc, order) => acc + order.total, 0);

  const itemSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
  const categorySales: Record<string, number> = {};

  ordersToAnalyze.forEach(order => {
    order.items.forEach(item => {
      if (!itemSales[item.id]) {
        itemSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
      }
      itemSales[item.id].quantity += item.quantity;
      itemSales[item.id].revenue += item.price * item.quantity;

      if (!categorySales[item.category]) {
        categorySales[item.category] = 0;
      }
      categorySales[item.category] += item.price * item.quantity;
    });
  });

  const topItems = Object.values(itemSales).sort((a, b) => b.quantity - a.quantity);
  const topCategories = Object.entries(categorySales).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Restaurant Status</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isStoreOpen 
              ? 'The restaurant is currently open and accepting orders.' 
              : `The restaurant is closed due to: ${storeCloseReason || 'Other'}. Reopening on: ${new Date(storeReopenDate).toLocaleString()}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`text-sm font-bold ${!isStoreOpen ? 'text-gray-400' : 'text-green-600'}`}>
            {isStoreOpen ? 'OPEN' : 'CLOSED'}
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
                <h3 className="text-xl font-bold">CLOSE THE RESTAURANT</h3>
              </div>
              <button onClick={() => setShowCloseModal(false)} className="text-red-400 hover:text-red-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Closure Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={tempCloseType === 'ONLINE_ONLY'} 
                      onChange={() => setTempCloseType('ONLINE_ONLY')}
                      className="text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="text-gray-700 font-medium text-sm">Online Only</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={tempCloseType === 'TOTAL'} 
                      onChange={() => setTempCloseType('TOTAL')}
                      className="text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="text-gray-700 font-medium text-sm">Totally Closed</span>
                  </label>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                {tempCloseType === 'ONLINE_ONLY' 
                  ? "Customers can't place online orders, but they will be directed to visit the physical restaurant." 
                  : "The entire restaurant is closed. Customers cannot order or visit."}
              </p>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Reason for closing
                </label>
                <select
                  value={tempReason}
                  onChange={(e) => setTempReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition mb-4"
                >
                  <option value="Kitchen Rush">Kitchen Rush</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cannot Deliverable">Cannot Deliverable</option>
                  <option value="Any Other">Any Other</option>
                </select>
                
                {tempReason === 'Any Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition mb-4"
                    required
                  />
                )}
                
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  When will the restaurant reopen?
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
                  const finalReason = tempReason === 'Any Other' ? (customReason || 'Other') : tempReason;
                  setStoreStatus(false, tempDate, finalReason, tempCloseType);
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

      {/* Analysis & Reports Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-10 mb-4 gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-primary-500" /> {reportType === 'TODAY' ? "Today's Sales Report" : "All-Time Sales Report"}
        </h2>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setReportType('TODAY')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${reportType === 'TODAY' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Today
          </button>
          <button 
            onClick={() => setReportType('ALL_TIME')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${reportType === 'ALL_TIME' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            All Time
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" /> Products Sold {reportType === 'TODAY' ? 'Today' : '(All Time)'}
            </h3>
            <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Total: ₹{totalAnalyzedRevenue}</span>
          </div>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-grow pr-2">
            {topItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 border border-gray-200 shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} units sold</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="font-bold text-green-600">₹{item.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {topItems.length === 0 && <p className="text-gray-500 text-sm italic">No sales data available {reportType === 'TODAY' ? 'for today ' : ''}yet.</p>}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 text-blue-500 mr-2" /> {reportType === 'TODAY' ? "Today's" : "All-Time"} Revenue by Category
            </h3>
          </div>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-grow pr-2">
            {topCategories.map(([catName, revenue], idx) => {
              const totalRev = Object.values(categorySales).reduce((a, b) => a + b, 0);
              const percentage = totalRev > 0 ? ((revenue / totalRev) * 100).toFixed(1) : 0;
              return (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-700 text-sm">{catName}</span>
                    <span className="font-bold text-gray-900 text-sm">₹{revenue.toFixed(2)} <span className="text-gray-400 font-normal text-xs">({percentage}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            {topCategories.length === 0 && <p className="text-gray-500 text-sm italic">No category data available yet.</p>}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
