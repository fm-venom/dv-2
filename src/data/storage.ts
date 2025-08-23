import { User, Build, Raid, PendingBuild } from '../types';
import { saveDataToFile, loadDataWithFallback } from './dataFiles';

const STORAGE_KEYS = {
  users: 'app_users',
  builds: 'app_builds',
  raids: 'app_raids',
  pendingBuilds: 'app_pending_builds',
  currentUser: 'app_current_user',
  userLikes: 'app_user_likes',
  buildViews: 'app_build_views'
};

const DATA_FILES = {
  users: 'users.js',
  builds: 'builds.js',
  raids: 'raids.js',
  pendingBuilds: 'pendingBuilds.js',
  userLikes: 'userLikes.js',
  buildViews: 'buildViews.js',
  currentUser: 'currentUser.js'
};

// Initialize default admin user
const initializeData = async () => {
  const existingUsers = await loadDataWithFallback(DATA_FILES.users, STORAGE_KEYS.users, []);
  if (existingUsers.length === 0) {
    const adminUser: User = {
      id: 'admin-1',
      username: 'admin',
      password: 'admin123',
      isAdmin: true,
      createdAt: new Date().toISOString()
    };
    await saveDataToFile(DATA_FILES.users, [adminUser]);
  }
};

export const storage = {
  // Users
  getUsers: async (): Promise<User[]> => {
    await initializeData();
    return await loadDataWithFallback(DATA_FILES.users, STORAGE_KEYS.users, []);
  },

  saveUsers: async (users: User[]) => {
    await saveDataToFile(DATA_FILES.users, users);
  },

  // Builds
  getBuilds: async (): Promise<Build[]> => {
    return await loadDataWithFallback(DATA_FILES.builds, STORAGE_KEYS.builds, []);
  },

  saveBuilds: async (builds: Build[]) => {
    await saveDataToFile(DATA_FILES.builds, builds);
  },

  // Raids
  getRaids: async (): Promise<Raid[]> => {
    return await loadDataWithFallback(DATA_FILES.raids, STORAGE_KEYS.raids, []);
  },

  saveRaids: async (raids: Raid[]) => {
    await saveDataToFile(DATA_FILES.raids, raids);
  },

  // Pending Builds
  getPendingBuilds: async (): Promise<PendingBuild[]> => {
    return await loadDataWithFallback(DATA_FILES.pendingBuilds, STORAGE_KEYS.pendingBuilds, []);
  },

  savePendingBuilds: async (builds: PendingBuild[]) => {
    await saveDataToFile(DATA_FILES.pendingBuilds, builds);
  },

  // Current User
  getCurrentUser: async (): Promise<User | null> => {
    return await loadDataWithFallback(DATA_FILES.currentUser, STORAGE_KEYS.currentUser, null);
  },

  setCurrentUser: async (user: User | null) => {
    await saveDataToFile(DATA_FILES.currentUser, user);
  },

  // User Likes
  getUserLikes: async (): Promise<{ [userId: string]: string[] }> => {
    return await loadDataWithFallback(DATA_FILES.userLikes, STORAGE_KEYS.userLikes, {});
  },

  saveUserLikes: async (likes: { [userId: string]: string[] }) => {
    await saveDataToFile(DATA_FILES.userLikes, likes);
  },

  // Build Views
  getBuildViews: async (): Promise<{ [buildId: string]: number }> => {
    return await loadDataWithFallback(DATA_FILES.buildViews, STORAGE_KEYS.buildViews, {});
  },

  saveBuildViews: async (views: { [buildId: string]: number }) => {
    await saveDataToFile(DATA_FILES.buildViews, views);
  }
};
