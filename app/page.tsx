"use client";
import Image from "next/image";
import GoogleButton from "@/components/GoogleButton";
import { LangLink, Wordmark } from "@/components/TopBar";
import { useT } from "@/lib/i18n";
import today from "@/public/today-screenshot.jpg";

// CO-38 landing (screens.md v3 "Landing"): signed-out only; SessionGate sends signed-in users to /today.
// CO-39: "Release notes" opens CHANGELOG.md on GitHub; hidden until NEXT_PUBLIC_REPO_URL is set (no remote yet).
const repo = process.env.NEXT_PUBLIC_REPO_URL?.replace(/\/+$/, "");
export default function Landing() {
  const { t } = useT();
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center justify-between border-b border-line p-4 lg:px-10"><Wordmark /><LangLink /></div>
      {/* ≥ 1024 (screens.md v3): text left, screenshot right. */}
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6 lg:grid lg:max-w-5xl lg:flex-1 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16 lg:px-10">
        <div className="flex flex-col gap-5">
          <h1 className="text-[28px] leading-tight font-bold text-balance lg:text-[44px]">{t("land.headline")}</h1>
          <p className="max-w-[46ch] text-[17px] text-muted">{t("land.body")}</p>
          <div className="lg:max-w-sm"><GoogleButton label="land.cta" /></div>
          {repo && (
            <a href={`${repo}/blob/main/CHANGELOG.md`} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center self-center text-[15px] font-semibold text-primary underline underline-offset-3 lg:self-start">{t("land.changelog")}</a>
          )}
        </div>
        <div className="flex justify-center">
          <div className="w-[260px] overflow-hidden rounded-[30px] border-[6px] border-ink bg-bg dark:border-line-strong">
            <Image src={today} alt={t("land.shot")} sizes="248px" priority placeholder="empty" />
          </div>
        </div>
      </div>
      <footer className="mt-auto border-t border-line px-4 py-3.5 text-sm text-muted lg:px-10">{t("land.footer")}</footer>
    </div>
  );
}
