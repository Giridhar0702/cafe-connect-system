import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Home, Utensils, ShoppingBag } from 'lucide-react';
import { useStore } from '../../../store/StoreContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { cart } = useStore();

  const isActive = (path: string) => location.pathname === path;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5 mb-1" /> },
    { name: 'Menu', path: '/menu', icon: <Utensils className="w-5 h-5 mb-1" /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingBag className="w-5 h-5 mb-1" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5 mb-1" /> },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Desktop logo (hidden mobile hamburger) */}
            <div className="hidden md:block mr-4" />
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src="/logo.png" alt="Elai Virundhu & Cafe" className="h-12 w-auto object-contain" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.filter(link => link.name !== 'Profile').map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`${
                  isActive(link.path)
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                } px-1 py-2 text-sm font-medium transition-colors`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/about"
              className={`${
                isActive('/about')
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
              } px-1 py-2 text-sm font-medium transition-colors`}
            >
              About
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {!isActive('/menu') && (
              <Link to="/menu" className="text-gray-500 hover:text-primary-600 transition">
                <Search className="w-5 h-5" />
              </Link>
            )}
            <Link to="/cart" className="relative text-gray-500 hover:text-primary-600 transition">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="text-gray-500 hover:text-primary-600 transition">
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile right icons */}
          <div className="flex items-center space-x-1 md:hidden">
            <button 
              onClick={(e) => {
                if (location.pathname === '/menu') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  window.dispatchEvent(new CustomEvent('focus-search'));
                } else {
                  window.location.href = '/menu?search=open';
                }
              }} 
              className="text-gray-500 p-2 hover:text-primary-600 transition"
            >
              <Search className="w-6 h-6" />
            </button>
            <Link to="/cart" className="relative text-gray-500 p-2 hover:text-primary-600 transition">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive(link.path)
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {link.icon}
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
