import { createClient } from '@supabase/supabase-js';
import type { User, Page, VisitorStats } from '../types';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

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

export const createPage = async (title: string, content: string, userId?: string): Promise<{ page: Page | null, error: any }> => {
  // First try to get the page again to handle race conditions
  const { data: existingPage } = await supabase
    .from('pages')
    .select('*')
    .eq('title', title)
    .single();

  if (existingPage) {
    return { page: existingPage as Page, error: null };
  }

  // If page doesn't exist, create it
  const { data, error } = await supabase
    .from('pages')
    .insert([
      { 
        title, 
        content, 
        user_id: userId,
        views: 0
      }
    ])
    .select()
    .single();
  
  return { page: data as Page, error };
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

export default supabase;