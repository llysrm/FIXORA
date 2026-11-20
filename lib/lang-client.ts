import { LANG_COOKIE } from "./constants";

export function setLangCookie(lang: "en" | "id") {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
