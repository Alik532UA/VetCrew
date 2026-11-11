---
Назва: Контекст проєкту VetCrewMain
Канон: selection_criteria/v10 та product_criteria/v10
Дата оновлення: 2026-11-11
---

# Vet Crew — Project Context

## 1. Загальні відомості

- **Назва**: Vet Crew
- **Опис**: Офіційний інтерактивний веб-портал організації Vet Crew (динамічне 3D лого, офіційні канали зв'язку та підтримки, підтримка темної та світлої тем, багатомовність UA/EN).
- **Стек**: SvelteKit 2 + Svelte 5 (Runes), TypeScript, adapter-static, Lucide Svelte, CSS Variables.
- **Хостинг**: GitHub Pages (`https://alik532ua.github.io/VetCrew/`).
- **Гілка деплою**: `main`.

## 2. Конфігурація адресації та базового шляху (SEO-v10 § 1.2)

- **SITE_ORIGIN**: `https://alik532ua.github.io`
- **SITE_BASE**: `/VetCrew` (у production-збірці; порожній рядок у локальній розробці)
- **paths.relative**: `false` (гарантує абсолютні шляхи при гідрації)

## 3. Реєстр префіксів сховища (STORAGE-NAMESPACE-v10 § 1)

Сайт розміщено на спільному домені `alik532ua.github.io`, тому всі ключі веб-сховища мають суворий унікальний префікс.

| Поле                      | Значення       |
| ------------------------- | -------------- |
| **PROJECT_PREFIX**        | `vetcrew_`     |
| **STORAGE_PREFIX (prod)** | `vetcrew_`     |
| **STORAGE_PREFIX (dev)**  | `vetcrew-dev_` |

### Реєстр ключів сховища

| Ключ (без префікса) | Повний ключ у сховищі | Призначення                | Дозволені значення  |
| ------------------- | --------------------- | -------------------------- | ------------------- |
| `theme`             | `vetcrew_theme`       | Тема оформлення інтерфейсу | `'dark'`, `'light'` |
| `lang`              | `vetcrew_lang`        | Мова інтерфейсу            | `'uk'`, `'en'`      |

## 4. Канали взаємодії

1. **Instagram**: `https://www.instagram.com/vet.crew/`
2. **Donate**: `https://vet-crew-donation.org`
3. **Info**: Модальне діалогове вікно та тултіп з повідомленням про стадію розробки

## 5. Інтерфейс та Модульне розширення

- **Hero Logo**: Центральний акцент на динамічному 3D логотипі з відстеженням миші та гіроскопа, спекулярним відблиском та дихаючою анімацією.
- **Дії**: Інтерактивні кнопки дій (Instagram, Donate, Info) та панель системних перемикачів (мова, тема, повноекранний режим).
- **Масштабування ініціатив (`src/lib/data/initiatives.ts`)**: Модульний реєстр проєктів та кампаній організації (`InitiativeItem`) із підтримкою категорій (`rescue`, `rehabilitation`, `sanctuary`, `education`, `biodiversity`), двомовного опису, метрик впливу та часових орієнтирів. Нові ініціативи підключаються декларативно без зміни логіки рендерингу.
- **Екосистемна маршрутизація**: Центральний хаб агрегує переходи до спеціалізованих сервісів екосистеми Vet Crew (`VetCrewHospital` та `VetCrewEmergency`) зі збереженням мовного контексту та спільних префіксів сховища.

## 6. Пошукова оптимізація та безпека (SEO-v10 & SECURITY-v10 § 6.3.1)

- **Single Ownership метаданих (SEO-v10 § 4.1 & § 4.4)**: `app.html` містить лише глобальні OG/Theming теги, а `<title>`, `<meta name="description">`, `canonical`, `og:url`, `og:title`, `og:description` керуються на рівні сторінки `src/routes/+page.svelte`.
- **Файли індексації та AI-сумісності**:
  - `static/robots.txt`: керує правами ботів та вказує шлях до `sitemap.xml`.
  - `static/sitemap.xml`: індексує публічний головний портал.
  - `static/llms.txt`: стандартизований маніфест вмісту сайту для AI пошукових агентів (офіційні канали, посилання).
- **Структуровані дані Schema.org (SEO-v10 § 3 & SECURITY-v10 § 5.3)**:
  - Головна сторінка розмічена схемою типу `NGO` (назва, посилання на соцмережі та платформу донатів).
  - Вставка здійснюється через компонент `src/lib/components/JsonLd.svelte` та функцію `jsonLdScript()` (`src/lib/security/jsonLd.ts`), що екранує небезпечні символи (`<`, `>`, `&`, Unicode-розділювачі) для запобігання XSS.
- **Content-Security-Policy (CSP) sha256-хешування (SECURITY-v10 § 6.3.1)**:
  - `svelte.config.js` автоматично обчислює SHA-256 хеші для всіх інлайн-скриптів у `src/app.html` із нормалізацією CRLF -> LF для сумісності з розбором HTML у браузері.
  - Інваріант перевіряється юніт-тестами `src/csp-hash.test.ts` та `src/security.test.ts`.

## 7. Стандарти якості коду та CI/CD (CODE-QUALITY-v10 & CI-CD-AND-TOOLS-v10)

- **TypeScript Strictness (CODE-QUALITY-v10 § 1.1)**:
  - `"strict": true`
  - `"noUncheckedIndexedAccess": true`
  - `"noImplicitReturns": true`
- **Лінтинг та форматування (CODE-QUALITY-v10 § 1.2)**:
  - ESLint 9+ Flat Config (`eslint.config.js`) із плагінами `typescript-eslint`, `eslint-plugin-svelte`, `eslint-config-prettier`.
  - Prettier (`.prettierrc`) із підтримкою форматування синтаксису Svelte 5 (`prettier-plugin-svelte`).
  - Команди перевірки: `npm run lint` (`lint:format` + `lint:code`), `npm run format`.
- **Архітектурні рішення (ADR)**:
  - `docs/adr/0001-main-portal-3d-canvas.md` (векторна сітка 970, 3D-фізика, доступність, канали допомоги).
- **CI/CD Автоматизація**:
  - GitHub Actions Workflow (`.github/workflows/deploy.yml`) запускається при `push` та `pull_request` до гілки `main`.
  - Розділені завдання найменших привілеїв: `build` (`permissions: contents: read`) та `deploy` (`permissions: pages: write, id-token: write`).
  - Обов'язкові кроки перевірки: `npm run audit:ci`, `npm run check`, `npm run lint`, `npm run test:unit`, `npm run build`.
  - Автоматичне оновлення залежностей через Dependabot (`.github/dependabot.yml`).
- **Тестування та надійність**:
  - Юніт-тести Vitest (`npm run test:unit`): 13 файлів (перевірка CSP, security, сховища, hotkeys, logService, версіонування).
  - End-to-end та доступність: Playwright (`playwright.config.ts`, `tests/main.spec.ts`) з інтеграцією `@axe-core/playwright` для верифікації WCAG 2.2 AA.

## 8. Обробка помилок та Error Boundaries (ERROR-HANDLING-v10 § 2.2)

- **Клієнтський обробник помилок (`src/hooks.client.ts`)**:
  - Перехоплює неперехоплені клієнтські помилки роутингу, завантаження модулів і рендеру.
  - Логує контекст помилки через `logService.error('app', 'Unhandled client error', { message, status, route })`.
  - Реалізує автоматичне перезавантаження на свіжу сторінку при виявленні застарілих/зниклих чанків (`chunkMissing` + `reloadOnce`).
- **Межа рендеру помилок Svelte 5 (`<svelte:boundary>`)**:
  - Усі сторінки в `src/routes/+layout.svelte` огорнуті в `<svelte:boundary>`.
  - У разі виникнення помилки рендеру показується компонент `src/lib/components/ErrorFallback.svelte`.
- **Фірмова сторінка помилок (`src/routes/+error.svelte`)**:
  - Відображає статуси 404 та неочікувані помилки у фірмовому стилі Vet Crew.
  - Підтримка темної та світлої тем і двомовності UA/EN.
  - Містить кнопку повернення на головну сторінку та канали допомоги (Donate, Instagram).

## 9. Доступність (ACCESSIBILITY-v10 § 7)

- **Підтримка `prefers-reduced-motion`**:
  - У `src/lib/components/VetCrewLogo.svelte` цикл 3D-нахилу автоматично зупиняє розгойдування та динамічні зміщення елементів при ввімкненні системного налаштування зниження руху.
  - У `src/app.css` визначено глобальні правила мінімізації тривалості анімацій і переходів.

## 10. Мобільна PWA інтеграція (PWA-v10)

- **Маніфест (`static/manifest.webmanifest`)**:
  - Містить метадані встановлюваного веб-додатка (`name`, `short_name: "Vet Crew"`, `theme_color: "#598f3a"`, `background_color: "#070e09"`).
  - У `src/app.html` підключено теги `manifest`, `apple-touch-icon`, `mobile-web-app-capable`, `apple-mobile-web-app-capable` та `apple-mobile-web-app-title`.

## 11. Доступність фокусу (ACCESSIBILITY-v10 § 3)

- **Кільця фокусування (`:focus-visible`)**:
  - У `src/app.css` визначено видимий висококонтрастний золотий контур (`outline: 2px solid var(--brand-gold); outline-offset: 3px`) для всіх кнопок і посилань при навігації з клавіатури (WCAG 2.2 AA).

## 12. Версіонування та Stale-Build захист (VERSIONING-v10 § 1–6)

- **Модель «бамп на коміт»**:
  - `scripts/bump-version.mjs` піднімає patch-версію `+0.0.1` на чистому Node ESM без дочірніх процесів `npm`, синхронізуючи `package.json`, `package-lock.json`, `static/app-version.json` та `src/lib/config/version.ts`.
  - `.husky/pre-commit` автоматично викликає бамп перед створенням коміту.
- **Stale-Build Recovery**:
  - `version: { pollInterval: 60000 }` у `svelte.config.js` періодично опитує сервер про наявність нової версії.
  - `beforeNavigate` у `src/routes/+layout.svelte` переводить перехід на свіже завантаження (`freshLoad` із `cache: 'reload'`), якщо на сервері вже є новий деплой.

## 13. Міжпроєктна екосистема Vet Crew (I18N-v10 § 3)

- **Таблиця споріднених сайтів (`src/lib/siblings.ts`)**:
  - Містить реєстр 9 взаємопов'язаних веб-додатків (`VetCrewEmergency`, `vetcrewgames`, `vetcrew`, `digitalworkshop`, `cv`, `mindstep`, `slovko`, `as5`, `teatralo4ka`).
  - Утиліти `resolveSiblingLocale` та `siblingUrl` гарантують передачу мови користувача (`UK`/`EN`).

## 14. Організація структури коду (PROJECT-STRUCTURE-v10 § 4.1 & § 7)

- **Канонічний розподіл `src/lib/`**:
  - `src/lib/controllers/`: реактивні класи стану на базі Svelte 5 Runes (`lang.svelte.ts`, `theme.svelte.ts`).
  - `src/lib/config/`: системні константи та налаштування середовища (`version.ts`).
  - `src/lib/data/`: статичні типізовані реєстри даних (`initiatives.ts` — благодійні програми, місії порятунку та метрики впливу), що гарантують легку масштабованість порталу.
  - `src/lib/security/`: безпека даних та екранування (`jsonLd.ts`).
  - `src/lib/services/`: нереактивні сервіси та адаптери (`storage.ts`, `fullscreen.ts`, `logService.svelte.ts`).
  - `src/lib/utils/`: чисті допоміжні функції (`staleBuild.ts`).
  - `src/lib/siblings.ts`: навігація між сайтами екосистеми.

## 15. Опціональні критерії інженерного та продуктового пакетів

| Критерій | Застосовано | Причина / Локація |
| :--- | :---: | :--- |
| **I18N** | Так | Двомовність UA/EN, `src/lib/controllers/lang.svelte.ts` |
| **DEPENDENCIES** | Так | Регулярний аудит, Dependabot, `scripts/check-audit.js` |
| **VERSIONING** | Так | `__APP_VERSION__`, `scripts/bump-version.mjs` |
| **ACCESSIBILITY** | Так | WCAG 2.2 AA, `:focus-visible`, `prefers-reduced-motion` |
| **STORAGE-NAMESPACE** | Так | Префікс `vetcrew_`, `src/lib/services/storage.ts` |
| **ERROR-HANDLING** | Так | `<svelte:boundary>`, stale-build захист у `hooks.client.ts` |
| **SECURITY-SCAN** | Так | `src/security.test.ts`, `src/csp-hash.test.ts` |

## 16. Свідомі відхилення від канону

1. **Гібридне векторне 3D-лого замість важких WebGL-текстур**:
   - *Причина*: Використання векторних SVG-пафів із псевдо-3D перспективною матрицею дає швидкість завантаження < 50мс та 0 МБ сторонніх 3D-моделей (GLTF).
2. **Зовнішні платіжні шлюзи замість локальних форм карткових оплат**:
   - *Причина*: Усуває ризики компрометації платіжних даних (PCI DSS) та спрямовує донати безпосередньо у перевірений фонд.
