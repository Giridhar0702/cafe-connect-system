import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { User, LogIn, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAdminLoggedIn } = useStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock Authentication
    if (username === 'admin' && password === 'admin123') {
      setAdminLoggedIn(true);
      navigate('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center p-4 overflow-hidden bg-black">
      {/* Premium Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero/nattukozhi_bg.png" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
        />
        <img 
          src="https://images.unsplash.com/photo-1615719413546-198b25453f85?w=1600&q=80" 
          alt="Spices" 
          className="absolute inset-0 w-full h-full object-cover object-left mix-blend-overlay opacity-60"
          style={{ maskImage: 'linear-gradient(to right, black 15%, transparent 35%)', WebkitMaskImage: 'linear-gradient(to right, black 15%, transparent 35%)' }}
        />
        {/* Dark Red Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-900/90 to-primary-900/60"></div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight italic drop-shadow-md mb-2">
            Elai Virundhu
          </h1>
          <p className="text-primary-200 font-medium tracking-wider uppercase text-sm">
            Restaurant Management
          </p>
        </div>

        <div className="w-full bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 p-8 sm:p-10">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-600/30 transform -rotate-6">
              <ShieldCheck className="w-8 h-8 text-white transform rotate-6" />
            </div>
            <h2 className="text-2xl font-bold text-white text-center tracking-tight">Admin Sign In</h2>
            <p className="text-gray-300 text-sm mt-1 text-center">Secure portal access</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-md text-red-200 rounded-2xl flex items-start text-sm border border-red-500/30">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-red-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2 ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-400 text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-900/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:bg-gray-900/70"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-400 text-gray-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-900/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:bg-gray-900/70"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-base font-bold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-8 group"
            >
              Sign In Securely
              <LogIn className="ml-2 -mr-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} Elai Virundhu & Cafe
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
