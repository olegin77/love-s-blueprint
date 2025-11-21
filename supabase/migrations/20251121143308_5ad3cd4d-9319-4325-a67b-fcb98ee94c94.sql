-- ЭТАП 1: Расширение схемы VendorProfile для Smart Matching Engine
-- Добавляем поля для хранения специфических характеристик услуг

-- Добавить поле attributes для гибких параметров (JSONB)
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;

-- Добавить поле styles для тегирования визуального стиля (массив текста)
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS styles TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Добавить поле starting_price для реальной цены "ОТ"
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS starting_price NUMERIC;

-- Добавить поле languages для языков обслуживания
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['russian']::TEXT[];

-- Добавить поле service_area для географии обслуживания
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS service_area TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Создать индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_attributes ON public.vendor_profiles USING GIN (attributes);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_styles ON public.vendor_profiles USING GIN (styles);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_starting_price ON public.vendor_profiles (starting_price);

-- Комментарии для документации
COMMENT ON COLUMN public.vendor_profiles.attributes IS 'Специфические атрибуты вендора в формате JSON (пакеты, оборудование, особенности услуг)';
COMMENT ON COLUMN public.vendor_profiles.styles IS 'Визуальные стили работы (например: reportage, fine-art, rustic, modern)';
COMMENT ON COLUMN public.vendor_profiles.starting_price IS 'Стартовая цена услуг (минимальный пакет)';
COMMENT ON COLUMN public.vendor_profiles.languages IS 'Языки обслуживания (russian, uzbek, english)';
COMMENT ON COLUMN public.vendor_profiles.service_area IS 'Города/районы обслуживания';

-- Создать таблицу для отслеживания занятости вендоров
CREATE TABLE IF NOT EXISTS public.vendor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vendor_id, date)
);

-- Включить RLS для vendor_availability
ALTER TABLE public.vendor_availability ENABLE ROW LEVEL SECURITY;

-- Политики доступа для vendor_availability
CREATE POLICY "Anyone can view vendor availability"
ON public.vendor_availability
FOR SELECT
USING (true);

CREATE POLICY "Vendors can manage their availability"
ON public.vendor_availability
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.vendor_profiles WHERE id = vendor_availability.vendor_id
  )
);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_vendor_availability_updated_at
BEFORE UPDATE ON public.vendor_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Создать таблицу для хранения результатов мэтчинга (кэш рекомендаций)
CREATE TABLE IF NOT EXISTS public.vendor_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  category vendor_category NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours'),
  UNIQUE(wedding_plan_id, vendor_id)
);

-- Включить RLS для vendor_recommendations
ALTER TABLE public.vendor_recommendations ENABLE ROW LEVEL SECURITY;

-- Политики доступа для vendor_recommendations
CREATE POLICY "Couples can view their recommendations"
ON public.vendor_recommendations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_plans
    WHERE wedding_plans.id = vendor_recommendations.wedding_plan_id
    AND wedding_plans.couple_user_id = auth.uid()
  )
);

-- Индексы для быстрого поиска рекомендаций
CREATE INDEX IF NOT EXISTS idx_vendor_recommendations_wedding_plan ON public.vendor_recommendations (wedding_plan_id);
CREATE INDEX IF NOT EXISTS idx_vendor_recommendations_category ON public.vendor_recommendations (category);
CREATE INDEX IF NOT EXISTS idx_vendor_recommendations_score ON public.vendor_recommendations (match_score DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_date ON public.vendor_availability (vendor_id, date);