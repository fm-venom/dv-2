import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для базы данных
export interface Profile {
  id: string;
  username: string;
  is_admin: boolean;
  created_at: string;
}

export interface Build {
  id: string;
  title: string;
  description: string;
  image: string;
  likes: number;
  views: number;
  author_id: string;
  approved: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Raid {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  max_players: number;
  author_id: string;
  created_at: string;
  profiles?: Profile;
  raid_participants?: RaidParticipant[];
}

export interface RaidParticipant {
  id: string;
  raid_id: string;
  user_id: string;
  role: 'dd' | 'medic' | 'tank' | 'flex';
  created_at: string;
  profiles?: Profile;
}

export interface PendingBuild {
  id: string;
  title: string;
  description: string;
  image: string;
  author_id: string;
  created_at: string;
  profiles?: Profile;
}

export interface UserLike {
  id: string;
  user_id: string;
  build_id: string;
  created_at: string;
}