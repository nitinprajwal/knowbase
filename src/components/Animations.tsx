import { motion } from 'framer-motion';

export const popAnimation = {
  initial: { scale: 1 },
  pop: { 
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 }
  }
};

export const slideToast = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const Toast: React.FC<{
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}> = ({ message, type = 'info', onClose }) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideToast}
      className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg`}
    >
      {message}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 opacity-75 hover:opacity-100"
        >
          ×
        </button>
      )}
    </motion.div>
  );
};

export const ScrollToFeedback: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-4 left-4 bg-[#eeb76b] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#e9a84c]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Leave Feedback
    </motion.button>
  );
};
