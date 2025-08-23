export interface User {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Build {
  id: string;
  title: string;
  description: string;
  image: string;
  likes: number;
  views: number;
  authorId: string;
  approved: boolean;
  createdAt: string;
}

export interface Raid {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  maxPlayers: number;
  currentPlayers: { userId: string; role: 'dd' | 'medic' | 'tank' | 'flex' }[];
  authorId: string;
  createdAt: string;
}

export interface PendingBuild {
  id: string;
  title: string;
  description: string;
  image: string;
  authorId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  createdAt: string;
}