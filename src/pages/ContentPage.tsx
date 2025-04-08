import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPageByTitle, createPage, updatePage, incrementPageViews, getCurrentUser } from '../lib/supabase';
import { generateContent } from '../lib/groq';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContentRenderer from '../components/ContentRenderer';
import { Edit, Save, Loader, AlertCircle } from 'lucide-react';
import type { Page, User } from '../types';

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
        const { page, error } = await getPageByTitle(decodeURIComponent(title));
        
        if (page) {
          setPage(page);
          setContent(page.content);
          // Increment view count
          await incrementPageViews(page.id);
          setIsLoading(false);
          return;
        }
        
        // If page doesn't exist, generate content
        setIsGenerating(true);
        const generatedContent = await generateContent(decodeURIComponent(title));
        
        // Create new page in Supabase
        const { page: newPage, error: createError } = await createPage(
          decodeURIComponent(title),
          generatedContent,
          user?.id
        );
        
        if (createError) {
          // If we get a unique constraint violation, try to fetch the page again
          if (createError.code === '23505') { // PostgreSQL unique violation code
            const { page: existingPage } = await getPageByTitle(decodeURIComponent(title));
            if (existingPage) {
              setPage(existingPage);
              setContent(existingPage.content);
              await incrementPageViews(existingPage.id);
              setIsLoading(false);
              return;
            }
          }
          throw new Error(createError.message);
        }
        
        if (newPage) {
          setPage(newPage);
          setContent(newPage.content);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load or generate content');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
        setIsGenerating(false);
      }
    };

    fetchOrGeneratePage();
  }, [title, navigate, user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const [headerImage, setHeaderImage] = useState<string>('');

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
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isGenerating) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f9f5f0]">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="h-12 w-12 text-[#eeb76b] animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">
              {isGenerating ? `Generating content for "${decodeURIComponent(title || '')}"...` : 'Loading...'}
            </h2>
            {isGenerating && (
              <p className="mt-2 text-gray-500">
                This may take a few moments as we create comprehensive content for you.
              </p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f5f0]">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {(page?.header_image || headerImage) && (
              <div className="w-full h-64 relative">
                <img
                  src={headerImage || page?.header_image}
                  alt="Header"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              {isEditing && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#eeb76b] file:text-white
                      hover:file:bg-[#e9a84c]"
                  />
                </div>
              )}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{decodeURIComponent(title || '')}</h1>
                
                <div>
                  {user ? (
                    isEditing ? (
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    ) : (
                      <button
                        onClick={handleEdit}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#eeb76b] hover:bg-[#e9a84c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eeb76b]"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Page
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Login to Edit
                    </button>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[70vh] p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#eeb76b] focus:border-[#eeb76b] font-mono text-sm"
                />
              ) : (
                <ContentRenderer content={content} />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContentPage;