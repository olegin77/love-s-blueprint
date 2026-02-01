
# Тестирование и исправление мобильной версии + Ребрендинг на "Weddinguz"

## Обнаруженные проблемы

### Критические (Mobile UI)
| # | Проблема | Локация |
|---|----------|---------|
| 1 | Текст "мечту о свадьбе" не отображается в Hero секции | `Hero.tsx` |
| 2 | Footer содержит `animate-pulse` на иконке (запрещённая анимация) | `Footer.tsx` line 104 |
| 3 | Главная страница (/) не имеет нижней навигации для мобильных | `Index.tsx` / `DashboardLayout.tsx` |

### Ребрендинг "WeddingTech" → "Weddinguz"
Название и бренд упоминаются в 17+ файлах. Необходимо заменить везде:

| Файл | Текущее значение | Новое значение |
|------|------------------|----------------|
| `vite.config.ts` | `name: 'WeddingTech UZ'`, `short_name: 'WeddingTech'` | `name: 'Weddinguz'`, `short_name: 'Weddinguz'` |
| `index.html` | `<title>WeddingTech UZ...`, `apple-mobile-web-app-title="WeddingTech"`, `og:title="WeddingTech UZ..."` | `Weddinguz` везде |
| `src/components/DashboardLayout.tsx` line 51 | `WeddingTech` | `Weddinguz` |
| `src/components/AppSidebar.tsx` line 131 | `WeddingTech` | `Weddinguz` |
| `src/components/landing/Header.tsx` line 96 | `WeddingTech` | `Weddinguz` |
| `src/components/landing/Footer.tsx` lines 54-55, 100 | `WeddingTech UZ` | `Weddinguz` |
| `src/pages/Auth.tsx` line 165, 185 | `WeddingTech UZ` | `Weddinguz` |
| `src/pages/Install.tsx` lines 52, 65, 79 | `WeddingTech UZ` | `Weddinguz` |
| `src/pages/WeddingWebsite.tsx` line 313 | `WeddingTech UZ` | `Weddinguz` |
| `src/i18n/locales/en.json` line 206 | `WeddingTech UZ` | `Weddinguz` |
| `src/i18n/locales/ru.json` line 206 | `WeddingTech UZ` | `Weddinguz` |
| Edge Functions (5 файлов) | `WeddingTech UZ` | `Weddinguz` |

---

## План исправлений

### Часть 1: Исправление Hero секции (текст не отображается)

Проблема в `TextReveal` компоненте или анимации. Текст "мечту о свадьбе" исчезает.

**Решение:** Упростить Hero заголовок для мобильных - убрать сложные анимации `TextReveal`, сделать простой статичный текст на мобильных:

```tsx
// Hero.tsx - упрощённый заголовок
<h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
  {isMobile ? (
    // Статичный текст для мобильных
    <>
      <span className="block text-gradient-animated">Увидьте свою</span>
      <span className="block text-gradient-animated">мечту о свадьбе</span>
      <span className="block text-foreground/85 mt-2">ещё до её начала</span>
    </>
  ) : (
    // Анимированный текст для десктопа
    <>
      <TextReveal text="Увидьте свою" className="block" delay={0.3} />
      <TextReveal text="мечту о свадьбе" className="block" delay={0.5} gradient />
      ...
    </>
  )}
</h1>
```

### Часть 2: Удаление animate-pulse из Footer

```tsx
// Footer.tsx line 104 - БЫЛО:
<Heart className="inline w-4 h-4 text-primary fill-primary animate-pulse" />

// Footer.tsx line 104 - СТАНЕТ:
<Heart className="inline w-4 h-4 text-primary fill-primary" />
```

### Часть 3: Ребрендинг на "Weddinguz"

#### 3.1 Логотип
Создать более уникальный логотип вместо простого сердца:
- Стилизованная буква "W" с обручальными кольцами
- Или текстовый логотип "Weddinguz" с акцентным градиентом

#### 3.2 Замена названия во всех файлах

| Группа файлов | Количество замен |
|---------------|------------------|
| Config (vite, index.html) | ~8 замен |
| Components | ~6 замен |
| Pages | ~5 замен |
| i18n локали | ~3 замены |
| Edge Functions | ~15 замен |

### Часть 4: Улучшение мобильной навигации на главной

Главная страница (/) не использует `DashboardLayout`, поэтому `BottomNavigation` там не отображается. Варианты решения:

**Вариант A (рекомендуется):** Добавить отдельную мобильную навигацию на главную страницу
- Sticky CTA кнопка внизу экрана на мобильных
- Упрощённая версия без полной навигации

**Вариант B:** Оставить как есть (Header уже имеет hamburger menu)

---

## Файлы для изменения

| # | Файл | Изменения |
|---|------|-----------|
| 1 | `vite.config.ts` | Заменить `WeddingTech` → `Weddinguz` |
| 2 | `index.html` | Заменить все упоминания `WeddingTech` → `Weddinguz` |
| 3 | `src/components/landing/Hero.tsx` | Исправить отображение текста на мобильных |
| 4 | `src/components/landing/Footer.tsx` | Удалить `animate-pulse`, заменить `WeddingTech UZ` → `Weddinguz` |
| 5 | `src/components/landing/Header.tsx` | Заменить `WeddingTech` → `Weddinguz` |
| 6 | `src/components/DashboardLayout.tsx` | Заменить `WeddingTech` → `Weddinguz` |
| 7 | `src/components/AppSidebar.tsx` | Заменить `WeddingTech` → `Weddinguz` |
| 8 | `src/pages/Auth.tsx` | Заменить `WeddingTech UZ` → `Weddinguz` |
| 9 | `src/pages/Install.tsx` | Заменить `WeddingTech UZ` → `Weddinguz` |
| 10 | `src/pages/WeddingWebsite.tsx` | Заменить `WeddingTech UZ` → `Weddinguz` |
| 11 | `src/i18n/locales/en.json` | Заменить `WeddingTech UZ` → `Weddinguz` |
| 12 | `src/i18n/locales/ru.json` | Заменить `WeddingTech UZ` → `Weddinguz` |
| 13 | `supabase/functions/send-email-notification/index.ts` | Заменить в email шаблонах |
| 14 | `supabase/functions/export-wedding-plan-pdf/index.ts` | Заменить в PDF |

---

## Техническая часть

### Исправление TextReveal для мобильных

Проверить компонент `TextReveal.tsx` - возможно анимация "съедает" текст на мобильных из-за viewport timing или intersection observer.

Безопасное решение - условный рендер:

```tsx
// Проверка isMobile перед применением сложных анимаций
{isMobile ? (
  <span className={gradient ? "text-gradient-animated" : ""}>
    {text}
  </span>
) : (
  <TextReveal text={text} gradient={gradient} delay={delay} />
)}
```

### Обновлённый логотип

Предлагаю использовать стилизованный текстовый логотип:

```tsx
// Вместо Heart иконки - текстовый логотип
<div className="flex items-center gap-2">
  <div className="w-9 h-9 rounded-xl gradient-luxe flex items-center justify-center shadow-lg">
    <span className="text-white font-bold text-lg">W</span>
  </div>
  <span className="text-xl font-bold text-gradient-animated">
    Weddinguz
  </span>
</div>
```

---

## Ожидаемый результат

После внедрения:
1. **Мобильная версия** - весь текст отображается корректно
2. **Нет пульсирующих анимаций** - Footer без `animate-pulse`
3. **Единый бренд "Weddinguz"** - везде консистентное название
4. **Современный логотип** - стилизованная буква W или текстовый логотип
5. **Оптимизированный UI** - всё читается и работает на мобильных устройствах
