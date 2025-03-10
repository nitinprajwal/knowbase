import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Users, Edit } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecentPages from '../components/RecentPages';
import { useAuth } from '../lib/supabase';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/page/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f5f0]">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#eee2d2] py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Discover Knowledge with KnowBase
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
                Your dynamic knowledge platform powered by AI. Search any topic and get comprehensive, 
                Wikipedia-style information instantly.
              </p>
              
              {user ? (
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#eeb76b] focus:border-[#eeb76b] text-lg"
                      placeholder="Search for any topic..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute inset-y-0 right-0 px-6 py-2 border border-transparent rounded-r-md text-white bg-[#eeb76b] hover:bg-[#e9a84c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eeb76b]"
                    >
                      Search
                    </button>
                  </div>
                </form>
              ) : (
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                  <p className="text-lg text-gray-700 mb-4">
                    Sign in or create an account to start exploring and contributing to our knowledge base.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-2 bg-[#eeb76b] text-white rounded-md hover:bg-[#e9a84c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eeb76b]"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate('/signup')}
                      className="px-6 py-2 bg-white text-[#eeb76b] border border-[#eeb76b] rounded-md hover:bg-[#fff8f0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eeb76b]"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How KnowBase Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="inline-flex items-center justify-center p-3 bg-[#eee2d2] rounded-full mb-4">
                  <Search className="h-8 w-8 text-[#eeb76b]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Search Any Topic</h3>
                <p className="text-gray-600">
                  Simply enter any topic you're curious about in the search bar and let our AI do the rest.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="inline-flex items-center justify-center p-3 bg-[#eee2d2] rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-[#eeb76b]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Get Comprehensive Content</h3>
                <p className="text-gray-600">
                  Receive detailed, well-structured information similar to Wikipedia articles, complete with sections and references.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="inline-flex items-center justify-center p-3 bg-[#eee2d2] rounded-full mb-4">
                  <Edit className="h-8 w-8 text-[#eeb76b]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Edit and Improve</h3>
                <p className="text-gray-600">
                  Contribute to the knowledge base by editing and improving the content of any page.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Pages Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Recently Added Pages</h2>
            <RecentPages limit={5} />
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-[#eee2d2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About KnowBase</h2>
                <p className="text-lg text-gray-700 mb-6">
                  KnowBase is a dynamic knowledge platform that leverages advanced AI to generate comprehensive, 
                  Wikipedia-style content on any topic. Our mission is to make knowledge accessible to everyone.
                </p>
                <p className="text-lg text-gray-700">
                  Unlike traditional encyclopedias, KnowBase content is generated on-demand and can be edited 
                  and improved by users, creating a living, evolving knowledge base.
                </p>
              </div>
              
              <div className="mt-10 lg:mt-0 lg:w-1/2 lg:pl-10">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Join Our Community</h3>
                  <p className="text-gray-600 mb-6">
                    Create an account to save your favorite pages, track your contributions, and be part of 
                    our growing knowledge community.
                  </p>
                  <div className="flex space-x-4">
                    <a 
                      href="/signup" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#eeb76b] hover:bg-[#e9a84c]"
                    >
                      Sign Up
                    </a>
                    <a 
                      href="/login" 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Login
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;