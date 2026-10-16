import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Pizza, ShoppingBag, Users, MessageSquare, MapPin, 
  Menu, X, Bell, Package, Bike, User, Edit2, Search, Layers, Volume2, VolumeX, CheckCircle2 
} from 'lucide-react';
import { useStore } from '../../../store/StoreContext';
import type { Order } from '../../../types';
import { orderAlarm } from '../../../utils/alarm';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orders, isAdminLoggedIn, setAdminLoggedIn, adminSearchQuery, setAdminSearchQuery } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestAlertOrder, setLatestAlertOrder] = useState<Order | null>(null);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState<string | null>(null);

  // Track known order IDs to strictly avoid false alarms on page refresh
  const knownOrderIds = useRef<Set<string> | null>(null);

  // Subscribe to continuous alarm state
  useEffect(() => {
    const unsubscribe = orderAlarm.subscribe((active) => {
      setIsAlarmRinging(active);
    });
    return unsubscribe;
  }, []);

  // Unlock Web Audio on first user interaction anywhere in the window
  useEffect(() => {
    const unlock = () => {
      orderAlarm.getContext();
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Request browser desktop notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
    }
  }, [isAdminLoggedIn, navigate]);

  // When admin navigates to /admin/orders, stop the alarm
  useEffect(() => {
    if (location.pathname === '/admin/orders') {
      orderAlarm.stopAlarm();
      setLatestAlertOrder(null);
    }
  }, [location.pathname]);

  // Real-time new order listener
  useEffect(() => {
    if (orders.length === 0 && knownOrderIds.current === null) {
      return;
    }

    // First time loading orders on page: memorize without triggering alarm
    if (knownOrderIds.current === null) {
      knownOrderIds.current = new Set(orders.map(o => o.id));
      return;
    }

    // Subsequent polls: detect genuine newly placed incoming orders
    const newOrders = orders.filter(o => !knownOrderIds.current!.has(o.id));
    if (newOrders.length > 0) {
      // Add all to known set
      newOrders.forEach(o => knownOrderIds.current!.add(o.id));
      
      setUnreadCount(prev => prev + newOrders.length);
      setLatestAlertOrder(newOrders[0]);
      
      // Start continuous ringing until viewed on orders page
      orderAlarm.startAlarm();

      // Desktop system notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('🚨 New Order Received!', {
            body: `Order #${newOrders[0].id} from ${newOrders[0].customerName} (₹${newOrders[0].total})`,
            icon: '/favicon.ico',
          });
        } catch {
          // ignore
        }
      }
    }
  }, [orders]);

  const handleViewOrder = () => {
    orderAlarm.stopAlarm();
    setLatestAlertOrder(null);
    setUnreadCount(0);
    navigate('/admin/orders');
  };

  const handleStopAlarm = () => {
    orderAlarm.stopAlarm();
    setSoundFeedback('Alarm silenced');
    setTimeout(() => setSoundFeedback(null), 2500);
  };

  const handleTestTone = () => {
    if (isAlarmRinging) {
      orderAlarm.stopAlarm();
    } else {
      orderAlarm.playTone();
      setSoundFeedback('Alarm tone played!');
      setTimeout(() => setSoundFeedback(null), 2500);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Food Menu', path: '/admin/foods', icon: <Pizza className="w-5 h-5" /> },
    { name: 'Categories', path: '/admin/categories', icon: <Layers className="w-5 h-5" /> },
    { name: 'Stock Limits', path: '/admin/stock', icon: <Package className="w-5 h-5" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users className="w-5 h-5" /> },
    { name: 'Locations', path: '/admin/locations', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Delivery Partners', path: '/admin/delivery', icon: <Bike className="w-5 h-5" /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* CONTINUOUS ALARM ALERT BANNER */}
      {(isAlarmRinging || latestAlertOrder) && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-2xl flex items-center justify-between z-50 sticky top-0 border-b-2 border-red-700 animate-pulse">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-white/20 rounded-full animate-bounce">
              <Bell className="w-6 h-6 text-white" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-block px-2 py-0.5 bg-white text-red-700 text-[11px] font-black uppercase tracking-wider rounded">
                  🚨 Continuous Alarm Active
                </span>
                <span className="font-bold text-sm tracking-wide">
                  New Order: #{latestAlertOrder?.id || 'Incoming'}
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                {latestAlertOrder ? `${latestAlertOrder.customerName} • ₹${latestAlertOrder.total} • ${latestAlertOrder.items.length} items` : 'Ringing until viewed on orders page...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleViewOrder}
              className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 rounded-lg text-xs font-black tracking-wide uppercase transition-all shadow-md active:scale-95 flex items-center"
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              View in Orders Page
            </button>
            <button
              onClick={handleStopAlarm}
              className="px-3 py-2 bg-red-800/80 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition-all border border-red-500/50 flex items-center"
              title="Stop ringing"
            >
              <VolumeX className="w-4 h-4 mr-1" />
              Stop Alarm
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <div className={`w-64 bg-gray-900 text-white fixed h-full z-40 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6 flex flex-col items-center justify-center pt-10 border-b border-white/10 relative">
            <button className="md:hidden text-white/70 hover:text-white absolute top-4 right-4" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-xs font-bold tracking-widest text-white/80 mb-4 uppercase">Admin</div>
            
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-4 border-4 border-white/20">
              <User className="w-10 h-10 text-gray-900" />
            </div>
            
            <h2 className="text-lg font-bold text-white mb-1">Elai Virundhu Admin</h2>
            <button className="text-xs font-medium text-white/80 hover:text-white flex items-center mb-4 transition-colors">
              EDIT PROFILE <Edit2 className="w-3 h-3 ml-1" />
            </button>
          </div>

          <nav className="flex-1 py-4 flex flex-col">
            {navItems.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-6 py-3.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-gray-800 text-white font-semibold shadow-inner border-l-4 border-primary-500'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white font-medium border-l-4 border-transparent'
                  }`}
                >
                  <span className="mr-4">{item.icon}</span>
                  <span className="text-sm tracking-wide">{item.name.toUpperCase()}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="md:ml-64 flex-1 flex flex-col min-h-screen overflow-hidden bg-[#F4F5F7]">
          <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 border-b border-gray-100">
            <div className="flex items-center flex-1">
              <button 
                className="md:hidden text-gray-500 hover:text-gray-900 focus:outline-none p-2 -ml-2 mr-2" 
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:flex items-center text-gray-400 border border-gray-200 rounded-full px-4 py-2 bg-gray-50 w-64 focus-within:ring-2 focus-within:ring-primary-500 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none text-sm text-gray-700 w-full"
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Test / Silence Alarm Button */}
              <button
                onClick={handleTestTone}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 ${
                  isAlarmRinging
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-600 animate-pulse'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                }`}
                title={isAlarmRinging ? 'Silence continuous alarm' : 'Test kitchen alarm buzzer tone'}
              >
                {isAlarmRinging ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Silence Alarm</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Test Alarm Tone</span>
                  </>
                )}
              </button>

              {soundFeedback && (
                <span className="text-xs font-semibold text-emerald-600 animate-fade-in flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {soundFeedback}
                </span>
              )}

              {/* Notification Bell */}
              <button 
                onClick={handleViewOrder}
                className={`relative text-gray-500 hover:text-[#CD424F] transition-colors p-2 rounded-full hover:bg-gray-100 ${isAlarmRinging ? 'text-red-600 animate-bounce' : ''}`}
                title="View Orders"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Signout */}
              <div 
                className="flex items-center border-l border-gray-200 pl-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  orderAlarm.stopAlarm();
                  setAdminLoggedIn(false);
                  navigate('/admin/login');
                }}
              >
                <User className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-600 text-sm tracking-wide uppercase mr-2">SIGNOUT</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 overflow-x-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
