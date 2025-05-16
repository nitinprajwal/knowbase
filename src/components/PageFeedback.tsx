import React, { useState, useEffect } from 'react';
import { createFeedback, getFeedbackByPageId, deleteFeedback, useAuth } from '../lib/supabase';
import { MessageCircle, Trash2, AlertCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PageFeedback } from '../types';

const feedbackItemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -100 }
};

const formVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto' }
};

interface PageFeedbackProps {
  pageId: string;
}

const PageFeedbackSection: React.FC<PageFeedbackProps> = ({ pageId }) => {
  const [feedback, setFeedback] = useState<PageFeedback[]>([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    loadFeedback().finally(() => {
      setIsLoading(false);
    });
  }, [pageId, loadFeedback]);

  const loadFeedback = React.useCallback(async () => {
    try {
      const { feedback, error } = await getFeedbackByPageId(pageId);
      if (error) {
        console.error('Error loading feedback:', error);
        setError('Failed to load feedback');
        setFeedback([]);
      } else {
        setError(null);
        setFeedback(feedback || []);
      }
    } catch (err) {
      console.error('Error in loadFeedback:', err);
      setError('Failed to load feedback');
      setFeedback([]);
    }
  }, [pageId]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await createFeedback(pageId, newFeedback, user.id);
      if (error) throw error;
      
      setNewFeedback('');
      await loadFeedback();
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const { error } = await deleteFeedback(feedbackId);
      if (error) throw error;
      
      await loadFeedback();
    } catch (err: any) {
      setError(err.message || 'Failed to delete feedback');
    }
  };

  // Add loading state UI
  if (isLoading) {
    return (
      <motion.div 
        className="mt-8 bg-white rounded-lg shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <MessageCircle className="h-6 w-6 mr-2 text-[#eeb76b]" />
          Feedback
        </h2>
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-gray-500">Loading feedback...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="mt-8 bg-white rounded-lg shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <MessageCircle className="h-6 w-6 mr-2 text-[#eeb76b]" />
        Feedback
      </h2>

      {error && (
        <motion.div 
          className="bg-red-50 border-l-4 border-red-400 p-4 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {user ? (
          <motion.form 
            onSubmit={handleSubmitFeedback} 
            className="mb-6"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative">
              <textarea
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                placeholder="Share your thoughts about this article..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#eeb76b] focus:border-[#eeb76b]"
                rows={4}
                required
              />
              <motion.button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 bottom-2 p-2 text-[#eeb76b] hover:text-[#e9a84c] disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.form>
        ) : (
          <motion.p 
            className="mb-6 text-gray-600"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            Please <a href="/login" className="text-[#eeb76b] hover:text-[#e9a84c]">login</a> to leave feedback.
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div 
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <AnimatePresence>
          {feedback.map((item) => (
            <motion.div
              key={item.id}
              variants={feedbackItemVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-600 whitespace-pre-wrap">{item.content}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    {item.user?.email} • {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                {user && user.id === item.user_id && (
                  <motion.button
                    onClick={() => handleDeleteFeedback(item.id)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                    title="Delete feedback"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {feedback.length === 0 && (
          <motion.p 
            className="text-gray-500 text-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No feedback yet. Be the first to share your thoughts!
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PageFeedbackSection;
