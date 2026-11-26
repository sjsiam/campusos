"use client";
import { useCallback, useEffect, useState } from "react";
import AppBar from "@/components/AppBar";
import { readSeen, SEEN_KEY } from "@/components/BottomNav";
import { ReportButton, usePosted } from "@/components/ReportSheet";
import { useSession } from "@/components/Session";
import { Timetable } from "@/components/Timetable";
import UpdateItem from "@/components/UpdateItem";
import { EmptyState, ErrorState, Notice, OfflineBanner, paneHead, SkeletonRows } from "@/components/ui";
import { listClasses, listUpdates } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { buildTimeline, shortDate, wib } from "@/lib/today";
import type { CampusClass, ClassUpdate } from "@/lib/types";


// v3 Updates: app bar (with the rep action) + update items, newest first; unread tinted.
// ≥ 768 (CO-37): feed beside today's timetable (320px; 380px and a 720px reading width ≥ 1024).
export default function UpdatesPage() {
  const { t, lang } = useT();
  const { user, profile } = useSession();
  const [data, setData] = useState<{ classes: CampusClass[]; updates: ClassUpdate[] } | null>(null);
  const [error, setError] = useState(false);
  const [posted, showPosted] = usePosted();
  const [now] = useState(() => new Date());
  // Items newer than the last visit are "New"; opening the page marks everything seen.
  const [seenAt] = useState(readSeen);
  useEffect(() => { try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch {} }, []);

  const classIds = profile?.classIds;
  const load = useCallback(() => {
    if (!classIds) return;
    Promise.all([listClasses(), listUpdates(classIds)]).then(
      ([all, updates]) => setData({ classes: all.filter((c) => classIds.includes(c.id)), updates }),
      () => setError(true),
    );
  }, [classIds]);
  useEffect(load, [load]);

  // Sessions more than 7 days ago are hidden to keep the feed short.
  const since = wib(new Date(now.getTime() - 7 * 864e5)).date;
  const items = data?.updates.filter((u) => u.date >= since) ?? [];
  const w = wib(now);
  const rows = data ? buildTimeline(data.classes, data.updates, w.date, w.day, w.time) : [];
  return (
    <div className="md:grid md:flex-1 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="md:border-r md:border-line">
      <AppBar title={t("nav.updates")}
        action={data && <ReportButton classes={data.classes} onPosted={() => { showPosted(); load(); }} />} />
      <p className="border-b border-line px-4 py-2 text-sm text-muted">{t("updates.trust")}</p>
      {!error && <OfflineBanner />}
      {posted && <Notice>{t("report.posted")}</Notice>}
      {error ? <ErrorState onRetry={() => { setError(false); load(); }} />
        : !data ? <SkeletonRows n={3} h="h-24" />
        : !items.length ? <EmptyState title={t("updates.empty")} body={t("updates.emptyBody")} />
        : <ul className="lg:max-w-[720px]">{items.map((u) => {
            const cls = data.classes.find((c) => c.id === u.classId);
            return cls && <UpdateItem key={u.id} u={u} cls={cls} now={now} isNew={u.createdBy !== user.uid && u.createdAt.getTime() > seenAt} />;
          })}</ul>}
      </div>
      {data && (
        <aside aria-labelledby="tt-h" className="hidden md:block">
          <div className={paneHead}><h2 id="tt-h" className="text-lg font-bold">{t("nav.today")}, {shortDate(now, lang)}</h2></div>
          {rows.length ? <Timetable rows={rows} /> : <p className="border-y border-line px-4 py-3 text-muted">{t("today.empty")}</p>}
        </aside>
      )}
    </div>
  );
}
