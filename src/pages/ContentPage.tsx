import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPageByTitle, createPage, updatePage, incrementPageViews, getCurrentUser } from '../lib/supabase';
import { generateContent } from '../lib/groq';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContentRenderer from '../components/ContentRenderer';
import { PageFeedbackSection } from '../components/PageFeedback';
import PageRatingSection from '../components/PageRating';
import { Toast, ScrollToFeedback } from '../components/Animations';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit, Save, Loader, AlertCircle } from 'lucide-react';
import type { Page, User } from '../types';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

const ContentPage: React.FC = () => {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hasIncrementedViews, setHasIncrementedViews] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [headerImage, setHeaderImage] = useState<string>('');
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { user } = await getCurrentUser();
      if (user) {
        setUser(user as User);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!title) {
      navigate('/');
      return;
    }

    const fetchOrGeneratePage = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch the page from Supabase
        const { page, error } = await getPageByTitle(decodeURIComponent(title!));
        
        if (page) {
          setPage(page);
          setContent(page.content);
          
          if (!hasIncrementedViews) {
            await incrementPageViews(page.id);
            setHasIncrementedViews(true);
          }
          
          setIsLoading(false);
          return;
        }
        
        // If page doesn't exist, generate content
        setIsGenerating(true);
        
        try {
          const generatedContent = await generateContent(decodeURIComponent(title!));
          
          if (!generatedContent) {
            throw new Error('Failed to generate content - no content received');
          }

          // Set the content immediately so user can see it
          setContent(generatedContent);

          // Only try to save to database if we have a user
          if (user?.id) {
            // Create new page in Supabase
            const { page: newPage, error: createError } = await createPage(
              decodeURIComponent(title!),
              generatedContent,
              user.id
            );
            
            if (createError) {
              // If database error occurs, still show content but warn about saving
              console.error('Failed to save page:', createError);
              setToast({ 
                message: 'Content generated but could not be saved. Please try saving again later.', 
                type: 'info' 
              });
              return;
            }
            
            if (newPage) {
              setPage(newPage);
              setContent(newPage.content);
            }
          } else {
            // No user logged in - just display content without saving
            setToast({ 
              message: 'Login to save this page and contribute to the knowledge base', 
              type: 'info' 
            });
          }

        } catch (genError) {
          const errorMessage = genError instanceof Error ? genError.message : 
            'Failed to generate content. Please try again later.';
          console.error('Content generation error:', genError);
          setError(errorMessage);
          throw genError;
        }
      } catch (err) {
        const displayError = err instanceof Error ? err.message : 
          'Failed to load or generate content. Please try again later.';
        setError(displayError);
        console.error('Page error:', err);
      } finally {
        setIsLoading(false);
        setIsGenerating(false);
      }
    };

    fetchOrGeneratePage();
  }, [title, navigate, user, hasIncrementedViews]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('header-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('header-images')
        .getPublicUrl(filePath);

      setHeaderImage(data.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToFeedback = () => {
    feedbackRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!page) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { page: updatedPage, error } = await updatePage(page.id, content, headerImage);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (updatedPage) {
        setPage(updatedPage);
        setIsEditing(false);
        showToast('Changes saved successfully!', 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
      showToast('Failed to save changes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isGenerating) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12">
          <motion.div 
            className="text-center card bg-white/70"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Loader className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-primary-900">
              {isGenerating ? `Generating content for "${decodeURIComponent(title || '')}"...` : 'Loading...'}
            </h2>
            {isGenerating && (
              <p className="mt-2 text-primary-600">
                This may take a few moments as we create comprehensive content for you.
              </p>
            )}
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <motion.div 
              className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-400 p-4 mb-6 rounded-r-xl"
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
          
          <motion.div 
            className="card overflow-hidden bg-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {(page?.header_image || headerImage) && (
              <motion.div 
                className="w-full h-64 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src={headerImage || page?.header_image}
                  alt="Header"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
            )}
            
            <div className="p-6">
              {isEditing && (
                <motion.div 
                  className="mb-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-sm font-medium text-primary-700 mb-2">Header Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all cursor-pointer"
                  />
                </motion.div>
              )}
              
              <motion.div 
                className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4"
                layout
              >
                <motion.h1 
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary-700 to-primary-900 bg-clip-text text-transparent"
                  layout="position"
                >
                  {decodeURIComponent(title || '')}
                </motion.h1>
                
                <motion.div 
                  className="flex items-center space-x-4"
                  layout="position"
                >
                  {page && (
                    <PageRatingSection
                      pageId={page.id}
                      initialThumbsUp={page.thumbs_up}
                      initialThumbsDown={page.thumbs_down}
                    />
                  )}
                  
                  {user ? (
                    isEditing ? (
                      <motion.button
                        onClick={handleSave}
                        className="btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={handleEdit}
                        className="btn-secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Page
                      </motion.button>
                    )
                  ) : (
                    <motion.button
                      onClick={() => navigate('/login')}
                      className="btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Login to Edit
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
              
              {isEditing ? (
                <motion.textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[70vh] p-4 border border-primary-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 font-mono text-sm shadow-sm resize-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.div 
                  className="prose prose-primary max-w-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ContentRenderer content={content} />
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div 
            ref={feedbackRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {page && <PageFeedbackSection pageId={page.id} />}
          </motion.div>
        </div>
      </main>
      
      <Footer />

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      {user && <ScrollToFeedback onClick={scrollToFeedback} />}
    </div>
  );
};

export default ContentPage;