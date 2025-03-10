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
}

export interface VisitorStats {
  total_visits: number;
  current_visitors: number;
}