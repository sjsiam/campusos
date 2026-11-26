"use client";
// App bar (system.md v3 §4): title, language switch, avatar → Account sheet; row 2 = summary + the page's one action.
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { signOut } from "@/lib/auth";
import { listClasses, saveProfile } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { enablePush, pushState, type PushState } from "@/lib/push";
import type { Lang } from "@/lib/types";
import { useSession } from "./Session";
import { btnText, Icon, Segmented, Sheet } from "./ui";

/** Switches the UI language and saves it to the profile so push texts follow it (screens.md §10). */
function useSwitchLang() {
  const { setLang } = useT();
  const { user, profile, setProfile } = useSession();
  return (l: Lang) => {
    setLang(l);
    if (!profile || profile.lang === l) return;
    setProfile({ ...profile, lang: l });
    saveProfile(user.uid, { lang: l }).catch(console.error); // best effort: the local switch already happened
  };
}

export const abBtn = "inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg border border-on-head-muted px-3 text-[15px] font-semibold";

export default function AppBar({ title, summary, action, back }: { title: string; summary?: string; action?: ReactNode; back?: string }) {
  const { t, lang } = useT();
  const { user } = useSession();
  const switchLang = useSwitchLang();
  const [account, setAccount] = useState(false);
  return (
    <header className="flex flex-col gap-1.5 bg-head px-4 pt-3.5 pb-3 text-on-head">
      <div className="flex min-h-11 items-center gap-1.5">
        {back && (
          <Link href={back} className="-ml-2.5 grid size-11 place-items-center">
            <Icon name="back" /><span className="sr-only">{t("common.back")}</span>
          </Link>
        )}
        <h1 className="min-w-0 flex-1 text-[22px] leading-tight font-bold">{title}</h1>
        <button onClick={() => switchLang(lang === "en" ? "id" : "en")} lang={lang === "en" ? "id" : "en"}
          className="min-h-11 min-w-11 px-1.5 text-[15px] font-semibold underline underline-offset-3">
          {t("lang.code")}
        </button>
        <button onClick={() => setAccount(true)} aria-label={t("acc.open")}
          className="grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-on-head-muted font-bold">
          {(user.displayName || user.email || "?").trim()[0].toUpperCase()}
        </button>
      </div>
      {(summary || action) && (
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-sm text-on-head-muted">{summary}</span>
          {action}
        </div>
      )}
      <AccountSheet open={account} onClose={() => setAccount(false)} />
    </header>
  );
}

/** Reminders row (screens.md §10, short form): status, plus "Turn on" while the browser can still ask. */
function RemindRow({ open }: { open: boolean }) {
  const { t } = useT();
  const { user } = useSession();
  const [after, setState] = useState<PushState>(); // result of tapping "Turn on"
  const state = after ?? (open ? pushState() : "unsupported");
  const text = { install: "acc.remindInstall", unsupported: "acc.remindNone", default: "acc.remindOff", granted: "acc.remindOn", denied: "acc.remindBlocked" } as const;
  return (
    <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-3 border-b border-line py-1.5">
      <span>{t("acc.remind")}</span>
      {state === "default"
        ? <button onClick={() => enablePush(user.uid).then(setState)} className={btnText}>{t("rem.on")}</button>
        : <span className="text-[15px] text-muted">{t(text[state])}</span>}
      {state === "denied" && <p className="w-full pb-1 text-sm text-muted">{t("acc.howBlocked")}</p>}
    </div>
  );
}

function AccountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useT();
  const { user, profile } = useSession();
  const switchLang = useSwitchLang();
  const { role } = useSession();
  // Role line, e.g. "class rep TKE-205": the classes this user can post for.
  const [editing, setEditing] = useState<string[]>([]);
  useEffect(() => {
    if (open) listClasses().then((cs) => setEditing(cs.filter((c) => profile?.classIds.includes(c.id) && c.editors.includes(user.uid)).map((c) => c.courseCode)), () => {});
  }, [open, profile, user.uid]);
  // shortcut: one role per user (the custom claim; editors without one read as class rep). A per-class role needs a schema field.
  const roleWord = t(`role.${role === "student" ? "classrep" : role}`);
  const roleLine = role === "admin" ? roleWord : editing.length ? `${roleWord} ${[...new Set(editing)].join(", ")}` : "";
  const row = "flex min-h-14 items-center justify-between gap-3 border-b border-line";
  return (
    <Sheet open={open} onClose={onClose} title={t("acc.title")}>
      <p className="font-bold">{user.displayName}</p>
      <p className="mb-3 text-sm break-all text-muted">{user.email}{roleLine && <> · {roleLine}</>}</p>
      <div className="border-t border-line">
        <Link href="/onboarding" onClick={onClose} className={row}>
          <span>{t("acc.classes")}</span>
          <span className="text-[15px] text-muted">{t(profile?.classIds.length === 1 ? "acc.classCount.one" : "acc.classCount", { n: profile?.classIds.length ?? 0 })} ›</span>
        </Link>
        <div className={row}>
          <span>{t("acc.lang")}</span>
          <Segmented label={t("acc.lang")} value={lang} onChange={switchLang} className="w-[170px] [&>button]:min-h-11"
            options={[["en", "EN", "en"], ["id", "ID", "id"]]} />
        </div>
        <RemindRow open={open} />
      </div>
      <button onClick={() => { onClose(); signOut(); }} className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[10px] border-[1.5px] border-danger bg-bg px-4 font-semibold text-danger">{t("acc.out")}</button>
    </Sheet>
  );
}
