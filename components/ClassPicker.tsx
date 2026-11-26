"use client";
// Class choice for editors (Report change, New assignment). Up to 3 classes: segmented control; more (admins,
// reps of many classes): a radio list like "Which session", one row per class, the name truncated to one line.
import { useT } from "@/lib/i18n";
import { upcomingSessions } from "@/lib/today";
import type { CampusClass } from "@/lib/types";
import { Segmented } from "./ui";

export const radioRow = "flex min-h-[52px] items-center gap-3 border-b border-line";
export const radio = "size-5 shrink-0 appearance-none rounded-full border-2 border-line-strong checked:border-[6px] checked:border-primary";

/** The class in progress now, else the one meeting next (within two weeks); falls back to the first. */
export function soonestClass(classes: CampusClass[], now: Date): string {
  const key = (c: CampusClass) => { const s = upcomingSessions(c, now, 1)[0]; return s ? `${s.date} ${s.start}` : "~"; };
  return classes.reduce((best, c) => (key(c) < key(best) ? c : best), classes[0]).id;
}

export default function ClassPicker({ classes, value, onChange, label, labelClass }:
  { classes: CampusClass[]; value: string; onChange: (id: string) => void; label: string; labelClass: string }) {
  const { t } = useT();
  if (classes.length <= 3) return (
    <div>
      <span className={labelClass}>{label}</span>
      <Segmented label={label} value={value} onChange={onChange}
        options={classes.map((c) => [c.id, <><span className="font-fig">{c.courseCode}</span>&nbsp;· {c.section}</>])} />
    </div>
  );
  return (
    <fieldset className="min-w-0">{/* a fieldset defaults to min-width: min-content, which blocks the truncation */}
      <legend className={labelClass}>{label}</legend>
      <div className="border-t border-line">
        {classes.map((c) => (
          <label key={c.id} className={radioRow}>
            <input type="radio" name="class" checked={value === c.id} onChange={() => onChange(c.id)} className={radio} />
            <span className="flex min-w-0 flex-1 gap-1 whitespace-nowrap">
              <span className="shrink-0 font-fig font-semibold">{c.courseCode}</span>·
              <span className="min-w-0 truncate">{c.courseName}</span>
              <span className="shrink-0 text-muted">· {t("sec", { s: c.section })}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
