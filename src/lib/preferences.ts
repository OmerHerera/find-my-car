import type { Locale } from "./translations";

const preferencesKey = "find-my-car/preferences";
const legacyLocaleKey = "find-my-car/locale";

export type Preferences = {
  locale: Locale;
  userName: string;
};

export const defaultPreferences: Preferences = {
  locale: "en",
  userName: "",
};

export function loadPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(preferencesKey);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Preferences>;
      return {
        locale: parsed.locale === "he" ? "he" : "en",
        userName: typeof parsed.userName === "string" ? parsed.userName : "",
      };
    }

    const legacyLocale = localStorage.getItem(legacyLocaleKey);
    const preferences: Preferences = {
      ...defaultPreferences,
      locale: legacyLocale === "he" ? "he" : "en",
    };
    if (legacyLocale) savePreferences(preferences);
    return preferences;
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: Preferences) {
  localStorage.setItem(preferencesKey, JSON.stringify(preferences));
  localStorage.removeItem(legacyLocaleKey);
  try {
    // Also write a cookie so the server can render the chosen locale
    const maxAge = 60 * 60 * 24 * 365 * 10; // 10 years
    const locale = preferences.locale === "he" ? "he" : "en";
    document.cookie = `find-my-car-locale=${encodeURIComponent(locale)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  } catch {
    // ignore (document may be unavailable in some environments)
  }
}
