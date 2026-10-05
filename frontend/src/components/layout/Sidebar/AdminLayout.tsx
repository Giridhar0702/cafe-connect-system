import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Pizza, ShoppingBag, Users, Tag, MessageSquare, LogOut, MapPin } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Food Menu', path: '/admin/foods', icon: <Pizza className="w-5 h-5" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users className="w-5 h-5" /> },
    { name: 'Offers', path: '/admin/offers', icon: <Tag className="w-5 h-5" /> },
    { name: 'Locations', path: '/admin/locations', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white fixed h-full z-20 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary-500">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
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
          <Link to="/" className="flex items-center px-4 py-3 text-gray-400 hover:text-white transition">
            <LogOut className="w-5 h-5 mr-3" /> Exit Admin
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm h-16 flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold mr-2">
              A
            </div>
            <span className="font-medium text-gray-700">Admin User</span>
          </div>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
