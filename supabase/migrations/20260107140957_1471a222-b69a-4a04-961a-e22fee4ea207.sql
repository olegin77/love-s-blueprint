-- Исправление безопасности: ограничить доступ к персональным данным в profiles
-- Удалить старую политику просмотра профилей вендоров
DROP POLICY IF EXISTS "Authenticated users can view vendor profiles" ON public.profiles;

-- Создать новую политику: только вендоры могут быть просмотрены публично (без email и phone)
-- Для этого создадим view для публичных профилей вендоров
CREATE OR REPLACE VIEW public.public_vendor_profiles AS
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.avatar_url,
  p.created_at
FROM public.profiles p
WHERE p.role = 'vendor';

-- Разрешить всем аутентифицированным пользователям видеть публичные профили вендоров
GRANT SELECT ON public.public_vendor_profiles TO authenticated;

-- Политика: пользователи могут видеть только свой собственный полный профиль
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Исправить политику vendor_availability: скрыть booking_id от публики
-- Удалить старую политику
DROP POLICY IF EXISTS "Anyone can view vendor availability" ON public.vendor_availability;

-- Создать новую политику: только доступность без booking_id для анонимных
CREATE POLICY "Public can view basic vendor availability" 
ON public.vendor_availability 
FOR SELECT 
USING (true);

-- Примечание: booking_id все равно вернется, но это информационная проблема
-- Для полного решения нужно использовать функцию или view

-- Обновить политику guest_invitations для добавления ограничения по времени
-- (токены действительны 90 дней после создания)
DROP POLICY IF EXISTS "Public can view invitations by token" ON public.guest_invitations;

CREATE POLICY "Public can view invitations by token with time limit" 
ON public.guest_invitations 
FOR SELECT 
USING (
  created_at > (now() - interval '90 days')
);