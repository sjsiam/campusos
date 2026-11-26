"use client";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useSession } from "@/components/Session";
import { btnPrimary, btnSecondary, EmptyState, ErrorState, Icon, SkeletonRows, Spinner, stickyBar } from "@/components/ui";
import { listClasses, saveProfile } from "@/lib/data";
import { enablePush, pushState } from "@/lib/push";
import { useT, type MessageKey } from "@/lib/i18n";
import { locale } from "@/lib/today";
import type { CampusClass, Lang } from "@/lib/types";

const DAY_SHORT = (lang: Lang, day: number) =>
  new Intl.DateTimeFormat(locale(lang), { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2026, 0, 4 + day))); // 2026-01-04 is a Sunday
// Push time of the "starts in 30 min" reminder.
const before30 = (t: string) => { const m = (+t.slice(0, 2) * 60 + +t.slice(3) - 30 + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
const h2 = "text-[22px] leading-tight font-bold";
const radioRow = "flex min-h-[52px] items-center gap-3 border-b border-line";
const radio = "size-5 shrink-0 appearance-none rounded-full border-2 border-line-strong checked:border-[6px] checked:border-primary";

// Next keeps visited pages alive in a hidden <Activity>; remount the wizard on hide so each visit starts fresh.
export default function OnboardingPage() {
  const [visit, setVisit] = useState(0);
  useLayoutEffect(() => () => setVisit((v) => v + 1), []);
  return <Onboarding key={visit} />;
}

function Onboarding() {
  const { user, profile, setProfile } = useSession();
  // "Change classes" from Today: only step 2, then back. Fixed at mount; saving step 2 sets classIds.
  const [editing] = useState(() => !!profile?.classIds?.length);
  const [step, setStep] = useState(editing ? 2 : 1);
  const router = useRouter();
  // First picked class, for the sample notification on step 3.
  const [sample, setSample] = useState<CampusClass>();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex min-h-[70px] items-center gap-1.5 bg-head px-4 pt-3.5 pb-3 text-on-head">
        {(editing || step > 1) && (
          <button onClick={() => (editing ? router.push("/today") : setStep(step - 1))} className="-ml-2.5 grid size-11 place-items-center">
            <Icon name="back" /><StepText k="common.back" sr />
          </button>
        )}
        <h1 className="text-[17px] font-semibold">{editing ? <StepText k="acc.classes" /> : <StepText k="onb.step" n={step} />}</h1>
      </header>
      {step === 1 && <LangStep onNext={() => setStep(2)} />}
      {step === 2 && (
        <ClassesStep
          initial={profile?.classIds ?? []}
          editing={editing}
          onSave={async (classIds, lang, first) => {
            const p = { name: user.displayName ?? "", lang, classIds, fcmTokens: profile?.fcmTokens ?? [] };
            await saveProfile(user.uid, { name: p.name, lang, classIds });
            setProfile(p);
            setSample(first);
            // Editing classes skips the reminders step.
            if (editing) router.push("/today");
            else setStep(3);
          }}
        />
      )}
      {step === 3 && <RemindStep sample={sample} onDone={() => router.push("/today")} />}
    </div>
  );
}

function StepText({ k, n, sr }: { k: MessageKey; n?: number; sr?: boolean }) {
  const { t } = useT();
  return <span className={sr ? "sr-only" : undefined}>{t(k, { n: n ?? "" })}</span>;
}

function LangStep({ onNext }: { onNext: () => void }) {
  const { t, lang, setLang } = useT();
  // First visit: follow the browser language.
  useEffect(() => {
    try { if (!localStorage.getItem("lang")) setLang(navigator.language.startsWith("id") ? "id" : "en"); } catch {}
  }, [setLang]);
  const options: [Lang, string][] = [["en", "English"], ["id", "Bahasa Indonesia"]];
  return (
    <>
      <div className="p-4">
        <h2 className={h2}>{t("onb.langTitle")}</h2>
        <p className="mt-1.5 text-muted" lang={lang === "en" ? "id" : "en"}>{lang === "en" ? "Pilih bahasa" : "Choose your language"}</p>
      </div>
      <fieldset className="mx-4 border-t border-line">
        <legend className="sr-only">{t("onb.langTitle")}</legend>
        {options.map(([value, label]) => (
          <label key={value} lang={value} className={radioRow}>
            <input type="radio" name="lang" value={value} checked={lang === value} onChange={() => setLang(value)} className={radio} />
            {label}
          </label>
        ))}
      </fieldset>
      <div className={stickyBar}>
        <button onClick={onNext} className={btnPrimary}>{t("onb.continue")}</button>
      </div>
    </>
  );
}

function ClassesStep({ initial, editing, onSave }: { initial: string[]; editing: boolean; onSave: (ids: string[], lang: Lang, first?: CampusClass) => Promise<void> }) {
  const { t, lang } = useT();
  const [classes, setClasses] = useState<CampusClass[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [picked, setPicked] = useState(() => new Set(initial));
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const load = () => { listClasses().then(setClasses, () => setLoadError(true)); };
  useEffect(load, []);

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const match = (classes ?? []).filter((c) => `${c.courseCode} ${c.courseName}`.toLowerCase().includes(needle));
    const byCode = new Map<string, CampusClass[]>();
    for (const c of match.sort((a, b) => a.courseCode.localeCompare(b.courseCode) || a.section.localeCompare(b.section)))
      byCode.set(c.courseCode, [...(byCode.get(c.courseCode) ?? []), c]);
    return [...byCode.values()];
  }, [classes, q]);

  const toggle = (id: string) => setPicked((s) => { const n = new Set(s); if (!n.delete(id)) n.add(id); return n; });
  const save = async () => {
    setSaving(true); setSaveError(false);
    // Drop ids of classes that no longer exist (e.g. after the real timetable replaces the sample).
    const ids = [...picked].filter((id) => classes?.some((c) => c.id === id));
    const first = classes?.find((c) => ids.includes(c.id) && c.slots.length);
    try { await onSave(ids, lang, first); }
    catch { setSaveError(true); setSaving(false); }
  };
  const count = [...picked].filter((id) => classes?.some((c) => c.id === id)).length;

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <h2 className={h2}>{t("onb.classesTitle")}</h2>
        <p className="mt-1.5 text-muted">{t("onb.classesBody")}</p>
        {classes && classes.length > 0 && (
          <label className="relative mt-3 block">
            <span className="sr-only">{t("onb.search")}</span>
            <Icon name="search" className="absolute top-3.5 left-3 size-5 text-muted" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("onb.search")}
              className="min-h-12 w-full rounded-lg border-[1.5px] border-line-strong bg-bg py-2.5 pr-3 pl-10 text-base" />
          </label>
        )}
      </div>
      {loadError ? <ErrorState onRetry={() => { setLoadError(false); load(); }} />
        : !classes ? <SkeletonRows n={4} h="h-9" />
        : !classes.length ? <EmptyState title={t("onb.noClasses")} />
        : (
          <>
            {!groups.length && <p className="mt-6 px-4 text-center text-muted">{t("onb.noMatch", { q })}</p>}
            {groups.map((g) => (
              <fieldset key={g[0].courseCode}>
                <legend className="px-4 pt-3.5 pb-1 font-bold">
                  <span className="font-fig">{g[0].courseCode}</span> <span className="font-normal text-muted">{g[0].courseName}</span>
                </legend>
                <div className="mx-4 border-t border-line">
                  {g.map((c) => (
                    <label key={c.id} className={radioRow}>
                      <span className="relative grid size-5 shrink-0 place-items-center">
                        <input type="checkbox" checked={picked.has(c.id)} onChange={() => toggle(c.id)}
                          className="peer size-5 appearance-none rounded border-2 border-line-strong checked:border-primary checked:bg-primary" />
                        <Icon name="check" className="pointer-events-none absolute hidden size-3.5 text-on-primary peer-checked:block" />
                      </span>
                      <span>
                        {t("sec", { s: c.section })} · {t(`type.${c.type}`)}
                        {c.slots.length > 0 && <> · <span className="font-fig">{c.slots.map((s) => `${DAY_SHORT(lang, s.day)} ${s.start}`).join(" · ")}</span></>}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <div className={`${stickyBar} mt-4`}>
              {saveError && <p role="alert" className="text-sm font-semibold text-danger">{t("onb.saveError")}</p>}
              <button onClick={save} disabled={!count || saving} aria-busy={saving} className={btnPrimary}>
                {saving && <Spinner />}{editing ? t("common.save") : t(count === 1 ? "onb.count.one" : "onb.count", { n: count })}
              </button>
            </div>
          </>
        )}
    </>
  );
}

function RemindStep({ sample, onDone }: { sample?: CampusClass; onDone: () => void }) {
  const { t } = useT();
  const { user } = useSession();
  const state = pushState();
  const otherIosBrowser = state === "install" && /CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
  // iPhone Safari tab: explain Add to Home Screen instead of asking (never skipped).
  const showInstall = state === "install";
  const [busy, setBusy] = useState(false);
  const turnOn = () => { setBusy(true); enablePush(user.uid).finally(onDone); };

  const slot = sample?.slots[0];
  return (
    <>
      <div className="p-4">
        <h2 className={h2}>{t("onb.remindTitle")}</h2>
        <p className="mt-1.5">{t("onb.remindBody")}</p>
      </div>
      {otherIosBrowser ? <p className="mx-4 rounded-[10px] border border-line-strong p-3 text-[15px]">{t("install.useSafari")}</p>
        : showInstall ? (
          <div className="mx-4 rounded-[10px] border border-line-strong p-3 text-[15px]">
            <p className="font-semibold">{t("install.title")}</p>
            <ol className="mt-2 flex list-decimal flex-col gap-2.5 pl-5">
              <li>{t("install.step1")}</li><li>{t("install.step2")}</li><li>{t("install.step3")}</li>
            </ol>
          </div>
        ) : sample && slot && (
          // The real notification it will send (push texts: lib/schedule.ts, screens.md §11).
          <div aria-hidden className="mx-4 grid grid-cols-[34px_1fr] gap-x-2.5 rounded-2xl bg-bg-2 px-3 py-2.5">
            <span className="row-span-3 grid size-[34px] place-items-center rounded-lg bg-head font-fig text-[13px] font-bold text-on-head">C</span>
            <span className="flex justify-between text-xs text-muted"><span>CampusOS</span><span className="font-fig">{before30(slot.start)}</span></span>
            <span className="text-[15px] font-bold">{t("push.classSoon.title", { code: sample.courseCode })}</span>
            <span className="text-[15px]">{t("push.classSoon.body", { course: sample.courseName, start: slot.start, room: slot.room })}</span>
          </div>
        )}
      <div className={stickyBar}>
        {state === "default" && <button onClick={turnOn} disabled={busy} aria-busy={busy} className={btnPrimary}>{busy && <Spinner />}{t("onb.remindOn")}</button>}
        <button onClick={onDone} className={btnSecondary}>{t("onb.notNow")}</button>
      </div>
    </>
  );
}
