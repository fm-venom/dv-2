import { User, Build, Raid, PendingBuild } from '../types';

const STORAGE_KEYS = {
  users: 'app_users',
  builds: 'app_builds',
  raids: 'app_raids',
  pendingBuilds: 'app_pending_builds',
  currentUser: 'app_current_user',
  userLikes: 'app_user_likes',
  buildViews: 'app_build_views'
};

// Initialize default admin user
const initializeData = () => {
  const existingUsers = localStorage.getItem(STORAGE_KEYS.users);
  if (!existingUsers) {
    const adminUser: User = {
      id: 'admin-1',
      username: 'admin',
      password: 'admin123',
      currentPlayers: [],
      isAdmin: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([adminUser]));
  }

  // Initialize other storage if doesn't exist
  if (!localStorage.getItem(STORAGE_KEYS.builds)) {
    localStorage.setItem(STORAGE_KEYS.builds, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.raids)) {
    localStorage.setItem(STORAGE_KEYS.raids, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.pendingBuilds)) {
    localStorage.setItem(STORAGE_KEYS.pendingBuilds, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.userLikes)) {
    localStorage.setItem(STORAGE_KEYS.userLikes, JSON.stringify({}));
  }
  if (!localStorage.getItem(STORAGE_KEYS.buildViews)) {
    localStorage.setItem(STORAGE_KEYS.buildViews, JSON.stringify({}));
  }
};

export const storage = {
  // Users
  getUsers: (): User[] => {
    initializeData();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  },

  // Builds
  getBuilds: (): Build[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.builds) || '[]');
  },

  saveBuilds: (builds: Build[]) => {
    localStorage.setItem(STORAGE_KEYS.builds, JSON.stringify(builds));
  },

  // Raids
  getRaids: (): Raid[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.raids) || '[]');
  },

  saveRaids: (raids: Raid[]) => {
    localStorage.setItem(STORAGE_KEYS.raids, JSON.stringify(raids));
  },

  // Pending Builds
  getPendingBuilds: (): PendingBuild[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.pendingBuilds) || '[]');
  },

  savePendingBuilds: (builds: PendingBuild[]) => {
    localStorage.setItem(STORAGE_KEYS.pendingBuilds, JSON.stringify(builds));
  },

  // Current User
  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem(STORAGE_KEYS.currentUser);
    return userData ? JSON.parse(userData) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  },

  // User Likes
  getUserLikes: (): { [userId: string]: string[] } => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.userLikes) || '{}');
  },

  saveUserLikes: (likes: { [userId: string]: string[] }) => {
    localStorage.setItem(STORAGE_KEYS.userLikes, JSON.stringify(likes));
  },

  // Build Views
  getBuildViews: (): { [buildId: string]: number } => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.buildViews) || '{}');
  },

  saveBuildViews: (views: { [buildId: string]: number }) => {
    localStorage.setItem(STORAGE_KEYS.buildViews, JSON.stringify(views));
  }
};
