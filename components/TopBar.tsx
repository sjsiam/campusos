"use client";
// Pieces of the signed-out top bar (Login, landing): wordmark and the full-name language switch.
import { useT } from "@/lib/i18n";
import { btnText } from "./ui";

export const Wordmark = () => <span className="font-fig text-[22px] font-bold tracking-[.01em] text-primary">CampusOS</span>;

export function LangLink() {
  const { t, lang, setLang } = useT();
  return (
    <button onClick={() => setLang(lang === "en" ? "id" : "en")} lang={lang === "en" ? "id" : "en"} className={`${btnText} text-[15px]`}>
      {t("lang.switch")}
    </button>
  );
}
