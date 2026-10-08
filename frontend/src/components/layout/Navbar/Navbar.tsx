import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Search, Home, Utensils, ShoppingBag } from 'lucide-react';
import { useStore } from '../../../store/StoreContext';

const CartBucketIcon: React.FC<{ count: number, className?: string }> = ({ count, className = "w-8 h-8" }) => (
  <div className={`relative ${className} group flex items-center justify-center`}>
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform transition-transform group-hover:scale-110 drop-shadow-sm">
      <ellipse cx="20" cy="35" rx="10" ry="2" fill="#e5e7eb" />
      
      {/* Bucket Inside */}
      <ellipse cx="20" cy="18" rx="9" ry="3" fill="#f3f4f6" stroke="#1f2937" strokeWidth="1.5" />
      
      {/* Chicken Bone */}
      <path d="M25 10 L20 15 M25 10 C26.5 8.5 28.5 10.5 27 12 C28.5 13.5 26.5 15.5 25 14 L24 13" fill="white" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Chicken Meat */}
      <path d="M20 15 C20 15 15 12 13 16 C11 20 15 23 20 22 C24 21 23 17 20 15 Z" fill="#fde68a" stroke="#1f2937" strokeWidth="1.5" strokeLinejoin="round" />
      
      <clipPath id="bucket-clip">
        <path d="M 11 18 L 13.5 32 C 14 34 16.5 35 20 35 C 23.5 35 26 34 26.5 32 L 29 18 C 29 19.65 25 21 20 21 C 15 21 11 19.65 11 18 Z" />
      </clipPath>
      
      {/* Bucket Body Base */}
      <path d="M 11 18 L 13.5 32 C 14 34 16.5 35 20 35 C 23.5 35 26 34 26.5 32 L 29 18 C 29 19.65 25 21 20 21 C 15 21 11 19.65 11 18 Z" fill="white" />
      
      {/* Red Stripes Clipped */}
      <g clipPath="url(#bucket-clip)">
        <polygon points="11,18 15,18 17,35 13.5,35" fill="#e11d48" />
        <polygon points="25,18 29,18 26.5,35 23,35" fill="#e11d48" />
      </g>
      
      {/* Bucket Body Outline */}
      <path d="M 11 18 L 13.5 32 C 14 34 16.5 35 20 35 C 23.5 35 26 34 26.5 32 L 29 18 C 29 19.65 25 21 20 21 C 15 21 11 19.65 11 18 Z" fill="none" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Text */}
      <text x="20" y="29.5" textAnchor="middle" fill="#0284c7" fontSize="12" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif">{count > 99 ? '99+' : count}</text>
    </svg>
  </div>
);

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
              <span className="text-2xl font-bold text-primary-600">Elai Virundhu</span>
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
            <Link to="/cart" className="relative transition ml-2">
              <CartBucketIcon count={cartCount} className="w-8 h-8" />
            </Link>
            <Link to="/profile" className="text-gray-500 hover:text-primary-600 transition">
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile right icons */}
          <div className="flex items-center space-x-1 md:hidden">
            {!isActive('/menu') && (
              <Link to="/menu" className="text-gray-500 p-2 hover:text-primary-600 transition">
                <Search className="w-6 h-6" />
              </Link>
            )}
            <Link to="/cart" className="relative p-1 transition ml-1">
              <CartBucketIcon count={cartCount} className="w-9 h-9" />
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
