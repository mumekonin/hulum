"use client";

import { useSyncExternalStore } from "react";
import { THEME_EVENT, THEME_KEY } from "./theme-script";

export type Theme = "light" | "dark";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : "light";
}

export function setTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.add("theme-settle");
  window.requestAnimationFrame(() => {
    root.dataset.theme = theme;
    window.setTimeout(() => root.classList.remove("theme-settle"), 320);
  });
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage disabled: the theme still applies for this page view.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme, () => "light");
}
