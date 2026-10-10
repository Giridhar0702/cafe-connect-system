import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Pizza, ShoppingBag, Users, MessageSquare, MapPin, Menu, X, Bell, Package, Bike, User, Edit2, Search } from 'lucide-react';
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
  const { orders, isAdminLoggedIn, setAdminLoggedIn, adminSearchQuery, setAdminSearchQuery } = useStore();
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
    { name: 'Delivery Partners', path: '/admin/delivery', icon: <Bike className="w-5 h-5" /> },
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

          <div className="flex items-center space-x-6">
            <button 
              onClick={handleNotificationClick}
              className="relative text-gray-500 hover:text-[#CD424F] transition-colors p-1"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <div 
              className="flex items-center border-l border-gray-200 pl-6 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                setAdminLoggedIn(false);
                navigate('/admin/login');
              }}
            >
              <User className="w-5 h-5 text-gray-600 mr-2" />
              <span className="font-medium text-gray-600 text-sm tracking-wide uppercase mr-4">SIGNOUT</span>
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
