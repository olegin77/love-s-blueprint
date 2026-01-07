-- Исправить SECURITY DEFINER view - пересоздать с SECURITY INVOKER
DROP VIEW IF EXISTS public.public_vendor_profiles;

CREATE VIEW public.public_vendor_profiles 
WITH (security_invoker = on) AS
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.avatar_url,
  p.created_at
FROM public.profiles p
WHERE p.role = 'vendor';

-- Разрешить доступ
GRANT SELECT ON public.public_vendor_profiles TO authenticated;
GRANT SELECT ON public.public_vendor_profiles TO anon;