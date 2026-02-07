# Weddinguz — Руководство по развёртыванию базы данных

**Версия:** 2.1.0 | **Последнее обновление:** 2026-02-07

---

## Оглавление

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Требования](#требования)
3. [Схема базы данных (ER-диаграмма)](#схема-базы-данных)
4. [Быстрый старт](#быстрый-старт)
5. [Пошаговая установка](#пошаговая-установка)
6. [Описание таблиц](#описание-таблиц)
7. [Перечисления (Enums)](#перечисления)
8. [Функции и триггеры](#функции-и-триггеры)
9. [Политики безопасности (RLS)](#политики-безопасности)
10. [Миграция данных из Lovable Cloud](#миграция-данных)
11. [Адаптация к другим платформам](#адаптация)
12. [FAQ](#faq)

---

## Обзор архитектуры

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vite)                │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Dashboard │  │ Planner  │  │Marketplace│  │  Auth  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│                        │                                │
│              ┌─────────▼─────────┐                      │
│              │  Supabase Client  │                      │
│              └─────────┬─────────┘                      │
└────────────────────────┼────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (PostgreSQL)                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │               36 таблиц + 1 View                │    │
│  │                                                 │    │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │    │
│  │  │  Core   │  │  Events  │  │   Payments     │  │    │
│  │  │profiles │  │  guests  │  │   bookings     │  │    │
│  │  │plans    │  │  events  │  │   escrow       │  │    │
│  │  │vendors  │  │  rsvp    │  │   qr_sessions  │  │    │
│  │  └─────────┘  └──────────┘  └────────────────┘  │    │
│  │                                                 │    │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │    │
│  │  │ Seating │  │  Gifts   │  │   Comms        │  │    │
│  │  │ charts  │  │ registry │  │   telegram     │  │    │
│  │  │ tables  │  │ contrib  │  │   voice_rsvp   │  │    │
│  │  └─────────┘  └──────────┘  └────────────────┘  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌────────────┐  ┌───────────┐  ┌──────────────────┐    │
│  │ 7 Functions│  │ 30 Triggers│  │  60+ RLS Policies│    │
│  └────────────┘  └───────────┘  └──────────────────┘    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │          15 Edge Functions (Deno)                │   │
│  │  wedding-assistant, process-payment, escrow,     │   │
│  │  qr-payment, voice-rsvp, telegram, email, etc.  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Требования

### Минимальные
| Компонент | Версия |
|-----------|--------|
| PostgreSQL | 15+ |
| Дисковое пространство | 500 MB+ |
| ОЗУ | 1 GB+ |

### Расширения PostgreSQL
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Рекомендуемые платформы
| Платформа | Тип | Бесплатный план |
|-----------|-----|:---------------:|
| **Supabase** | BaaS (PostgreSQL + Auth + Storage) | ✅ |
| **Neon** | Serverless PostgreSQL | ✅ |
| **Railway** | Managed PostgreSQL | ✅ |
| **DigitalOcean** | Managed DB | ❌ |
| **AWS RDS** | Managed DB | ❌ |
| **Self-hosted** | Docker/VM | ✅ |

---

## Схема базы данных

### ER-диаграмма (основные связи)

```mermaid
erDiagram
    profiles ||--o{ wedding_plans : "couple_user_id"
    profiles ||--o{ vendor_profiles : "user_id"
    profiles ||--o{ user_roles : "user_id"
    
    wedding_plans ||--o{ guests : "wedding_plan_id"
    wedding_plans ||--o{ wedding_events : "wedding_plan_id"
    wedding_plans ||--o{ bookings : "wedding_plan_id"
    wedding_plans ||--o{ budget_items : "wedding_plan_id"
    wedding_plans ||--o{ seating_charts : "wedding_plan_id"
    wedding_plans ||--o{ gift_registry_items : "wedding_plan_id"
    wedding_plans ||--o{ wedding_invitations : "wedding_plan_id"
    wedding_plans ||--o{ wedding_visualizations : "wedding_plan_id"
    wedding_plans ||--o{ wedding_websites : "wedding_plan_id"
    wedding_plans ||--o| communication_settings : "wedding_plan_id"
    wedding_plans ||--o| telegram_connections : "wedding_plan_id"
    wedding_plans ||--o{ planning_milestones : "wedding_plan_id"
    
    guests ||--o{ guest_invitations : "guest_id"
    guests ||--o{ guest_event_invitations : "guest_id"
    guests ||--o{ table_assignments : "guest_id"
    
    wedding_events ||--o{ guest_event_invitations : "event_id"
    
    vendor_profiles ||--o{ bookings : "vendor_id"
    vendor_profiles ||--o{ reviews : "vendor_id"
    vendor_profiles ||--o{ vendor_availability : "vendor_id"
    vendor_profiles ||--o{ venue_gallery : "venue_id"
    vendor_profiles ||--o{ vendor_recommendations : "vendor_id"
    
    bookings ||--o{ payments : "booking_id"
    bookings ||--o{ escrow_transactions : "booking_id"
    
    payments ||--o{ escrow_transactions : "payment_id"
    
    escrow_transactions ||--o{ vendor_payouts : "escrow_transaction_id"
    
    seating_charts ||--o{ seating_tables : "seating_chart_id"
    seating_tables ||--o{ table_assignments : "seating_table_id"
    
    gift_registry_items ||--o{ gift_contributions : "gift_item_id"
    
    telegram_connections ||--o{ telegram_rsvp_responses : "telegram_connection_id"
    
    achievements ||--o{ user_achievements : "achievement_id"

    profiles {
        uuid id PK
        text email
        text full_name
        user_role role
    }
    
    wedding_plans {
        uuid id PK
        uuid couple_user_id FK
        date wedding_date
        integer estimated_guests
        numeric budget_total
    }
    
    vendor_profiles {
        uuid id PK
        uuid user_id FK
        text business_name
        vendor_category category
        numeric rating
    }
    
    guests {
        uuid id PK
        uuid wedding_plan_id FK
        text full_name
        wedding_side guest_side
    }
    
    bookings {
        uuid id PK
        uuid wedding_plan_id FK
        uuid vendor_id FK
        booking_status status
        numeric price
    }
    
    payments {
        uuid id PK
        uuid booking_id FK
        numeric amount
        text payment_provider
        text status
    }
```

### Группы таблиц

```
📁 CORE (3 таблицы)
├── profiles          — Профили пользователей
├── user_roles        — Роли (couple/vendor/admin)
└── wedding_plans     — Свадебные планы

📁 VENDORS (5 таблиц)
├── vendor_profiles      — Профили поставщиков
├── vendor_availability  — Доступность по датам
├── vendor_recommendations — AI-рекомендации
├── favorite_vendors     — Избранные
└── venue_gallery        — Галерея площадок

📁 GUESTS (4 таблицы)
├── guests              — Список гостей
├── guest_invitations   — Приглашения с токенами
├── guest_event_invitations — RSVP на отдельные события
└── wedding_events      — Мероприятия (Никох, Той, и т.д.)

📁 PAYMENTS (5 таблиц)
├── bookings            — Бронирования
├── payments            — Платежи (Payme, Click, Uzum)
├── escrow_transactions — Эскроу-система
├── vendor_payouts      — Выплаты поставщикам
└── qr_payment_sessions — QR-оплата

📁 BUDGET (1 таблица)
└── budget_items        — Статьи бюджета по категориям

📁 SEATING (3 таблицы)
├── seating_charts      — Схемы рассадки
├── seating_tables      — Столы (форма, позиция)
└── table_assignments   — Назначения гостей за столы

📁 GIFTS (2 таблицы)
├── gift_registry_items — Список подарков
└── gift_contributions  — Взносы на подарки

📁 INVITATIONS & VISUALS (3 таблицы)
├── wedding_invitations    — AI-приглашения
├── wedding_visualizations — AI-визуализации
└── venue_visualizations   — Визуализация декора

📁 COMMUNICATIONS (4 таблицы)
├── communication_settings   — Настройки каналов
├── telegram_connections     — Telegram-боты
├── telegram_rsvp_responses  — Ответы через Telegram
└── voice_rsvp_sessions      — Голосовой RSVP

📁 GAMIFICATION (3 таблицы)
├── achievements         — Список достижений
├── user_achievements    — Заработанные достижения
└── planning_milestones  — Этапы планирования

📁 OTHER (3 таблицы)
├── reviews               — Отзывы о поставщиках
├── notification_preferences — Настройки уведомлений
└── wedding_websites       — Свадебные сайты

📁 VIEWS (1)
└── public_vendor_profiles — Публичные данные вендоров
```

---

## Быстрый старт

### Вариант 1: Supabase (рекомендуется)

```bash
# 1. Установить Supabase CLI
npm install -g supabase

# 2. Создать проект на supabase.com

# 3. Получить connection string из Dashboard > Settings > Database

# 4. Применить схему
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" -f database/schema.sql

# 5. (Опционально) Загрузить тестовые данные
psql "postgresql://..." -f database/seed.sql
```

### Вариант 2: Docker (self-hosted)

```bash
# 1. Запустить PostgreSQL
docker run -d \
  --name weddinguz-db \
  -e POSTGRES_DB=weddinguz \
  -e POSTGRES_USER=weddinguz_admin \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -v weddinguz_data:/var/lib/postgresql/data \
  postgres:15-alpine

# 2. Применить схему
docker exec -i weddinguz-db psql -U weddinguz_admin -d weddinguz < database/schema.sql

# 3. Проверить
docker exec -it weddinguz-db psql -U weddinguz_admin -d weddinguz -c "\dt public.*"
```

### Вариант 3: Neon (serverless)

```bash
# 1. Создать проект на neon.tech

# 2. Скопировать connection string

# 3. Применить схему
psql "postgresql://[user]:[password]@[host]/[dbname]?sslmode=require" -f database/schema.sql
```

---

## Пошаговая установка

### Шаг 1: Создание базы данных

```sql
CREATE DATABASE weddinguz
  ENCODING = 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8';
```

### Шаг 2: Установка расширений

```sql
\c weddinguz;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Шаг 3: Применение схемы

```bash
psql -U postgres -d weddinguz -f database/schema.sql
```

### Шаг 4: Верификация

```sql
-- Проверить количество таблиц (ожидается 36)
SELECT COUNT(*) AS table_count 
FROM pg_tables 
WHERE schemaname = 'public';

-- Проверить перечисления (ожидается 10)
SELECT typname 
FROM pg_type 
WHERE typnamespace = 'public'::regnamespace 
AND typtype = 'e' 
ORDER BY typname;

-- Проверить функции (ожидается 7)
SELECT proname 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
ORDER BY proname;

-- Проверить триггеры (ожидается 30)
SELECT COUNT(*) AS trigger_count
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND NOT t.tgisinternal;
```

### Шаг 5: Создание первого пользователя

```sql
-- Вручную (без Supabase Auth)
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  gen_random_uuid(),
  'admin@weddinguz.uz',
  'Admin',
  'admin'
);

-- Добавить роль
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM public.profiles WHERE email = 'admin@weddinguz.uz';
```

---

## Описание таблиц

### Основные таблицы

| Таблица | Записей (типично) | Описание |
|---------|-------------------|----------|
| `profiles` | 1 на пользователя | Основной профиль |
| `user_roles` | 1-2 на пользователя | Роли доступа |
| `wedding_plans` | 1 на пару | Главный план свадьбы |
| `vendor_profiles` | ~100-1000 | Каталог поставщиков |
| `guests` | ~50-500 на план | Список гостей |
| `bookings` | ~5-20 на план | Бронирования |
| `budget_items` | ~20-50 на план | Статьи бюджета |

### Связи между таблицами

| Таблица | Связана с | Тип связи |
|---------|-----------|-----------|
| `wedding_plans` → `profiles` | couple_user_id | Many-to-One |
| `guests` → `wedding_plans` | wedding_plan_id | Many-to-One |
| `bookings` → `wedding_plans` | wedding_plan_id | Many-to-One |
| `bookings` → `vendor_profiles` | vendor_id | Many-to-One |
| `payments` → `bookings` | booking_id | Many-to-One |
| `escrow_transactions` → `payments` | payment_id | Many-to-One |
| `seating_tables` → `seating_charts` | seating_chart_id | Many-to-One |
| `table_assignments` → `seating_tables` | seating_table_id | Many-to-One |

---

## Перечисления

| Enum | Значения | Используется в |
|------|----------|---------------|
| `user_role` | couple, vendor, admin | profiles, user_roles |
| `vendor_category` | venue, photographer, videographer, caterer, florist, decorator, music, makeup, clothing, transport, other | vendor_profiles |
| `booking_status` | pending, confirmed, cancelled, completed | bookings |
| `payment_status` | pending, paid, refunded, failed | bookings |
| `escrow_status` | pending, released, refunded, disputed, partial_release | escrow_transactions |
| `payout_status` | pending, processing, completed, failed | vendor_payouts |
| `budget_category_type` | venue, catering, photography, videography, flowers, decoration, music, attire, makeup, invitations, transportation, gifts, rings, honeymoon, other | budget_items |
| `wedding_event_type` | nahorgi_osh, fotiha, nikoh, kelin_salom, toy | wedding_events |
| `wedding_side` | groom, bride, both | guests, wedding_events |
| `communication_channel` | email, sms, telegram, voice, whatsapp | communication_settings |

---

## Функции и триггеры

### Функции

| Функция | Тип | Описание |
|---------|-----|----------|
| `update_updated_at_column()` | Trigger | Автообновление `updated_at` |
| `has_role(_user_id, _role)` | Query | Проверка роли (SECURITY DEFINER) |
| `calculate_wedding_budget_totals(plan_id)` | Query | Суммы бюджета по плану |
| `update_vendor_rating()` | Trigger | Пересчёт рейтинга после отзыва |
| `create_escrow_on_payment()` | Trigger | Авто-создание эскроу |
| `update_gift_current_amount()` | Trigger | Обновление суммы подарка |
| `handle_new_user()` | Trigger | Создание профиля при регистрации |

### Триггеры

| Триггер | Таблица | Событие | Функция |
|---------|---------|---------|---------|
| `update_*_updated_at` | 28 таблиц | BEFORE UPDATE | `update_updated_at_column()` |
| `on_review_created` | reviews | AFTER INSERT | `update_vendor_rating()` |
| `create_escrow_after_payment` | payments | AFTER UPDATE | `create_escrow_on_payment()` |
| `update_gift_amount_on_contribution` | gift_contributions | AFTER INSERT/UPDATE | `update_gift_current_amount()` |

---

## Политики безопасности

### Принципы RLS

1. **Пары** видят/редактируют только свои данные (через `wedding_plans.couple_user_id = auth.uid()`)
2. **Поставщики** видят свои профили, бронирования, платежи
3. **Публичные данные**: vendor_profiles (SELECT), reviews (SELECT), achievements (SELECT), gift_registry (SELECT)
4. **Админы**: полный доступ к эскроу и выплатам через `has_role()`

### Важно для self-hosted

При использовании без Supabase Auth, функция `auth.uid()` недоступна. Варианты:

**Вариант A: Создать свою функцию `auth.uid()`**
```sql
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::UUID
$$;

-- Перед каждым запросом:
SET LOCAL app.current_user_id = 'ваш-uuid-пользователя';
```

**Вариант B: Использовать middleware на бэкенде**
```javascript
// Express.js пример
app.use((req, res, next) => {
  const userId = req.user?.id; // из JWT или сессии
  pool.query(`SET LOCAL app.current_user_id = '${userId}'`);
  next();
});
```

**Вариант C: Отключить RLS и реализовать авторизацию на уровне приложения**
```sql
-- ВНИМАНИЕ: Только если авторизация полностью на бэкенде
ALTER TABLE public.wedding_plans DISABLE ROW LEVEL SECURITY;
```

---

## Миграция данных

### Экспорт из Lovable Cloud

```bash
# Полный дамп (схема + данные)
pg_dump "postgresql://postgres:[PASS]@db.[REF].supabase.co:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-privileges \
  -f weddinguz_full_dump.sql

# Только данные (без схемы)
pg_dump "postgresql://postgres:[PASS]@db.[REF].supabase.co:5432/postgres" \
  --schema=public \
  --data-only \
  --no-owner \
  -f weddinguz_data_only.sql
```

### Импорт на новый сервер

```bash
# 1. Сначала применить схему
psql -U postgres -d weddinguz -f database/schema.sql

# 2. Затем импортировать данные
psql -U postgres -d weddinguz -f weddinguz_data_only.sql
```

---

## Адаптация

### Замена Supabase Auth

Если не используете Supabase, нужно заменить:

| Supabase | Альтернатива | Что менять |
|----------|-------------|------------|
| `auth.uid()` | JWT middleware | Все RLS-политики |
| `auth.users` | Своя таблица `users` | `handle_new_user()` |
| `auth.jwt()` | JWT decode | RLS для `user_roles` |
| Storage buckets | S3 / MinIO | Ссылки на изображения |

### Замена Edge Functions

| Edge Function | Альтернатива | Описание |
|---------------|-------------|----------|
| `wedding-assistant` | Express/FastAPI + AI API | AI-ассистент |
| `process-payment` | Payment gateway SDK | Обработка платежей |
| `send-email-notification` | Nodemailer / SendGrid | Email-уведомления |
| `telegram-webhook` | Express webhook handler | Telegram бот |
| `voice-rsvp` | WebSocket server | Голосовой RSVP |
| `generate-wedding-visualization` | AI image API | AI-визуализации |
| `export-wedding-plan-pdf` | Puppeteer / jsPDF | PDF-экспорт |

### Docker Compose для self-hosted

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: weddinguz
      POSTGRES_USER: weddinguz_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U weddinguz_admin -d weddinguz"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@weddinguz.uz
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
    ports:
      - "5050:80"
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
```

---

## FAQ

### Сколько таблиц в базе?
36 таблиц + 1 view = 37 объектов

### Какие расширения PostgreSQL нужны?
`uuid-ossp` и `pgcrypto` — обе стандартные и доступны везде.

### Можно ли использовать MySQL вместо PostgreSQL?
Нет. Схема использует UUID, JSONB, ARRAY, custom ENUMs и RLS — всё это специфично для PostgreSQL.

### Как обновить схему?
Используйте миграционные файлы. Каждое изменение должно быть в отдельном `.sql` файле с номером версии:
```
database/migrations/
├── 001_initial_schema.sql
├── 002_add_telegram.sql
├── 003_add_voice_rsvp.sql
└── ...
```

### Нужен ли Supabase для работы?
Нет. Схема совместима с любым PostgreSQL 15+. Но без Supabase нужно самостоятельно реализовать:
- Аутентификацию (JWT + middleware)
- Хранилище файлов (S3/MinIO)
- Серверные функции (Express/FastAPI)
- Realtime подписки (WebSocket)

---

## Файлы проекта

```
database/
├── schema.sql          ← Полная схема (этот файл)
├── seed.sql            ← Тестовые данные (symlink to supabase/seed.sql)
└── DATABASE_SETUP.md   ← Это руководство
```

---

*Weddinguz v2.1.0 — AI-powered Wedding Platform for Uzbekistan 🇺🇿*
