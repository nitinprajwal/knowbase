import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPages } from '../lib/supabase';
import type { Page } from '../types';
import { Clock, Eye } from 'lucide-react';

interface RecentPagesProps {
  limit?: number;
}

const RecentPages: React.FC<RecentPagesProps> = ({ limit = 5 }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true);
      const { pages, error } = await getPages(limit);
      if (!error) {
        setPages(pages);
      }
      setIsLoading(false);
    };

    fetchPages();
  }, [limit]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="mb-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pages have been created yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pages.map((page) => (
        <Link
          key={page.id}
          to={`/page/${encodeURIComponent(page.title)}`}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          {page.header_image && (
            <div className="w-full h-48 overflow-hidden">
              <img
                src={page.header_image}
                alt={page.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
              {page.title}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {page.content.substring(0, 150)}...
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{new Date(page.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span>{page.views || 0} views</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecentPages;