import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu as MenuIcon, X } from 'lucide-react';
import { useStore } from '../../../store/StoreContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { cart } = useStore();

  const isActive = (path: string) => location.pathname === path;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Offers', path: '/offers' },
    { name: 'Orders', path: '/orders' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button (Hamburger) */}
            <button
              onClick={() => setIsOpen(true)}
              className="text-gray-500 hover:text-gray-900 focus:outline-none md:hidden mr-4"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">Elai Virundhu</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
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
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/menu" className="text-gray-500 hover:text-primary-600 transition">
              <Search className="w-5 h-5" />
            </Link>
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

          {/* Mobile right icon (Cart only) */}
          <div className="flex items-center md:hidden">
            <Link to="/cart" className="relative text-gray-500 p-2">
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

      {/* Mobile Slide-in Drawer */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />
      
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <span className="text-xl font-bold text-primary-600">Menu</span>
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`${
                isActive(link.path)
                  ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500'
                  : 'text-gray-600 hover:bg-gray-50'
              } flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <Link
            to="/profile"
            className="flex items-center justify-center w-full px-4 py-3 text-white bg-primary-600 hover:bg-primary-700 rounded-xl font-medium transition-colors shadow-sm"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-5 h-5 mr-2" />
            My Account
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
