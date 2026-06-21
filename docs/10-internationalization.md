# Internationalization

The application supports **English** and **Vietnamese** via URL-based locale routing:

| URL         | Locale     |
| ----------- | ---------- |
| `/en/login` | English    |
| `/vi/login` | Vietnamese |

Navigating to `/` or `/login` redirects to the browser's preferred locale (falls back to `en`).

Translation files live in `apps/web/messages/{en,vi}.json`. All UI strings — labels, placeholders, error messages, navigation — are fully translated.

A **Language Switcher** in the header allows manual locale selection without reloading authentication state.
