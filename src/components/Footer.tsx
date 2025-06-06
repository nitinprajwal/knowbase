import React, { useState, useEffect } from 'react';
import { getVisitorStats, subscribeToVisitorStats, useAuth } from '../lib/supabase';
import type { VisitorStats } from '../types';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchVisitorStats = async () => {
      const { stats } = await getVisitorStats();
      if (stats) {
        setVisitorStats(stats);
      }
    };

    fetchVisitorStats();

    // Subscribe to realtime updates
    const subscription = subscribeToVisitorStats((stats) => {
      setVisitorStats(stats);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <motion.footer 
      className="bg-gradient-to-b from-white/50 to-primary-50/50 backdrop-blur-sm border-t border-white/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.div 
            className="text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-primary-700 font-semibold">&copy; 2025 KnowBase. All rights reserved.</p>
          </motion.div>

          <motion.div 
            className="flex flex-col md:flex-row items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {!user && (
              <div className="flex space-x-4">
                <Link to="/signup" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                  Sign Up
                </Link>
                <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                  Login
                </Link>
              </div>
            )}
            {visitorStats && (
              <motion.div 
                className="flex items-center text-primary-600 bg-white/70 rounded-xl px-4 py-2 shadow-sm border border-white/40"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Users className="h-5 w-5 mr-2 text-primary-500" />
                <div className="text-sm">
                  <span className="font-semibold">{visitorStats.current_visitors}</span> online • 
                  <span className="font-semibold ml-1">{visitorStats.total_visits}</span> total
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;