import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Users, Edit } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecentPages from '../components/RecentPages';
import { useAuth } from '../lib/supabase';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; delay: number }> = ({ 
  icon, title, description, delay 
}) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{ y: 50, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="card transform transition-all duration-300 hover:translate-y-[-10px] hover:shadow-xl"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        whileHover={{ rotateY: 10, rotateX: -10 }}
        className="text-center h-full flex flex-col items-center justify-center"
      >
        <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4 transform transition-transform hover:scale-110">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </motion.div>
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const heroY = useTransform(scrollY, [0, 300], [0, 50]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/page/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Hero Section with Parallax */}
        <motion.section 
          className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary-100 to-white"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <motion.div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(238, 183, 107, 0.1) 0%, rgba(238, 183, 107, 0) 70%)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Discover Knowledge with{' '}
                <span className="bg-gradient-to-r from-primary-400 to-primary-600 text-transparent bg-clip-text">
                  KnowBase
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-700 max-w-3xl mx-auto mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Your dynamic knowledge platform powered by AI. Search any topic and get comprehensive, 
                Wikipedia-style information instantly.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {user ? (
                  <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                    <motion.div 
                      className="relative group"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-4 text-lg border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 shadow-sm transition-all group-hover:shadow-md"
                        placeholder="Search for any topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <motion.button
                        type="submit"
                        className="absolute inset-y-0 right-0 px-6 py-2 text-white rounded-r-xl bg-gradient-to-r from-primary-400 to-primary-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Search
                      </motion.button>
                    </motion.div>
                  </form>
                ) : (
                  <motion.div 
                    className="max-w-2xl mx-auto card backdrop-blur-sm bg-white/80"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <p className="text-lg text-gray-700 mb-4">
                      Sign in or create an account to start exploring and contributing to our knowledge base.
                    </p>
                    <div className="flex justify-center gap-4">
                      <motion.button
                        onClick={() => navigate('/login')}
                        className="btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sign In
                      </motion.button>
                      <motion.button
                        onClick={() => navigate('/signup')}
                        className="btn-secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sign Up
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Animated background shapes */}
          <motion.div
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-64 h-64 bg-primary-200/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 20 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              className="text-3xl font-bold text-center text-gray-900 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              How KnowBase Works
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Search className="h-8 w-8 text-primary-400" />}
                title="Search Any Topic"
                description="Simply enter any topic you're curious about in the search bar and let our AI do the rest."
                delay={0.2}
              />
              <FeatureCard
                icon={<BookOpen className="h-8 w-8 text-primary-400" />}
                title="Get Comprehensive Content"
                description="Receive detailed, well-structured information similar to Wikipedia articles, complete with sections and references."
                delay={0.4}
              />
              <FeatureCard
                icon={<Edit className="h-8 w-8 text-primary-400" />}
                title="Edit and Improve"
                description="Contribute to the knowledge base by editing and improving the content of any page."
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* Recent Pages Section */}
        <motion.section 
          className="py-16 bg-white relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Recently Added Pages</h2>
            <RecentPages limit={5} />
          </div>
        </motion.section>

        {/* About Section */}
        <section className="py-24 bg-primary-100 relative overflow-hidden">
          <motion.div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="lg:flex lg:items-center lg:justify-between">
              <motion.div 
                className="lg:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About KnowBase</h2>
                <p className="text-lg text-gray-700 mb-6">
                  KnowBase is a dynamic knowledge platform that leverages advanced AI to generate comprehensive, 
                  Wikipedia-style content on any topic. Our mission is to make knowledge accessible to everyone.
                </p>
                <p className="text-lg text-gray-700">
                  Unlike traditional encyclopedias, KnowBase content is generated on-demand and can be edited 
                  and improved by users, creating a living, evolving knowledge base.
                </p>
              </motion.div>
              
              <motion.div 
                className="mt-10 lg:mt-0 lg:w-1/2 lg:pl-10"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="card backdrop-blur-sm bg-white/80">
                  <h3 className="text-xl font-semibold mb-4">Join Our Community</h3>
                  <p className="text-gray-600 mb-6">
                    Create an account to save your favorite pages, track your contributions, and be part of 
                    our growing knowledge community.
                  </p>
                  <div className="flex space-x-4">
                    <motion.a 
                      href="/signup" 
                      className="btn-primary flex-1 text-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign Up
                    </motion.a>
                    <motion.a 
                      href="/login" 
                      className="btn-secondary flex-1 text-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Login
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-96 h-96 bg-primary-200/10 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 25 + i * 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;