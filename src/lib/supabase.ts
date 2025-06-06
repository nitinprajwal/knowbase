import { createClient } from '@supabase/supabase-js';
import type { Page, VisitorStats, DatabaseError, ApiError } from '../types';
import type { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);
export { supabase };

// Auth functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    // Clear any local storage or session data
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
  }
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user, error };
};

// Auth hook for managing user state
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(({ user }) => {
      setUser(user || null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};

// Page functions
export const getPages = async (limit = 10): Promise<{ pages: Page[], error: any }> => {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);
  
  return { pages: data as Page[] || [], error };
};

export const getPageByTitle = async (title: string): Promise<{ page: Page | null, error: any }> => {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('title', title)
    .single();
  
  return { page: data as Page, error };
};

export const createPage = async (title: string, content: string, userId?: string): Promise<{ page: Page | null, error: DatabaseError | null }> => {
  try {
    // First try to get the page again to handle race conditions
    const { data: existingPage } = await supabase
      .from('pages')
      .select('*')
      .eq('title', title)
      .single();

    if (existingPage) {
      return { page: existingPage as Page, error: null };
    }

    // For anonymous users, return a temporary page without saving
    if (!userId) {
      const tempPage: Page = {
        id: 'temp',
        title,
        content,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        thumbs_up: 0,
        thumbs_down: 0
      };
      return { page: tempPage, error: null };
    }

    // If user is authenticated, create the page
    const { data, error } = await supabase
      .from('pages')
      .insert([{ 
        title, 
        content, 
        user_id: userId,
        views: 0,
        thumbs_up: 0,
        thumbs_down: 0
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating page:', error);
      return { page: null, error: error as DatabaseError };
    }
    
    return { page: data as Page, error: null };
  } catch (error) {
    console.error('Error in createPage:', error);
    return { page: null, error: { message: 'Unexpected error occurred' } };
  }
};

export const updatePage = async (id: string, content: string, header_image?: string): Promise<{ page: Page | null, error: any }> => {
  const { data, error } = await supabase
    .from('pages')
    .update({ 
      content,
      header_image,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  return { page: data as Page, error };
};

export const incrementPageViews = async (id: string): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabase.rpc('increment_page_views', { page_id: id });
    return { success: !error, error };
  } catch (error) {
    console.error('Error incrementing page views:', error);
    return { success: false, error };
  }
};

// Visitor stats functions
export const getVisitorStats = async (): Promise<{ stats: VisitorStats | null, error: any }> => {
  const { data, error } = await supabase
    .from('visitor_stats')
    .select('*')
    .single();
  
  return { stats: data as VisitorStats, error };
};

export const incrementVisits = async (): Promise<{ success: boolean, error: any }> => {
  const { error } = await supabase.rpc('increment_total_visits');
  return { success: !error, error };
};

export const updateCurrentVisitors = async (count: number): Promise<{ success: boolean, error: any }> => {
  const { error } = await supabase
    .from('visitor_stats')
    .update({ current_visitors: count })
    .eq('id', 1);
  
  return { success: !error, error };
};

// Subscribe to realtime updates
export const subscribeToVisitorStats = (callback: (stats: VisitorStats) => void) => {
  return supabase
    .channel('visitor_stats_changes')
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'visitor_stats' }, 
      (payload) => callback(payload.new as VisitorStats)
    )
    .subscribe();
};

// Password reset functions
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { data, error };
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

// Feedback functions
export const createFeedback = async (pageId: string, content: string, userId: string) => {
  const { data, error } = await supabase
    .from('page_feedback')
    .insert([{ page_id: pageId, content, user_id: userId }])
    .select()
    .single();
  
  return { feedback: data, error };
};

export const updateFeedback = async (feedbackId: string, content: string) => {
  const { data, error } = await supabase
    .from('page_feedback')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', feedbackId)
    .select()
    .single();
  
  return { feedback: data, error };
};

export const deleteFeedback = async (feedbackId: string) => {
  const { error } = await supabase
    .from('page_feedback')
    .delete()
    .eq('id', feedbackId);
  
  return { error };
};

export const getFeedbackByPageId = async (pageId: string) => {
  try {
    const { data, error } = await supabase
      .from('page_feedback')
      .select(`
        *,
        user:user_id (
          email
        )
      `)
      .eq('page_id', pageId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching feedback:', error);
      throw error;
    }

    // Transform the data to match our PageFeedback type
    const feedback = data?.map(item => ({
      ...item,
      user: item.user
    }));

    return { feedback, error: null };
  } catch (error) {
    console.error('Error in getFeedbackByPageId:', error);
    return { feedback: [], error };
  }
};

// Rating functions
export const getUserRating = async (pageId: string, userId: string) => {
  const { data: rating, error } = await supabase
    .from('page_ratings')
    .select('*')
    .eq('page_id', pageId)
    .eq('user_id', userId)
    .single();
  
  return { rating, error };
};

export const rateContent = async (pageId: string, value: 1 | -1, userId: string) => {
  // Check if user already rated
  const { rating: existingRating } = await getUserRating(pageId, userId);

  if (existingRating) {
    // If same rating, remove it
    if ((value === 1 && existingRating.like_count === 1) || 
        (value === -1 && existingRating.dislike_count === 1)) {
      const { error } = await supabase
        .from('page_ratings')
        .delete()
        .eq('id', existingRating.id);
      
      return { rating: null, error };
    }

    // Update existing rating
    const { data: rating, error } = await supabase
      .from('page_ratings')
      .update({
        like_count: value === 1 ? 1 : 0,
        dislike_count: value === -1 ? 1 : 0
      })
      .eq('id', existingRating.id)
      .select()
      .single();

    return { rating, error };
  }

  // Create new rating
  const { data: rating, error } = await supabase
    .from('page_ratings')
    .insert([{
      page_id: pageId,
      user_id: userId,
      like_count: value === 1 ? 1 : 0,
      dislike_count: value === -1 ? 1 : 0
    }])
    .select()
    .single();

  return { rating, error };
};