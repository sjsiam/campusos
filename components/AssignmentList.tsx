"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AppBar, { abBtn } from "@/components/AppBar";
import DeadlineRow from "@/components/DeadlineRow";
import { canEdit, useSession } from "@/components/Session";
import { EmptyState, ErrorState, Icon, OfflineBanner, SkeletonRows } from "@/components/ui";
import { listAssignments, listClasses } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { dueGroup } from "@/lib/today";
import type { Assignment, CampusClass } from "@/lib/types";

const GROUPS = [["overdue", "g.overdue"], ["today", "g.today"], ["week", "g.week"], ["later", "g.later"]] as const;

// v3 Assignments: app bar with "Add" for editors; deadline rows grouped by due. No done tabs (cut for the demo).
// Rendered by app/assignments/layout.tsx so it stays beside the detail pane on tablet/desktop.
/** `onFirst` gets the id of the top row in display order (null for an empty list) after each load. */
export default function AssignmentList({ onFirst }: { onFirst?: (id: string | null) => void }) {
  const { t } = useT();
  const { user, role, profile } = useSession();
  const [data, setData] = useState<{ classes: CampusClass[]; assignments: Assignment[] } | null>(null);
  const [error, setError] = useState(false);
  const [now] = useState(() => new Date());

  const classIds = profile?.classIds;
  const load = useCallback(() => {
    if (!classIds) return;
    Promise.all([listClasses(), listAssignments(classIds)]).then(
      ([all, assignments]) => {
        setData({ classes: all.filter((c) => classIds.includes(c.id)), assignments });
        const first = GROUPS.flatMap(([g]) => assignments.filter((a) => dueGroup(a.dueAt, now) === g))[0];
        onFirst?.(first?.id ?? null);
      },
      () => setError(true),
    );
  }, [classIds, now, onFirst]);
  // Re-fetched on every move inside /assignments so a create or delete shows up in the list pane.
  const path = usePathname();
  useEffect(load, [load, path]);

  const editor = data?.classes.some((c) => canEdit(c, user.uid, role));
  const code = (id: string) => data?.classes.find((c) => c.id === id)?.courseCode ?? "";
  return (
    <>
      <AppBar title={t("nav.assignments")}
        action={editor && <Link href="/assignments/new" className={abBtn}><Icon name="plus" className="size-[18px]" />{t("assign.add")}</Link>} />
      {!error && <OfflineBanner />}
      {error ? <ErrorState onRetry={() => { setError(false); load(); }} />
        : !data ? <SkeletonRows n={4} h="h-12" />
        : !data.assignments.length ? <EmptyState title={t("assignments.empty")} body={t("assignments.emptyBody")} />
        : GROUPS.map(([g, label]) => {
          const items = data.assignments.filter((a) => dueGroup(a.dueAt, now) === g);
          return items.length > 0 && (
            <section key={g} aria-labelledby={`g-${g}`}>
              <h2 id={`g-${g}`} className="border-b border-line px-4 pt-3.5 pb-1.5 text-[15px] font-bold text-muted">{t(label)}</h2>
              <ul>{items.map((a) => <li key={a.id}><DeadlineRow a={a} courseCode={code(a.classId)} now={now} /></li>)}</ul>
            </section>
          );
        })}
    </>
  );
}
