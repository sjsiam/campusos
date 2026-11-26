"use client";
import { useEffect, useSyncExternalStore } from "react";
import en from "@/messages/en.json";
import id from "@/messages/id.json";
import type { Lang } from "./types";

export type MessageKey = keyof typeof en;
const messages: Record<Lang, Record<MessageKey, string>> = { en, id };

// Lang is a per-device preference in localStorage; server renders English, client switches after hydration.
const listeners = new Set<() => void>();
const read = (): Lang => {
  try { return localStorage.getItem("lang") === "id" ? "id" : "en"; } catch { return "en"; }
};
const subscribe = (cb: () => void) => (listeners.add(cb), () => listeners.delete(cb));

export function setLang(l: Lang) {
  try { localStorage.setItem("lang", l); } catch {}
  document.documentElement.lang = l;
  listeners.forEach((cb) => cb());
}

export function useT() {
  const lang = useSyncExternalStore(subscribe, read, () => "en" as Lang);
  // The server renders <html lang="en">; match it to the saved language after load (screen readers).
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  // t("due.hours", { n: 5 }) fills "{n}" placeholders.
  const t = (k: MessageKey, vars?: Record<string, string | number>) =>
    (messages[lang][k] ?? messages.en[k]).replace(/\{(\w+)\}/g, (m, v) => String(vars?.[v] ?? m));
  return { lang, setLang, t };
}
