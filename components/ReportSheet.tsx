"use client";
// v3 "Report change" sheet (screens.md §7 behaviour, v3 layout): class, kind (Cancelled / Room moved),
// session (today's or next pre-selected, next one, other date), new room, note.
import { useRef, useState } from "react";
import { createUpdate } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { shortDate, upcomingSessions, wib } from "@/lib/today";
import type { CampusClass, UpdateKind } from "@/lib/types";
import { abBtn } from "./AppBar";
import { canEdit, useSession } from "./Session";
import ClassPicker, { radio, radioRow, soonestClass } from "./ClassPicker";
import { btnPrimary, Icon, Segmented, Sheet, Spinner } from "./ui";

const lab = "mb-1.5 block text-[15px] font-semibold";
const field = "min-h-12 w-full rounded-lg border-[1.5px] border-line-strong bg-bg px-3 py-2.5";
const input = `${field} text-base`;
const err = "mt-1.5 text-sm font-semibold text-danger";

/** "Today" / "Tomorrow" / "Mon 30 Nov" for a campus date. */
export function useDayWord() {
  const { t, lang } = useT();
  return (date: string, now: Date) =>
    date === wib(now).date ? t("date.today")
      : date === wib(new Date(now.getTime() + 864e5)).date ? t("date.tomorrow")
      : shortDate(new Date(`${date}T12:00:00+07:00`), lang);
}

/** Mount only while open: each opening starts with a fresh form. */
export default function ReportSheet({ classes, initialClassId, onClose, onPosted }:
  { classes: CampusClass[]; initialClassId?: string; onClose: () => void; onPosted: () => void }) {
  const { t } = useT();
  const { user } = useSession();
  const dayWord = useDayWord();
  const [now] = useState(() => new Date());
  const [classId, setClassId] = useState(() => initialClassId && classes.some((c) => c.id === initialClassId) ? initialClassId : soonestClass(classes, now));
  const [kind, setKind] = useState<UpdateKind | "">("");
  const [session, setSession] = useState("0");
  const [other, setOther] = useState("");
  const [room, setRoom] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [postError, setPostError] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const cls = classes.find((c) => c.id === classId)!;
  const sessions = upcomingSessions(cls, now, 2);
  const today = wib(now).date;
  const max = wib(new Date(now.getTime() + 30 * 864e5)).date;

  const submit = async () => {
    const date = session === "other" ? other : sessions[+session]?.date;
    const errs: Record<string, string> = {};
    if (!kind) errs.kind = t("report.errKind");
    if (!date) errs.date = t("report.errDate");
    if (kind === "room_change" && !room.trim()) errs.room = t("report.errRoom");
    setErrors(errs);
    if (Object.keys(errs).length) {
      box.current?.querySelector<HTMLElement>(`#r-${Object.keys(errs)[0]} input, #r-${Object.keys(errs)[0]} button, input#r-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setSaving(true); setPostError(false);
    try {
      await createUpdate({ classId, kind: kind as UpdateKind, date: date!, ...(kind === "room_change" && { newRoom: room.trim() }), note: note.trim(), createdBy: user.uid });
      onPosted();
      onClose();
    } catch { setPostError(true); setSaving(false); }
  };

  return (
    <Sheet open onClose={onClose} title={t("report.title")}>
      <div ref={box} className="flex flex-col gap-[18px]">
        {classes.length > 1
          ? <ClassPicker classes={classes} value={classId} onChange={(v) => { setClassId(v); setSession("0"); }} label={t("updates.class")} labelClass={lab} />
          : <p className="-mt-2 text-sm text-muted"><b className="text-ink">{cls.courseName}</b> · <span className="font-fig">{cls.courseCode}</span> · {t("sec", { s: cls.section })}</p>}
        <div id="r-kind">
          <span className={lab}>{t("report.kind")}</span>
          <Segmented label={t("report.kind")} value={kind as UpdateKind} onChange={(k) => { setKind(k); setErrors((e) => ({ ...e, kind: "" })); if (k === "room_change") setTimeout(() => box.current?.querySelector<HTMLElement>("#r-room")?.focus()); }}
            options={[["absent", t("update.cancelled")], ["room_change", t("update.moved")]]} />
          {errors.kind && <p className={err}>{errors.kind}</p>}
        </div>
        <fieldset id="r-date">
          <legend className={lab}>{t("report.session")}</legend>
          <div className="border-t border-line">
            {sessions.map((s, i) => (
              <label key={s.date + s.start} className={radioRow}>
                <input type="radio" name="session" checked={session === String(i)} onChange={() => setSession(String(i))} className={radio} />
                <span className="font-fig">{dayWord(s.date, now)} {s.start}–{s.end}</span>
              </label>
            ))}
            <label className={radioRow}>
              <input type="radio" name="session" checked={session === "other"} onChange={() => setSession("other")} className={radio} />
              {t("report.other")}
            </label>
          </div>
          {session === "other" && (
            <input type="date" aria-label={t("report.other")} min={today} max={max} value={other} onChange={(e) => setOther(e.target.value)} className={`${input} mt-2.5`} />
          )}
          {errors.date && <p className={err}>{errors.date}</p>}
        </fieldset>
        {kind === "room_change" && (
          <div>
            <label htmlFor="r-room" className={lab}>{t("report.room")}</label>
            <input id="r-room" value={room} onChange={(e) => setRoom(e.target.value)} maxLength={100} enterKeyHint="send"
              className={`${field} font-fig text-2xl font-bold`} aria-invalid={!!errors.room} />
            {errors.room && <p className={err}>{errors.room}</p>}
          </div>
        )}
        <div>
          <label htmlFor="r-note" className={lab}>{t("report.note")}</label>
          <input id="r-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className={input} />
        </div>
        <div>
          {postError && <p role="alert" className="mb-2 text-sm font-semibold text-danger">{t("report.errPost")}</p>}
          <button onClick={submit} disabled={saving} aria-busy={saving} className={btnPrimary}>
            {saving && <Spinner />}{cls.studentCount ? t("report.send", { n: cls.studentCount }) : t("report.sendPlain")}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

/** App-bar "Report change" button for editors, with its sheet. Renders nothing for students. */
export function ReportButton({ classes, initialClassId, onPosted }: { classes: CampusClass[]; initialClassId?: string; onPosted: () => void }) {
  const { t } = useT();
  const { user, role } = useSession();
  const [open, setOpen] = useState(false);
  const mine = classes.filter((c) => canEdit(c, user.uid, role));
  if (!mine.length) return null;
  return (
    <>
      <button onClick={() => setOpen(true)} className={abBtn}><Icon name="plus" className="size-[18px]" />{t("report.action")}</button>
      {open && <ReportSheet classes={mine} initialClassId={initialClassId} onClose={() => setOpen(false)} onPosted={onPosted} />}
    </>
  );
}

/** "Posted" confirmation shown for 4 s after a report (screens.md §7). */
export function usePosted() {
  const [posted, setPosted] = useState(false);
  const show = () => { setPosted(true); setTimeout(() => setPosted(false), 4000); };
  return [posted, show] as const;
}
