"use client";
import GoogleButton from "@/components/GoogleButton";
import { LangLink, Wordmark } from "@/components/TopBar";
import { useT } from "@/lib/i18n";

// v3 Login: wordmark + language on top; title, one sentence, Google button and hint at the bottom.
// SessionGate routes away from here once signed in.
export default function LoginPage() {
  const { t } = useT();
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center justify-between border-b border-line p-4"><Wordmark /><LangLink /></div>
      <div className="mt-auto p-4">
        <h1 className="text-[26px] leading-tight font-bold">{t("login.title")}</h1>
        <p className="mt-1.5 text-muted">{t("login.body")}</p>
      </div>
      <div className="px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <GoogleButton />
        <p className="mt-2 mb-1.5 text-center text-sm text-muted">{t("login.hint")}</p>
      </div>
    </div>
  );
}
