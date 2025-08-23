import { User, Build, Raid, PendingBuild } from '../types';

const STORAGE_KEYS = {
  users: 'venom_users',
  builds: 'venom_builds',
  raids: 'venom_raids',
  pendingBuilds: 'venom_pending_builds',
  currentUser: 'venom_current_user',
  userLikes: 'venom_user_likes',
  buildViews: 'venom_build_views'
};

// Initialize default admin user
const initializeData = () => {
  const existingUsers = getFromStorage(STORAGE_KEYS.users, []);
  if (existingUsers.length === 0) {
    const adminUser: User = {
      id: 'admin-1',
      username: 'admin',
      password: 'admin123',
      isAdmin: true,
      createdAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.users, [adminUser]);
  }
};

const getFromStorage = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
};

export const storage = {
  // Users
  getUsers: (): User[] => {
    initializeData();
    return getFromStorage(STORAGE_KEYS.users, []);
  },

  saveUsers: (users: User[]) => {
    saveToStorage(STORAGE_KEYS.users, users);
  },

  // Builds
  getBuilds: (): Build[] => {
    return getFromStorage(STORAGE_KEYS.builds, []);
  },

  saveBuilds: (builds: Build[]) => {
    saveToStorage(STORAGE_KEYS.builds, builds);
  },

  // Raids
  getRaids: (): Raid[] => {
    return getFromStorage(STORAGE_KEYS.raids, []);
  },

  saveRaids: (raids: Raid[]) => {
    saveToStorage(STORAGE_KEYS.raids, raids);
  },

  // Pending Builds
  getPendingBuilds: (): PendingBuild[] => {
    return getFromStorage(STORAGE_KEYS.pendingBuilds, []);
  },

  savePendingBuilds: (builds: PendingBuild[]) => {
    saveToStorage(STORAGE_KEYS.pendingBuilds, builds);
  },

  // Current User
  getCurrentUser: (): User | null => {
    return getFromStorage(STORAGE_KEYS.currentUser, null);
  },

  setCurrentUser: (user: User | null) => {
    saveToStorage(STORAGE_KEYS.currentUser, user);
  },

  // User Likes
  getUserLikes: (): { [userId: string]: string[] } => {
    return getFromStorage(STORAGE_KEYS.userLikes, {});
  },

  saveUserLikes: (likes: { [userId: string]: string[] }) => {
    saveToStorage(STORAGE_KEYS.userLikes, likes);
  },

  // Build Views
  getBuildViews: (): { [buildId: string]: number } => {
    return getFromStorage(STORAGE_KEYS.buildViews, {});
  },

  saveBuildViews: (views: { [buildId: string]: number }) => {
    saveToStorage(STORAGE_KEYS.buildViews, views);
  }
};