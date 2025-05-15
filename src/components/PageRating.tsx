import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { rateContent, getUserRating, useAuth } from '../lib/supabase';
import { motion } from 'framer-motion';
import Tooltip from './Tooltip';
import type { PageRating } from '../types';

interface PageRatingProps {
  pageId: string;
  initialThumbsUp: number;
  initialThumbsDown: number;
}

const buttonVariants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
  hover: { scale: 1.05 },
};

const countVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const PageRatingSection: React.FC<PageRatingProps> = ({ 
  pageId, 
  initialThumbsUp,
  initialThumbsDown 
}) => {
  const [userRating, setUserRating] = useState<PageRating | null>(null);
  const [thumbsUp, setThumbsUp] = useState(initialThumbsUp);
  const [thumbsDown, setThumbsDown] = useState(initialThumbsDown);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserRating();
    }
  }, [user, pageId]);

  const loadUserRating = async () => {
    if (!user) return;
    const { rating } = await getUserRating(pageId, user.id);
    setUserRating(rating);
  };

  const handleRating = async (rating: 1 | -1) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      const { rating: newRating } = await rateContent(pageId, rating, user.id);
      
      // Update the counts based on the action taken
      if (!userRating) {
        // New rating
        if (rating === 1) setThumbsUp(prev => prev + 1);
        else setThumbsDown(prev => prev + 1);
      } else if (!newRating) {
        // Rating removed
        if (userRating.rating === 1) setThumbsUp(prev => prev - 1);
        else setThumbsDown(prev => prev - 1);
      } else if (userRating.rating !== newRating.rating) {
        // Rating changed
        if (newRating.rating === 1) {
          setThumbsUp(prev => prev + 1);
          setThumbsDown(prev => prev - 1);
        } else {
          setThumbsUp(prev => prev - 1);
          setThumbsDown(prev => prev + 1);
        }
      }
      
      setUserRating(newRating);
    } catch (error) {
      console.error('Error rating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-6">
      <Tooltip content={user ? "Like this article" : "Login to rate"} position="top">
        <motion.button
          onClick={() => !isLoading && handleRating(1)}
          disabled={isLoading}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            userRating?.rating === 1
              ? 'bg-green-100 text-green-700'
              : 'hover:bg-gray-100'
          }`}
        >
          <ThumbsUp className={`h-5 w-5 ${
            userRating?.rating === 1 ? 'text-green-600' : 'text-gray-500'
          }`} />
          <motion.span
            key={thumbsUp}
            variants={countVariants}
            initial="initial"
            animate="animate"
            className="font-medium"
          >
            {thumbsUp}
          </motion.span>
        </motion.button>
      </Tooltip>

      <Tooltip content={user ? "Dislike this article" : "Login to rate"} position="top">
        <motion.button
          onClick={() => !isLoading && handleRating(-1)}
          disabled={isLoading}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            userRating?.rating === -1
              ? 'bg-red-100 text-red-700'
              : 'hover:bg-gray-100'
          }`}
        >
          <ThumbsDown className={`h-5 w-5 ${
            userRating?.rating === -1 ? 'text-red-600' : 'text-gray-500'
          }`} />
          <motion.span
            key={thumbsDown}
            variants={countVariants}
            initial="initial"
            animate="animate"
            className="font-medium"
          >
            {thumbsDown}
          </motion.span>
        </motion.button>
      </Tooltip>
    </div>
  );
};

export default PageRatingSection;
