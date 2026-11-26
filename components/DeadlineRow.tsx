"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { countdown, shortDate, wib } from "@/lib/today";
import type { Assignment } from "@/lib/types";

/** "Today, 23:59" / "Fri 27 Nov, 16:00" in campus time. */
export function useDueWhen() {
  const { t, lang } = useT();
  return (due: Date, now: Date) =>
    wib(due).date === wib(now).date ? t("when.today", { time: wib(due).time }) : `${shortDate(due, lang)}, ${wib(due).time}`;
}

// Deadline row (system.md v3 §4): countdown in the gutter, title (never truncated) and "code · when".
export default function DeadlineRow({ a, courseCode, now }: { a: Assignment; courseCode: string; now: Date }) {
  const { t } = useT();
  const when = useDueWhen();
  const cd = countdown(a.dueAt, now);
  const n = t(`cd.${cd.unit}`, { n: cd.n });
  const href = `/assignments/${a.id}`;
  const open = usePathname() === href; // the open assignment in the tablet/desktop list pane
  return (
    <Link href={href} aria-current={open ? "page" : undefined} className="aria-[current=page]:bg-primary-soft grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-3 border-b border-line px-4 py-2.5">
      <div className={`font-fig text-lg leading-tight font-bold tabular-nums ${cd.late ? "text-danger" : cd.far ? "font-semibold text-muted" : ""}`}>
        {cd.late ? t("cd.late") : n}
        <span className="block text-sm font-medium text-muted">{cd.late ? n : t("cd.left")}</span>
      </div>
      <div>
        <p className="leading-snug font-semibold">{a.title}</p>
        <p className="text-sm text-muted"><span className="font-fig">{courseCode}</span> · <span className="font-fig">{when(a.dueAt, now)}</span></p>
      </div>
    </Link>
  );
}
