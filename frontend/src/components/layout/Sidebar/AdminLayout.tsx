import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pizza, ShoppingBag, Users, MessageSquare, LogOut, MapPin, Menu, X, Bell, Package } from 'lucide-react';
import { useStore } from '../../../store/StoreContext';

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    // Play a distinct two-tone chime
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
    oscillator.frequency.setValueAtTime(1760, audioCtx.currentTime + 0.15); 
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime + 0.15);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch(e) {
    console.error('Audio play failed', e);
  }
};

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orders, isAdminLoggedIn, setAdminLoggedIn } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevOrdersLength = useRef(orders.length);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
    }
  }, [isAdminLoggedIn, navigate]);

  useEffect(() => {
    // Detect new orders
    if (orders.length > prevOrdersLength.current) {
      const diff = orders.length - prevOrdersLength.current;
      setUnreadCount(prev => prev + diff);
      playNotificationSound();
    }
    prevOrdersLength.current = orders.length;
  }, [orders.length]);

  const handleNotificationClick = () => {
    setUnreadCount(0);
    navigate('/admin/orders');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Food Menu', path: '/admin/foods', icon: <Pizza className="w-5 h-5" /> },
    { name: 'Stock Limits', path: '/admin/stock', icon: <Package className="w-5 h-5" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users className="w-5 h-5" /> },
    { name: 'Locations', path: '/admin/locations', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-gray-900 text-white fixed h-full z-40 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary-500">Admin Panel</h2>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl transition ${
                location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                  ? 'bg-primary-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => {
              setAdminLoggedIn(false);
              navigate('/admin/login');
            }}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:text-red-300 transition"
          >
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between md:justify-end px-4 md:px-8 sticky top-0 z-10">
          <button 
            className="md:hidden text-gray-500 hover:text-gray-900 focus:outline-none p-2 -ml-2" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleNotificationClick}
              className="relative text-gray-500 hover:text-gray-900 transition-colors p-1"
              title="Notifications"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center border-l border-gray-200 pl-6">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold mr-2">
                A
              </div>
              <span className="font-medium text-gray-700">Admin User</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
