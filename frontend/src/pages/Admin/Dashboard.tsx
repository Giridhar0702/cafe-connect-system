import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { ShoppingBag, DollarSign, Clock, Users, AlertTriangle, X, TrendingUp, PieChart, Activity, Calendar, SlidersHorizontal } from 'lucide-react';

type ReportPeriod = 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'CUSTOM' | 'ALL_TIME';

const Dashboard: React.FC = () => {
  const { orders, isStoreOpen, storeReopenDate, storeCloseReason, setStoreStatus } = useStore();
  
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [tempDate, setTempDate] = useState(storeReopenDate);
  const [tempReason, setTempReason] = useState('Kitchen Rush');
  const [customReason, setCustomReason] = useState('');
  const [tempCloseType, setTempCloseType] = useState<'TOTAL' | 'ONLINE_ONLY'>('ONLINE_ONLY');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('TODAY');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);

  const toLocalDateStr = (d: Date | string) => {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toLocalDateStr(d);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => toLocalDateStr(new Date()));

  const todayOrders = orders.filter(o => {
    const today = toLocalDateStr(new Date());
    const orderDate = toLocalDateStr(o.date);
    return today === orderDate;
  });

  const todayRevenue = todayOrders.reduce((acc, order) => acc + order.total, 0);
  const pendingOrders = orders.filter(o => ['Placed', 'Confirmed', 'Preparing'].includes(o.status)).length;

  const stats = [
    { title: "Today's Orders", value: todayOrders.length, icon: <ShoppingBag className="w-8 h-8 text-white" />, iconBg: "bg-white/20", cardBg: "bg-[#CD424F]", textColor: "text-white", titleColor: "text-red-100", border: "border-transparent" },
    { title: "Today's Revenue", value: `₹${todayRevenue}`, icon: <DollarSign className="w-8 h-8 text-white" />, iconBg: "bg-white/20", cardBg: "bg-[#EFAF3D]", textColor: "text-white", titleColor: "text-yellow-100", border: "border-transparent" },
    { title: "Pending Orders", value: pendingOrders, icon: <Clock className="w-8 h-8 text-[#CD424F]" />, iconBg: "bg-red-50", cardBg: "bg-white", textColor: "text-gray-900", titleColor: "text-gray-500", border: "border-gray-100" },
    { title: "Total Customers", value: "125", icon: <Users className="w-8 h-8 text-[#EFAF3D]" />, iconBg: "bg-yellow-50", cardBg: "bg-white", textColor: "text-gray-900", titleColor: "text-gray-500", border: "border-gray-100" },
  ];

  // Analytics Calculations with Period Filters
  const ordersToAnalyze = orders.filter(order => {
    // Date filter
    const orderDateStr = toLocalDateStr(order.date);
    const today = new Date();
    const todayStr = toLocalDateStr(today);

    switch (reportPeriod) {
      case 'TODAY':
        return orderDateStr === todayStr;

      case 'YESTERDAY': {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return orderDateStr === toLocalDateStr(y);
      }

      case 'LAST_7_DAYS': {
        const d = new Date(today);
        d.setDate(d.getDate() - 7);
        d.setHours(0, 0, 0, 0);
        return new Date(order.date).getTime() >= d.getTime();
      }

      case 'THIS_MONTH': {
        const oDate = new Date(order.date);
        return oDate.getFullYear() === today.getFullYear() && oDate.getMonth() === today.getMonth();
      }

      case 'CUSTOM': {
        const matchStart = customStartDate ? orderDateStr >= customStartDate : true;
        const matchEnd = customEndDate ? orderDateStr <= customEndDate : true;
        return matchStart && matchEnd;
      }

      case 'ALL_TIME':
      default:
        return true;
    }
  });

  const getPeriodLabel = () => {
    switch (reportPeriod) {
      case 'TODAY': return "Today's";
      case 'YESTERDAY': return "Yesterday's";
      case 'LAST_7_DAYS': return "Last 7 Days";
      case 'THIS_MONTH': return "This Month's";
      case 'CUSTOM': return "Custom Range";
      case 'ALL_TIME': return "All-Time";
    }
  };

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
          <div key={idx} className={`${stat.cardBg} p-6 rounded-2xl shadow-sm border ${stat.border} flex items-center space-x-4 transition-transform hover:-translate-y-1`}>
            <div className={`p-4 rounded-xl ${stat.iconBg}`}>
              {stat.icon}
            </div>
            <div>
              <p className={`text-sm font-medium ${stat.titleColor}`}>{stat.title}</p>
              <h3 className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analysis & Reports Section Header with Filters Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-10 mb-4 gap-4 relative">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary-500" /> {getPeriodLabel()} Sales Report
          </h2>
          {reportPeriod !== 'TODAY' && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">Filter:</span>
              <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full border border-primary-200">
                {getPeriodLabel()}
              </span>
              <button
                onClick={() => setReportPeriod('TODAY')}
                className="text-xs text-red-500 hover:text-red-700 font-medium underline ml-1 cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Filters Button */}
        <div className="relative">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer ${
              isFilterDropdownOpen || reportPeriod !== 'TODAY'
                ? 'border-primary-500 bg-white text-primary-600 shadow-md ring-2 ring-primary-100'
                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-700" />
            <span>Filters</span>
            {reportPeriod !== 'TODAY' && (
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            )}
          </button>

          {/* Filters Dropdown Popover */}
          {isFilterDropdownOpen && (
            <>
              {/* Invisible backdrop to close on outside click */}
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setIsFilterDropdownOpen(false)}
              />
              
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
                    <SlidersHorizontal className="w-4 h-4 text-primary-500" />
                    <span>Filter Sales Analytics</span>
                  </div>
                  <button 
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Date Period Options */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Date Period
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'TODAY', label: 'Today' },
                      { id: 'YESTERDAY', label: 'Yesterday' },
                      { id: 'LAST_7_DAYS', label: '7 Days' },
                      { id: 'THIS_MONTH', label: 'Month' },
                      { id: 'CUSTOM', label: 'Custom' },
                      { id: 'ALL_TIME', label: 'All Time' },
                    ].map((period) => (
                      <button
                        key={period.id}
                        onClick={() => setReportPeriod(period.id as ReportPeriod)}
                        className={`px-3 py-2 text-xs font-bold rounded-xl transition border cursor-pointer ${
                          reportPeriod === period.id
                            ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range Inputs */}
                {reportPeriod === 'CUSTOM' && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                      <Calendar className="w-3.5 h-3.5 text-primary-500" />
                      <span>Custom Date Range</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-[11px] text-gray-500 mb-1">From:</span>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] text-gray-500 mb-1">To:</span>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setReportPeriod('TODAY')}
                    className="text-xs text-gray-500 hover:text-red-600 font-semibold transition cursor-pointer"
                  >
                    Reset to Today
                  </button>
                  <button
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" /> Products Sold ({getPeriodLabel()})
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
            {topItems.length === 0 && <p className="text-gray-500 text-sm italic">No sales data available for selected filter.</p>}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 text-blue-500 mr-2" /> {getPeriodLabel()} Revenue by Category
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
