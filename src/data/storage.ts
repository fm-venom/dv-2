import { User, Build, Raid, PendingBuild } from '../types';
import { supabaseStorage } from './supabaseStorage';

const STORAGE_KEYS = {
  users: 'venom_users',
  builds: 'venom_builds',
  raids: 'venom_raids',
  pendingBuilds: 'venom_pending_builds',
  currentUser: 'venom_current_user',
  userLikes: 'venom_user_likes',
  buildViews: 'venom_build_views'
};

// Fallback к localStorage если Supabase недоступен
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

// Проверка доступности Supabase
const isSupabaseAvailable = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

// Инициализация данных по умолчанию
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

export const storage = {
  // Аутентификация
  async signUp(username: string, password: string): Promise<User> {
    if (isSupabaseAvailable()) {
      try {
        await supabaseStorage.signUp(username, password);
        const user = await supabaseStorage.getCurrentUser();
        if (user) return user;
      } catch (error) {
        console.error('Supabase signup error:', error);
      }
    }

    // Fallback к localStorage
    const users = getFromStorage(STORAGE_KEYS.users, []);
    if (users.some((u: User) => u.username === username)) {
      throw new Error('Пользователь с таким именем уже существует');
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEYS.users, users);
    return newUser;
  },

  async signIn(username: string, password: string): Promise<User> {
    if (isSupabaseAvailable()) {
      try {
        await supabaseStorage.signIn(username, password);
        const user = await supabaseStorage.getCurrentUser();
        if (user) {
          saveToStorage(STORAGE_KEYS.currentUser, user);
          return user;
        }
      } catch (error) {
        console.error('Supabase signin error:', error);
      }
    }

    // Fallback к localStorage
    initializeData();
    const users = getFromStorage(STORAGE_KEYS.users, []);
    const user = users.find((u: User) => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Неверные данные для входа');
    }

    saveToStorage(STORAGE_KEYS.currentUser, user);
    return user;
  },

  async signOut(): Promise<void> {
    if (isSupabaseAvailable()) {
      try {
        await supabaseStorage.signOut();
      } catch (error) {
        console.error('Supabase signout error:', error);
      }
    }
    saveToStorage(STORAGE_KEYS.currentUser, null);
  },

  // Пользователи
  async getUsers(): Promise<User[]> {
    if (isSupabaseAvailable()) {
      try {
        return await supabaseStorage.getUsers();
      } catch (error) {
        console.error('Supabase getUsers error:', error);
      }
    }

    initializeData();
    return getFromStorage(STORAGE_KEYS.users, []);
  },

  async saveUsers(users: User[]): Promise<void> {
    saveToStorage(STORAGE_KEYS.users, users);
  },

  // Билды
  async getBuilds(): Promise<Build[]> {
    if (isSupabaseAvailable()) {
      try {
        return await supabaseStorage.getBuilds();
      } catch (error) {
        console.error('Supabase getBuilds error:', error);
      }
    }

    return getFromStorage(STORAGE_KEYS.builds, []);
  },

  async saveBuilds(builds: Build[]): Promise<void> {
    saveToStorage(STORAGE_KEYS.builds, builds);
  },

  async createBuild(build: Omit<Build, 'id' | 'createdAt' | 'likes' | 'views'>): Promise<Build> {
    if (isSupabaseAvailable()) {
      try {
        const newBuild = await supabaseStorage.createBuild({
          title: build.title,
          description: build.description,
          image: build.image,
          author_id: build.authorId,
          approved: build.approved
        });
        return {
          id: newBuild.id,
          title: newBuild.title,
          description: newBuild.description,
          image: newBuild.image,
          likes: newBuild.likes,
          views: newBuild.views,
          authorId: newBuild.author_id,
          approved: newBuild.approved,
          createdAt: newBuild.created_at
        };
      } catch (error) {
        console.error('Supabase createBuild error:', error);
      }
    }

    // Fallback к localStorage
    const newBuild: Build = {
      ...build,
      id: Date.now().toString(),
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString()
    };

    const builds = getFromStorage(STORAGE_KEYS.builds, []);
    builds.push(newBuild);
    saveToStorage(STORAGE_KEYS.builds, builds);
    return newBuild;
  },

  // Рейды
  async getRaids(): Promise<Raid[]> {
    if (isSupabaseAvailable()) {
      try {
        return await supabaseStorage.getRaids();
      } catch (error) {
        console.error('Supabase getRaids error:', error);
      }
    }

    return getFromStorage(STORAGE_KEYS.raids, []);
  },

  async saveRaids(raids: Raid[]): Promise<void> {
    saveToStorage(STORAGE_KEYS.raids, raids);
  },

  async createRaid(raid: Omit<Raid, 'id' | 'createdAt'>): Promise<Raid> {
    if (isSupabaseAvailable()) {
      try {
        const newRaid = await supabaseStorage.createRaid({
          title: raid.title,
          description: raid.description,
          date: raid.date,
          time: raid.time,
          max_players: raid.maxPlayers,
          author_id: raid.authorId
        });

        // Добавляем создателя как участника
        await supabaseStorage.joinRaid(newRaid.id, raid.authorId, 'dd');

        return {
          id: newRaid.id,
          title: newRaid.title,
          description: newRaid.description,
          date: newRaid.date,
          time: newRaid.time,
          maxPlayers: newRaid.max_players,
          currentPlayers: [{ userId: raid.authorId, role: 'dd' }],
          authorId: newRaid.author_id,
          createdAt: newRaid.created_at
        };
      } catch (error) {
        console.error('Supabase createRaid error:', error);
      }
    }

    // Fallback к localStorage
    const newRaid: Raid = {
      ...raid,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const raids = getFromStorage(STORAGE_KEYS.raids, []);
    raids.push(newRaid);
    saveToStorage(STORAGE_KEYS.raids, raids);
    return newRaid;
  },

  async joinRaid(raidId: string, userId: string, role: 'dd' | 'medic' | 'tank' | 'flex'): Promise<void> {
    if (isSupabaseAvailable()) {
      try {
        await supabaseStorage.joinRaid(raidId, userId, role);
        return;
      } catch (error) {
        console.error('Supabase joinRaid error:', error);
      }
    }

    // Fallback к localStorage
    const raids = getFromStorage(STORAGE_KEYS.raids, []);
    const raidIndex = raids.findIndex((r: Raid) => r.id === raidId);
    if (raidIndex !== -1) {
      raids[raidIndex].currentPlayers.push({ userId, role });
      saveToStorage(STORAGE_KEYS.raids, raids);
    }
  },

  async leaveRaid(raidId: string, userId: string): Promise<void> {
    if (isSupabaseAvailable()) {
      try {
        await supabaseStorage.leaveRaid(raidId, userId);
        return;
      } catch (error) {
        console.error('Supabase leaveRaid error:', error);
      }
    }

    // Fallback к localStorage
    const raids = getFromStorage(STORAGE_KEYS.raids, []);
    const raidIndex = raids.findIndex((r: Raid) => r.id === raidId);
    if (raidIndex !== -1) {
      raids[raidIndex].currentPlayers = raids[raidIndex].currentPlayers.filter(
        (p: any) => p.userId !== userId
      );
      saveToStorage(STORAGE_KEYS.raids, raids);
    }
  },

  // Билды на модерации
  async getPendingBuilds(): Promise<PendingBuild[]> {
    if (isSupabaseAvailable()) {
      try {
        return await supabaseStorage.getPendingBuilds();
      } catch (error) {
        console.error('Supabase getPendingBuilds error:', error);
      }
    }

    return getFromStorage(STORAGE_KEYS.pendingBuilds, []);
  },

  async savePendingBuilds(builds: PendingBuild[]): Promise<void> {
    saveToStorage(STORAGE_KEYS.pendingBuilds, builds);
  },

  async createPendingBuild(build: Omit<PendingBuild, 'id' | 'createdAt'>): Promise<PendingBuild> {
    if (isSupabaseAvailable()) {
      try {
        const newBuild = await supabaseStorage.createPendingBuild({
          title: build.title,
          description: build.description,
          image: build.image,
          author_id: build.authorId
        });
        return {
          id: newBuild.id,
          title: newBuild.title,
          description: newBuild.description,
          image: newBuild.image,
          authorId: newBuild.author_id,
          createdAt: newBuild.created_at
        };
      } catch (error) {
        console.error('Supabase createPendingBuild error:', error);
      }
    }

    // Fallback к localStorage
    const newBuild: PendingBuild = {
      ...build,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const builds = getFromStorage(STORAGE_KEYS.pendingBuilds, []);
    builds.push(newBuild);
    saveToStorage(STORAGE_KEYS.pendingBuilds, builds);
    return newBuild;
  },

  // Текущий пользователь
  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseAvailable()) {
      try {
        const user = await supabaseStorage.getCurrentUser();
        if (user) {
          saveToStorage(STORAGE_KEYS.currentUser, user);
          return user;
        }
      } catch (error) {
        console.error('Supabase getCurrentUser error:', error);
      }
    }

    return getFromStorage(STORAGE_KEYS.currentUser, null);
  },

  async setCurrentUser(user: User | null): Promise<void> {
    saveToStorage(STORAGE_KEYS.currentUser, user);
  },

  // Лайки пользователей
  async getUserLikes(userId: string): Promise<string[]> {
    if (isSupabaseAvailable()) {
      try {
        return await supabaseStorage.getUserLikes(userId);
      } catch (error) {
        console.error('Supabase getUserLikes error:', error);
      }
    }

    const likes = getFromStorage(STORAGE_KEYS.userLikes, {});
    return likes[userId] || [];
  },

  async saveUserLikes(likes: { [userId: string]: string[] }): Promise<void> {
    saveToStorage(STORAGE_KEYS.userLikes, likes);
  },

  async likeBuild(userId: string, buildId: string): Promise<void> {
    if (isSupabaseAvailable()) {
      try {
        await supabaseStorage.likeBuild(userId, buildId);
        return;
      } catch (error) {
        console.error('Supabase likeBuild error:', error);
      }
    }

    // Fallback к localStorage
    const likes = getFromStorage(STORAGE_KEYS.userLikes, {});
    if (!likes[userId]) likes[userId] = [];
    if (!likes[userId].includes(buildId)) {
      likes[userId].push(buildId);
      saveToStorage(STORAGE_KEYS.userLikes, likes);

      // Увеличиваем счетчик лайков
      const builds = getFromStorage(STORAGE_KEYS.builds, []);
      const buildIndex = builds.findIndex((b: Build) => b.id === buildId);
      if (buildIndex !== -1) {
        builds[buildIndex].likes++;
        saveToStorage(STORAGE_KEYS.builds, builds);
      }
    }
  },

  async unlikeBuild(userId: string, buildId: string): Promise<void> {
    if (isSupabaseAvailable()) {
      try {
        await supabaseStorage.unlikeBuild(userId, buildId);
        return;
      } catch (error) {
        console.error('Supabase unlikeBuild error:', error);
      }
    }

    // Fallback к localStorage
    const likes = getFromStorage(STORAGE_KEYS.userLikes, {});
    if (likes[userId]) {
      likes[userId] = likes[userId].filter((id: string) => id !== buildId);
      saveToStorage(STORAGE_KEYS.userLikes, likes);

      // Уменьшаем счетчик лайков
      const builds = getFromStorage(STORAGE_KEYS.builds, []);
      const buildIndex = builds.findIndex((b: Build) => b.id === buildId);
      if (buildIndex !== -1 && builds[buildIndex].likes > 0) {
        builds[buildIndex].likes--;
        saveToStorage(STORAGE_KEYS.builds, builds);
      }
    }
  },

  // Просмотры билдов
  async getBuildViews(): Promise<{ [buildId: string]: number }> {
    return getFromStorage(STORAGE_KEYS.buildViews, {});
  },

  async saveBuildViews(views: { [buildId: string]: number }): Promise<void> {
    saveToStorage(STORAGE_KEYS.buildViews, views);
  },

  async incrementBuildViews(buildId: string): Promise<void> {
    if (isSupabaseAvailable()) {
      try {
        await supabaseStorage.incrementBuildViews(buildId);
        return;
      } catch (error) {
        console.error('Supabase incrementBuildViews error:', error);
      }
    }

    // Fallback к localStorage
    const views = getFromStorage(STORAGE_KEYS.buildViews, {});
    views[buildId] = (views[buildId] || 0) + 1;
    saveToStorage(STORAGE_KEYS.buildViews, views);

    const builds = getFromStorage(STORAGE_KEYS.builds, []);
    const buildIndex = builds.findIndex((b: Build) => b.id === buildId);
    if (buildIndex !== -1) {
      builds[buildIndex].views = views[buildId];
      saveToStorage(STORAGE_KEYS.builds, builds);
    }
  }
};