"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AppBar from "@/components/AppBar";
import DeadlineRow from "@/components/DeadlineRow";
import RemindNotice from "@/components/RemindNotice";
import { ReportButton, usePosted } from "@/components/ReportSheet";
import { useSession } from "@/components/Session";
import { cancelled, moved, NowBand, Timetable } from "@/components/Timetable";
import { readSeen } from "@/components/BottomNav";
import UpdateItem from "@/components/UpdateItem";
import { EmptyState, ErrorState, Notice, OfflineBanner, paneHead, sectionLabel, SkeletonRows } from "@/components/ui";
import { listAssignments, listClasses, listUpdates } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { buildTimeline, dueSoon, shortDate, wib } from "@/lib/today";
import type { Assignment, CampusClass, ClassUpdate } from "@/lib/types";

interface Data { classes: CampusClass[]; updates: ClassUpdate[]; assignments: Assignment[] }
// v3 Today: app bar → now band (only during a class) → timetable with gap rows → due soon (2 rows).
// ≥ 768 (CO-37): Today pane (400px) beside a pane with this week's changes and due soon (3 rows).
export default function TodayPage() {
  const { t, lang } = useT();
  const { user, profile } = useSession();
  const [seenAt] = useState(readSeen);
  const [now, setNow] = useState(() => new Date());
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const [posted, showPosted] = usePosted();

  // Now/past styling re-evaluates every minute; no live clock.
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(id); }, []);

  const classIds = profile?.classIds;
  const load = useCallback(() => {
    if (!classIds) return;
    Promise.all([listClasses(), listUpdates(classIds), listAssignments(classIds)]).then(
      ([all, updates, assignments]) => setData({ classes: all.filter((c) => classIds.includes(c.id)), updates, assignments }),
      () => setError(true),
    );
  }, [classIds]);
  useEffect(load, [load]);

  const w = wib(now);
  const rows = data ? buildTimeline(data.classes, data.updates, w.date, w.day, w.time) : [];
  const soon = data ? dueSoon(data.assignments, now) : [];
  // This week = Monday–Sunday in campus time; session dates are "YYYY-MM-DD" so strings compare.
  const off = (w.day + 6) % 7;
  const [mon, sun] = [wib(new Date(now.getTime() - off * 864e5)).date, wib(new Date(now.getTime() + (6 - off) * 864e5)).date];
  const changes = data?.updates.filter((u) => u.date >= mon && u.date <= sun).slice(0, 3) ?? [];
  const code = (classId: string) => data?.classes.find((c) => c.id === classId)?.courseCode ?? "";
  const current = rows.find((r) => r.state === "now" && !cancelled(r));
  const nCancelled = rows.filter(cancelled).length, nMoved = rows.filter(moved).length;
  const summary = data && rows.length ? [
    t(rows.length === 1 ? "today.sumClasses.one" : "today.sumClasses", { n: rows.length }),
    nCancelled && t("today.sumCancelled", { n: nCancelled }),
    nMoved && t("today.sumMoved", { n: nMoved }),
  ].filter(Boolean).join(" · ") : undefined;

  const dueList = (n: number) => (
    <ul className="border-t border-line">
      {soon.slice(0, n).map((a) => <li key={a.id}><DeadlineRow a={a} courseCode={code(a.classId)} now={now} /></li>)}
    </ul>
  );
  const allLink = (href: string) => <Link href={href} className="inline-flex min-h-11 min-w-11 items-center justify-end text-[15px] font-semibold text-primary">{t("today.all")}</Link>;

  return (
    <div className="md:grid md:flex-1 md:grid-cols-[400px_minmax(0,640px)]">
      <div className="md:border-r md:border-line">
        <AppBar title={shortDate(now, lang)} summary={summary}
          action={data && <ReportButton classes={data.classes} initialClassId={rows.find((r) => r.state === "now")?.cls.id} onPosted={() => { showPosted(); load(); }} />} />
        {!error && <OfflineBanner />}
        {posted && <Notice>{t("report.posted")}</Notice>}
        <RemindNotice />
        {current && <NowBand row={current} />}

        <section aria-labelledby="classes-h">
          <h2 id="classes-h" className={`${sectionLabel} px-4 pt-4 pb-1.5`}>{t("nav.today")}</h2>
          {error ? <ErrorState onRetry={() => { setError(false); load(); }} />
            : !data ? <SkeletonRows n={4} h="h-12" />
            : !rows.length ? <EmptyState title={t("today.empty")} body={t("today.emptyBody")} />
            : <Timetable rows={rows} />}
        </section>

        {soon.length > 0 && (
          <section aria-labelledby="due-h" className="mb-3 md:hidden">
            <div className="flex items-baseline justify-between px-4 pt-4 pb-1.5">
              <h2 id="due-h" className={sectionLabel}>{t("today.dueSoon")}</h2>
              {allLink("/assignments")}
            </div>
            {dueList(2)}
          </section>
        )}
      </div>

      {data && (
        <aside className="hidden md:block">
          <section aria-labelledby="changes-h">
            <div className={paneHead}><h2 id="changes-h" className="text-lg font-bold">{t("side.changes")}</h2>{allLink("/updates")}</div>
            {changes.length ? (
              <ul className="border-t border-line">{changes.map((u) => {
                const cls = data.classes.find((c) => c.id === u.classId);
                return cls && <UpdateItem key={u.id} u={u} cls={cls} now={now} isNew={u.createdBy !== user.uid && u.createdAt.getTime() > seenAt} />;
              })}</ul>
            ) : <p className="border-y border-line px-4 py-3 text-muted">{t("updates.empty")}</p>}
          </section>
          {soon.length > 0 && (
            <section aria-labelledby="side-due-h">
              <div className={`${paneHead} mt-2 border-t`}><h2 id="side-due-h" className="text-lg font-bold">{t("today.dueSoon")}</h2>{allLink("/assignments")}</div>
              {dueList(3)}
            </section>
          )}
        </aside>
      )}
    </div>
  );
}
