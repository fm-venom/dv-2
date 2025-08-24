/*
  # Создание начальной схемы базы данных

  1. Новые таблицы
    - `profiles` - профили пользователей
      - `id` (uuid, primary key, связан с auth.users)
      - `username` (text, unique)
      - `is_admin` (boolean)
      - `created_at` (timestamp)
    - `builds` - билды
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image` (text)
      - `likes` (integer)
      - `views` (integer)
      - `author_id` (uuid, foreign key)
      - `approved` (boolean)
      - `created_at` (timestamp)
    - `raids` - рейды
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `date` (date)
      - `time` (time)
      - `max_players` (integer)
      - `author_id` (uuid, foreign key)
      - `created_at` (timestamp)
    - `raid_participants` - участники рейдов
      - `id` (uuid, primary key)
      - `raid_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `role` (text)
    - `pending_builds` - билды на модерации
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image` (text)
      - `author_id` (uuid, foreign key)
      - `created_at` (timestamp)
    - `user_likes` - лайки пользователей
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `build_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Безопасность
    - Включить RLS для всех таблиц
    - Добавить политики для аутентифицированных пользователей
*/

-- Создание таблицы профилей пользователей
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы билдов
CREATE TABLE IF NOT EXISTS builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  likes integer DEFAULT 0,
  views integer DEFAULT 0,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы рейдов
CREATE TABLE IF NOT EXISTS raids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  max_players integer DEFAULT 5,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы участников рейдов
CREATE TABLE IF NOT EXISTS raid_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raid_id uuid REFERENCES raids(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('dd', 'medic', 'tank', 'flex')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(raid_id, user_id)
);

-- Создание таблицы билдов на модерации
CREATE TABLE IF NOT EXISTS pending_builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы лайков
CREATE TABLE IF NOT EXISTS user_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  build_id uuid REFERENCES builds(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, build_id)
);

-- Включение RLS для всех таблиц
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE raids ENABLE ROW LEVEL SECURITY;
ALTER TABLE raid_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Политики для builds
CREATE POLICY "Approved builds are viewable by everyone"
  ON builds
  FOR SELECT
  TO authenticated
  USING (approved = true);

CREATE POLICY "Admins can view all builds"
  ON builds
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update builds"
  ON builds
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete builds"
  ON builds
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert builds"
  ON builds
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Политики для raids
CREATE POLICY "Raids are viewable by everyone"
  ON raids
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create raids"
  ON raids
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins can update raids"
  ON raids
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authors and admins can delete raids"
  ON raids
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Политики для raid_participants
CREATE POLICY "Raid participants are viewable by everyone"
  ON raid_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join raids"
  ON raid_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave raids"
  ON raid_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Политики для pending_builds
CREATE POLICY "Users can view own pending builds"
  ON pending_builds
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all pending builds"
  ON pending_builds
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can create pending builds"
  ON pending_builds
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can delete pending builds"
  ON pending_builds
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Политики для user_likes
CREATE POLICY "User likes are viewable by everyone"
  ON user_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON user_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Создание администратора по умолчанию (будет создан при первом входе)
-- Пользователь должен зарегистрироваться с email admin@venom.com и паролем admin123
-- После этого нужно будет вручную установить is_admin = true в базе данных