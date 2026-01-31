# 🎊 WeddingTech UZ - AI-Powered Wedding Platform

**Первая в Узбекистане и СНГ AI-платформа для планирования свадеб**

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-9%20passing-brightgreen)

---

## 🌟 О Проекте

**WeddingTech UZ** — революционная платформа, которая позволяет парам увидеть свою будущую свадьбу ещё до её проведения благодаря передовым AI-технологиям.

### ✨ Реализованный Функционал

| Модуль | Статус | Описание |
|--------|--------|----------|
| 🎨 AI Wedding Visualizer | ✅ | Генерация изображений свадьбы в 6 стилях |
| 🏛️ AI Venue Designer | ✅ | Визуализация декора в реальных площадках |
| 💌 AI Invitation Creator | ✅ | Автоматическое создание приглашений |
| 🎤 Voice RSVP | ✅ | Голосовой AI-агент для сбора ответов гостей |
| 📱 Telegram Bot | ✅ | RSVP через Telegram |
| 💰 Smart Budget | ✅ | AI-оптимизация бюджета с подбором вендоров |
| 🪑 Smart Seating | ✅ | AI-рассадка 500+ гостей с учётом связей |
| 💳 Escrow Payments | ✅ | Безопасные платежи через Payme/Click/Uzum |
| 🎁 Gift Registry | ✅ | Реестр подарков с взносами |
| 🏆 Gamification | ✅ | Достижения и прогресс планирования |
| 🌐 Wedding Website | ✅ | Конструктор свадебного сайта |
| 📧 RSVP Portal | ✅ | Цифровые приглашения с отслеживанием |

---

## 🏗️ Технологический Стек

### Frontend
- **Framework**: React 18.3 + Vite + TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query v5
- **Animations**: Framer Motion
- **i18n**: i18next (RU, UZ, EN)
- **PWA**: vite-plugin-pwa + Workbox

### Backend (Lovable Cloud)
- **Database**: PostgreSQL + Row Level Security
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (avatars, portfolio)
- **Edge Functions**: 12 Deno serverless functions

### AI Services
- **Lovable AI Gateway**: google/gemini-2.5-flash
- **Voice**: ElevenLabs Conversational AI
- **Image Generation**: Lovable AI (flux models)

---

## 🚀 Быстрый Старт

### Требования
- Node.js >= 20.0.0
- Bun или npm

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/yourusername/weddingtech-uz.git
cd weddingtech-uz

# Установить зависимости
bun install

# Запустить dev сервер
bun dev
```

Приложение будет доступно по адресу: `http://localhost:8080`

### Тестирование

```bash
# Запустить unit тесты
bun test

# Запустить с watch mode
bun test --watch
```

---

## 📦 Структура Проекта

```
weddingtech-uz/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui компоненты
│   │   ├── landing/         # Landing page (Hero, Features, Stats)
│   │   ├── budget/          # Budget tracker
│   │   ├── seating/         # Seating chart canvas
│   │   ├── gamification/    # Achievements, Progress
│   │   ├── gifts/           # Gift registry
│   │   ├── payment/         # Escrow, QR payments
│   │   ├── vendor/          # Vendor profiles, comparison
│   │   ├── communication/   # Voice RSVP, Telegram
│   │   └── onboarding/      # Wedding wizard
│   ├── pages/               # 25+ страниц
│   ├── hooks/               # Custom hooks (smart matching, etc.)
│   ├── services/            # AI services
│   ├── i18n/                # Локализация (RU, UZ, EN)
│   └── integrations/        # Supabase client
├── supabase/
│   ├── functions/           # 12 Edge Functions
│   ├── migrations/          # Database migrations
│   └── seed.sql             # Sample vendor data
└── public/                  # PWA icons, manifest
```

---

## 🔐 Настройка Секретов

Перед production деплоем добавьте API ключи. Подробная инструкция в файле **[SETUP_SECRETS.md](./SETUP_SECRETS.md)**.

### Обязательные
- `ELEVENLABS_API_KEY` — для Voice RSVP
- `TELEGRAM_BOT_TOKEN` — для Telegram интеграции

### Опциональные
- `OPENAI_API_KEY` — для расширенных AI функций
- `RESEND_API_KEY` — для email уведомлений
- `PAYME_MERCHANT_ID` / `CLICK_MERCHANT_ID` — для платежей

---

## 📱 PWA Возможности

Приложение работает как Progressive Web App:

- ✅ Установка на устройство (iOS, Android, Desktop)
- ✅ Offline режим (кэширование данных)
- ✅ Push уведомления
- ✅ Fullscreen режим

Страница установки: `/install`

---

## 🎯 Роадмап

### ✅ Завершено (v2.0)
- [x] AI Visual Design & Inpainting
- [x] UZ Localization (multi-event: Osh, Nikoh, Fotiha, Toy)
- [x] Smart Guest Seating AI
- [x] Fintech Escrow & QR-Pay
- [x] AI Communications (Voice + Telegram)
- [x] Premium Features (Gifts + Gamification)

### 🔜 Планируется (v2.1)
- [ ] Mobile app (React Native)
- [ ] Vendor analytics dashboard
- [ ] AI photo/video editing
- [ ] Multi-wedding support

---

## 👥 Роли Пользователей

| Роль | Описание |
|------|----------|
| **Couple** | Молодожёны — полный доступ к планированию |
| **Vendor** | Поставщики — управление профилем, бронированиями |
| **Admin** | Администраторы — модерация, верификация |

---

## 📊 Рынок

| Метрика | Значение |
|---------|----------|
| Свадеб в год (UZ) | 305,000+ |
| Средний бюджет | $15,000-30,000 |
| Объём рынка | $6.1 млрд |
| Гостей на свадьбе | 300-1000 |

### Целевые рынки
- 🇺🇿 Узбекистан (Primary)
- 🇰🇿 Казахстан (Secondary)
- 🇹🇯 Таджикистан (Tertiary)

---

## 📝 Документация

- [PROJECT_CONCEPT.md](./PROJECT_CONCEPT.md) — Полная концепция и архитектура
- [PROGRESS.md](./PROGRESS.md) — Детальный progress tracker
- [SETUP_SECRETS.md](./SETUP_SECRETS.md) — Настройка API ключей
- [PWA_GUIDE.md](./PWA_GUIDE.md) — PWA инструкции
- [PAYMENT_SETUP.md](./PAYMENT_SETUP.md) — Настройка платежей

---

## 🤝 Вклад в Проект

1. Fork проект
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

## 📝 Лицензия

Этот проект лицензирован под MIT License.

---

## 📞 Контакты

**WeddingTech UZ Team**
- Website: [weddingtech.uz](https://wedding.lovable.app)
- Telegram: @weddingtechuz

---

**Made with ❤️ in Uzbekistan | Powered by Lovable**
