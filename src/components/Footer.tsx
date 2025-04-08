import React, { useState, useEffect } from 'react';
import { getVisitorStats, subscribeToVisitorStats, useAuth } from '../lib/supabase';
import type { VisitorStats } from '../types';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <footer className="bg-[#eee2d2] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-700">© 2025 KnowBase. All rights reserved.</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>Created by:</p>
              <p>Jalaja R</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-4 md:space-y-0 md:flex-row md:items-center md:space-x-6">
            {!user && (
              <div className="flex space-x-4">
                <Link to="/signup" className="text-[#eeb76b] hover:text-[#e6a755]">Sign Up</Link>
                <Link to="/login" className="text-[#eeb76b] hover:text-[#e6a755]">Login</Link>
              </div>
            )}
            {visitorStats && (
              <div className="flex items-center text-gray-700">
                <Users className="h-5 w-5 mr-2 text-[#eeb76b]" />
                <div>
                  <span className="font-medium">{visitorStats.current_visitors}</span> current visitors | 
                  <span className="font-medium ml-1">{visitorStats.total_visits}</span> total visits
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;