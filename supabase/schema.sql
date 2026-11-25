-- ============================================================================
-- SUPABASE POSTGRES SCHEMA — THỊ TRẤN SAO BÔNG (GIAI ĐOẠN 5)
-- Chạy file này trong Supabase SQL Editor để khởi tạo toàn bộ Backend.
-- ============================================================================

-- 1. Hồ sơ cư dân & Chuỗi chuyên cần
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT 'Bạn nhỏ đáng yêu',
  avatar_choice TEXT NOT NULL DEFAULT 'user_character',
  town_hearts INTEGER NOT NULL DEFAULT 0,
  daily_streak INTEGER NOT NULL DEFAULT 0,
  total_quests_completed INTEGER NOT NULL DEFAULT 0,
  last_streak_date DATE,
  saved_stars JSONB NOT NULL DEFAULT '[]'::jsonb,
  collected_comics JSONB NOT NULL DEFAULT '[]'::jsonb,
  mood_calendar JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Lời chúc cộng đồng trên bầu trời sao
CREATE TABLE IF NOT EXISTS public.wishes (
  id TEXT PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nickname TEXT NOT NULL DEFAULT 'Người lạ',
  author_title TEXT NOT NULL DEFAULT '🕊️ Sứ Giả Bầu Trời',
  stamp TEXT NOT NULL DEFAULT 'star',
  mood TEXT NOT NULL DEFAULT 'all',
  message TEXT NOT NULL CHECK (char_length(message) <= 220),
  likes INTEGER NOT NULL DEFAULT 0,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tiến độ nhiệm vụ theo ngày (YYYY-MM-DD)
CREATE TABLE IF NOT EXISTS public.daily_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date_key DATE NOT NULL,
  completed_quest_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  inworld_quests JSONB NOT NULL DEFAULT '{}'::jsonb,
  reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date_key)
);

-- 4. Kho Truyện Tranh Mỗi Ngày & Hàng đợi ý tưởng
CREATE TABLE IF NOT EXISTS public.comics (
  id TEXT PRIMARY KEY,
  publish_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'archived')),
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Ban Biên Tập Thị Trấn',
  moral TEXT NOT NULL DEFAULT '',
  pages_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  views_count INTEGER NOT NULL DEFAULT 0,
  collect_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comics ENABLE ROW LEVEL SECURITY;

-- Policies an toàn cơ bản
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users upsert own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Anyone reads approved wishes" ON public.wishes FOR SELECT USING (approved = TRUE);
CREATE POLICY "Authenticated inserts wish" ON public.wishes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users manage own daily progress" ON public.daily_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone reads approved comics" ON public.comics FOR SELECT USING (status = 'approved');
