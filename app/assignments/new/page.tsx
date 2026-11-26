"use client";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { canEdit, useSession } from "@/components/Session";
import { btnPrimary, EmptyState, ErrorState, Icon, Segmented, SkeletonRows, Spinner, stickyBar } from "@/components/ui";
import { createAssignment, listClasses } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { at } from "@/lib/schedule";
import { shortDate, upcomingSessions, wib } from "@/lib/today";
import type { CampusClass } from "@/lib/types";

const field = "mt-[18px] first:mt-0";
const lab = "mb-1.5 block text-[15px] font-semibold";
const input = "min-h-12 w-full rounded-lg border-[1.5px] border-line-strong bg-bg px-3 py-2.5 text-base";
const err = "mt-1.5 text-sm font-semibold text-danger";
type Pick = "next" | "week" | "other";

// Next keeps visited pages alive in a hidden <Activity>; remount on hide so each visit starts with an empty form.
export default function NewAssignmentPage() {
  const [visit, setVisit] = useState(0);
  useLayoutEffect(() => () => setVisit((v) => v + 1), []);
  return <NewAssignment key={visit} />;
}

// v3 New assignment (screens.md §9): class, title, due quick picks with a WIB read-back, instructions, one link.
function NewAssignment() {
  const { t, lang } = useT();
  const { user, role, profile } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<CampusClass[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [pick, setPick] = useState<Pick | "">("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("23:59");
  const [instructions, setInstructions] = useState("");
  const [link, setLink] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  const load = () => {
    listClasses().then((all) => {
      const mine = all.filter((c) => profile?.classIds.includes(c.id) && canEdit(c, user.uid, role));
      setClasses(mine);
      if (mine.length) setClassId(mine[0].id);
    }, () => setLoadError(true));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps -- once per visit

  const cls = classes?.find((c) => c.id === classId);
  // Quick picks fill date + time; "Other date" leaves them editable (inputs are campus time, WIB).
  const choose = (p: Pick) => {
    setPick(p);
    const now = new Date();
    if (p === "next" && cls) {
      const s = upcomingSessions(cls, now, 2).find((x) => at(x.date, x.start) > now);
      if (s) { setDate(s.date); setTime(s.start); }
    } else if (p === "week") { setDate(wib(new Date(now.getTime() + 7 * 864e5)).date); setTime("23:59"); }
  };
  const dueAt = date && time ? at(date, time) : null;
  const dirty = !!(title || instructions || link || date);
  const close = () => { if (!dirty || confirm(t("editor.discard"))) router.push("/assignments"); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const l = link.trim();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = t("editor.errTitle");
    if (!dueAt) errs.due = t("editor.errDue");
    else if (dueAt < new Date()) errs.due = t("editor.errPast");
    if (l && !/^https?:\/\/\S+$/.test(l)) errs.link = t("editor.errLink");
    setErrors(errs);
    if (Object.keys(errs).length) {
      // Focus the first field with an error (the due block: its date input or first quick pick).
      const k = Object.keys(errs)[0];
      const f = form.current;
      (k === "due" ? f?.querySelector<HTMLElement>("#due input") ?? f?.querySelector<HTMLElement>("#due button") : f?.querySelector<HTMLElement>(`[name="${k}"]`))?.focus();
      return;
    }
    setSaving(true); setSaveError(false);
    try {
      const a = await createAssignment({ classId, title: title.trim(), instructions: instructions.trim(), links: l ? [l] : [], dueAt: dueAt!, createdBy: user.uid });
      router.push(`/assignments/${a.id}?saved`);
    } catch { setSaveError(true); setSaving(false); }
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex min-h-[70px] items-center gap-1.5 bg-head px-4 pt-3.5 pb-3 text-on-head">
        <button onClick={close} className="-ml-2.5 grid size-11 place-items-center">
          <Icon name="x" /><span className="sr-only">{t("common.close")}</span>
        </button>
        <h1 className="text-[22px] font-bold">{t("editor.newTitle")}</h1>
      </header>
      {loadError ? <ErrorState onRetry={() => { setLoadError(false); load(); }} />
        : !classes ? <SkeletonRows n={4} h="h-12" />
        : !classes.length ? <EmptyState title={t("editor.notAllowed")} />
        : (
          <form ref={form} onSubmit={submit} noValidate className="flex flex-1 flex-col">
            <div className="p-4">
              <div className={field}>
                <span className={lab}>{t("editor.class")}</span>
                {classes.length === 1 ? <p><span className="font-fig font-semibold">{classes[0].courseCode}</span> · {classes[0].courseName} · {t("sec", { s: classes[0].section })}</p>
                  : <Segmented label={t("editor.class")} value={classId} onChange={(v) => { setClassId(v); if (pick === "next") setPick(""); }}
                      options={classes.map((c) => [c.id, <><span className="font-fig">{c.courseCode}</span>&nbsp;· {c.section}</>])} />}
              </div>
              <div className={field}>
                <label htmlFor="title" className={lab}>{t("editor.title")}</label>
                <input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className={input}
                  aria-invalid={!!errors.title} aria-describedby={errors.title && "title-err"} />
                {errors.title && <p id="title-err" className={err}>{errors.title}</p>}
              </div>
              <fieldset id="due" className={field}>
                <legend className={lab}>{t("editor.due")}</legend>
                <Segmented label={t("editor.due")} value={pick as Pick} onChange={choose}
                  options={[...(cls?.slots.length ? [["next", t("new.next")] as [Pick, string]] : []), ["week", t("new.week")], ["other", t("new.other")]]} />
                {pick === "other" && (
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    <label><span className="sr-only">{t("editor.date")}</span>
                      <input type="date" value={date} min={wib(new Date()).date} onChange={(e) => setDate(e.target.value)} className={input} /></label>
                    <label><span className="sr-only">{t("editor.time")}</span>
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={input} /></label>
                  </div>
                )}
                {dueAt && <p className="mt-1.5 font-fig text-sm font-semibold">{t("editor.readback", { date: shortDate(dueAt, lang), time })}</p>}
                {errors.due && <p className={err}>{errors.due}</p>}
              </fieldset>
              <div className={field}>
                <label htmlFor="ins" className={lab}>{t("editor.instructions")}</label>
                <textarea id="ins" rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={2000} className={`${input} resize-none`} />
              </div>
              <div className={field}>
                <label htmlFor="link" className={lab}>{t("editor.link")}</label>
                <input id="link" name="link" type="url" inputMode="url" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} className={input}
                  aria-invalid={!!errors.link} />
                {errors.link && <p className={err}>{errors.link}</p>}
              </div>
            </div>
            <div className={stickyBar}>
              {saveError && <p role="alert" className="text-sm font-semibold text-danger">{t("editor.errSave")}</p>}
              <button type="submit" disabled={saving} aria-busy={saving} className={btnPrimary}>
                {saving && <Spinner />}{cls?.studentCount ? t("new.post", { n: cls.studentCount }) : t("editor.post")}
              </button>
            </div>
          </form>
        )}
    </div>
  );
}
