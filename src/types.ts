import { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  views: number;
  header_image?: string;
  thumbs_up: number;
  thumbs_down: number;
}

export interface PageFeedback {
  id: string;
  page_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
  };
}

export interface PageRating {
  id: string;
  page_id: string;
  user_id: string;
  like_count: number;
  dislike_count: number;
  created_at: string;
}

export interface VisitorStats {
  total_visits: number;
  current_visitors: number;
}

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface InputProps {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
  autoComplete?: string;
}