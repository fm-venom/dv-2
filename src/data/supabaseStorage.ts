import { supabase, Profile, Build, Raid, RaidParticipant, PendingBuild, UserLike } from '../lib/supabase';
import { User } from '../types';

// Конвертация типов между старыми и новыми
const convertProfileToUser = (profile: Profile): User => ({
  id: profile.id,
  username: profile.username,
  password: '', // Пароль не хранится в профиле
  isAdmin: profile.is_admin,
  createdAt: profile.created_at
});

const convertBuildToOldFormat = (build: Build & { profiles?: Profile }) => ({
  id: build.id,
  title: build.title,
  description: build.description,
  image: build.image,
  likes: build.likes,
  views: build.views,
  authorId: build.author_id,
  approved: build.approved,
  createdAt: build.created_at
});

const convertRaidToOldFormat = (raid: Raid & { profiles?: Profile, raid_participants?: (RaidParticipant & { profiles?: Profile })[] }) => ({
  id: raid.id,
  title: raid.title,
  description: raid.description,
  date: raid.date,
  time: raid.time,
  maxPlayers: raid.max_players,
  currentPlayers: (raid.raid_participants || []).map(p => ({
    userId: p.user_id,
    role: p.role
  })),
  authorId: raid.author_id,
  createdAt: raid.created_at
});

export const supabaseStorage = {
  // Аутентификация
  async signUp(username: string, password: string) {
    const email = `${username}@venom.local`; // Создаем email из username
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(username: string, password: string) {
    const email = `${username}@venom.local`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;
    return convertProfileToUser(profile);
  },

  // Пользователи
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(convertProfileToUser);
  },

  async updateUser(userId: string, updates: Partial<Profile>) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  },

  async deleteUser(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  },

  // Билды
  async getBuilds() {
    const { data, error } = await supabase
      .from('builds')
      .select(`
        *,
        profiles:author_id (username)
      `)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(convertBuildToOldFormat);
  },

  async createBuild(build: Omit<Build, 'id' | 'created_at' | 'likes' | 'views'>) {
    const { data, error } = await supabase
      .from('builds')
      .insert([build])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBuild(buildId: string, updates: Partial<Build>) {
    const { error } = await supabase
      .from('builds')
      .update(updates)
      .eq('id', buildId);

    if (error) throw error;
  },

  async deleteBuild(buildId: string) {
    const { error } = await supabase
      .from('builds')
      .delete()
      .eq('id', buildId);

    if (error) throw error;
  },

  async incrementBuildViews(buildId: string) {
    const { error } = await supabase.rpc('increment_build_views', {
      build_id: buildId
    });

    if (error) {
      // Fallback если функция не существует
      const { data: build } = await supabase
        .from('builds')
        .select('views')
        .eq('id', buildId)
        .single();

      if (build) {
        await supabase
          .from('builds')
          .update({ views: build.views + 1 })
          .eq('id', buildId);
      }
    }
  },

  // Рейды
  async getRaids() {
    const { data, error } = await supabase
      .from('raids')
      .select(`
        *,
        profiles:author_id (username),
        raid_participants (
          user_id,
          role,
          profiles:user_id (username)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(convertRaidToOldFormat);
  },

  async createRaid(raid: Omit<Raid, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('raids')
      .insert([raid])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRaid(raidId: string, updates: Partial<Raid>) {
    const { error } = await supabase
      .from('raids')
      .update(updates)
      .eq('id', raidId);

    if (error) throw error;
  },

  async deleteRaid(raidId: string) {
    const { error } = await supabase
      .from('raids')
      .delete()
      .eq('id', raidId);

    if (error) throw error;
  },

  async joinRaid(raidId: string, userId: string, role: 'dd' | 'medic' | 'tank' | 'flex') {
    const { error } = await supabase
      .from('raid_participants')
      .insert([{
        raid_id: raidId,
        user_id: userId,
        role
      }]);

    if (error) throw error;
  },

  async leaveRaid(raidId: string, userId: string) {
    const { error } = await supabase
      .from('raid_participants')
      .delete()
      .eq('raid_id', raidId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Билды на модерации
  async getPendingBuilds() {
    const { data, error } = await supabase
      .from('pending_builds')
      .select(`
        *,
        profiles:author_id (username)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createPendingBuild(build: Omit<PendingBuild, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('pending_builds')
      .insert([build])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async approveBuild(pendingBuildId: string) {
    // Получаем билд из pending_builds
    const { data: pendingBuild, error: fetchError } = await supabase
      .from('pending_builds')
      .select('*')
      .eq('id', pendingBuildId)
      .single();

    if (fetchError) throw fetchError;

    // Создаем в builds
    const { error: createError } = await supabase
      .from('builds')
      .insert([{
        title: pendingBuild.title,
        description: pendingBuild.description,
        image: pendingBuild.image,
        author_id: pendingBuild.author_id,
        approved: true
      }]);

    if (createError) throw createError;

    // Удаляем из pending_builds
    const { error: deleteError } = await supabase
      .from('pending_builds')
      .delete()
      .eq('id', pendingBuildId);

    if (deleteError) throw deleteError;
  },

  async rejectBuild(pendingBuildId: string) {
    const { error } = await supabase
      .from('pending_builds')
      .delete()
      .eq('id', pendingBuildId);

    if (error) throw error;
  },

  // Лайки
  async getUserLikes(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_likes')
      .select('build_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(like => like.build_id);
  },

  async likeBuild(userId: string, buildId: string) {
    const { error } = await supabase
      .from('user_likes')
      .insert([{
        user_id: userId,
        build_id: buildId
      }]);

    if (error) throw error;

    // Увеличиваем счетчик лайков
    const { data: build } = await supabase
      .from('builds')
      .select('likes')
      .eq('id', buildId)
      .single();

    if (build) {
      await supabase
        .from('builds')
        .update({ likes: build.likes + 1 })
        .eq('id', buildId);
    }
  },

  async unlikeBuild(userId: string, buildId: string) {
    const { error } = await supabase
      .from('user_likes')
      .delete()
      .eq('user_id', userId)
      .eq('build_id', buildId);

    if (error) throw error;

    // Уменьшаем счетчик лайков
    const { data: build } = await supabase
      .from('builds')
      .select('likes')
      .eq('id', buildId)
      .single();

    if (build && build.likes > 0) {
      await supabase
        .from('builds')
        .update({ likes: build.likes - 1 })
        .eq('id', buildId);
    }
  }
};