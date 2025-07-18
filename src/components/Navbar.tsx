import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, LogOut, Menu, X, Brain, Lightbulb } from 'lucide-react';
import { getCurrentUser, signOut } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../types';

const LogoIcon: React.FC = () => (
  <div className="relative w-8 h-8 mx-1">
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <Brain className="w-8 h-8 text-primary-600" />
    </motion.div>
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="absolute inset-0 flex items-center justify-center transform -translate-x-1"
    >
      <Lightbulb className="w-7 h-7 text-yellow-400" />
    </motion.div>
  </div>
);

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { user, error } = await getCurrentUser();
      if (user && !error) {
        setUser(user as User);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/page/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed w-full top-0 z-50">
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo with 3D effect */}
            <Link to="/" className="flex items-center">
              <motion.div
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"
                >
                  KNOW
                </motion.span>
                <LogoIcon />
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"
                >
                  BASE
                </motion.span>
              </motion.div>
            </Link>

            {/* Desktop Search & Actions */}
            <div className="hidden md:flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
              <AnimatePresence mode="wait">
                {user ? (
                  <motion.form 
                    onSubmit={handleSearch} 
                    className="max-w-lg w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-primary-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-primary-200 rounded-xl leading-5 bg-white/50 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 shadow-sm transition-all hover:shadow-md"
                        placeholder="Search for any topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </motion.form>
                ) : (
                  <motion.div 
                    className="text-sm text-secondary-500 italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Login or sign up to search
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center">
              <AnimatePresence mode="wait">
                {!isLoading && (
                  <>
                    {user ? (
                      <motion.div 
                        className="flex items-center gap-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <motion.span 
                          className="text-sm text-secondary-600 font-medium"
                          whileHover={{ scale: 1.05 }}
                        >
                          {user.email}
                        </motion.span>
                        <motion.button
                          onClick={handleSignOut}
                          className="btn-primary inline-flex items-center px-4 py-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Link 
                            to="/login" 
                            className="btn-secondary inline-flex items-center px-4 py-2"
                          >
                            <UserIcon className="h-4 w-4 mr-2" />
                            Login
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Link 
                            to="/signup" 
                            className="btn-primary inline-flex items-center px-4 py-2"
                          >
                            Sign Up
                          </Link>
                        </motion.div>
                      </motion.div>
                    )}
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <motion.div className="flex md:hidden">
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-primary-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="sr-only">Open menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-white/20"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Mobile search */}
                {user && (
                  <form onSubmit={handleSearch} className="p-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-primary-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-primary-200 rounded-xl bg-white/50 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>
                )}

                {/* Mobile actions */}
                {user ? (
                  <div className="space-y-2 p-2">
                    <p className="text-sm text-secondary-600 text-center">{user.email}</p>
                    <button
                      onClick={handleSignOut}
                      className="w-full btn-primary flex items-center justify-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 p-2">
                    <Link
                      to="/login"
                      className="w-full btn-secondary flex items-center justify-center"
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="w-full btn-primary flex items-center justify-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
};

export default Navbar;