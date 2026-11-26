"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AppBar from "@/components/AppBar";
import { useDueWhen } from "@/components/DeadlineRow";
import { canEdit, useSession } from "@/components/Session";
import { btnDangerText, btnText, EmptyState, ErrorState, Icon, Notice, SkeletonRows, Spinner } from "@/components/ui";
import { deleteAssignment, listAssignments, listClasses } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { countdown, shortDate } from "@/lib/today";
import type { Assignment, CampusClass } from "@/lib/types";

const label = "px-4 pt-4 pb-1.5 text-[15px] font-bold text-muted";

// v3 Assignment detail: course line, title, big countdown + due line, instructions, links, poster, delete for editors.
export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const saved = useSearchParams().has("saved");
  const { t, lang } = useT();
  const { user, role, profile } = useSession();
  const router = useRouter();
  const when = useDueWhen();
  const [data, setData] = useState<{ a?: Assignment; cls?: CampusClass } | null>(null);
  const [error, setError] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [now] = useState(() => new Date());

  const classIds = profile?.classIds;
  // shortcut: no single-item endpoint; the list for the user's classes is small. Add GET /api/assignments/[id] if it grows.
  const load = useCallback(() => {
    if (!classIds) return;
    Promise.all([listAssignments(classIds), listClasses()]).then(([as, cs]) => {
      const a = as.find((x) => x.id === id);
      setData({ a, cls: cs.find((c) => c.id === a?.classId) });
    }, () => setError(true));
  }, [classIds, id]);
  useEffect(load, [load]);

  const remove = async () => {
    setDeleting(true); setDeleteError(false);
    try { await deleteAssignment(id); router.push("/assignments"); }
    catch { setDeleteError(true); setDeleting(false); }
  };

  const { a, cls } = data ?? {};
  const cd = a && countdown(a.dueAt, now);
  return (
    <>
      {/* Tablet/desktop: the list pane beside it carries the app bar. */}
      <div className="md:hidden"><AppBar title={t("nav.assignments")} back="/assignments" /></div>
      {error ? <ErrorState onRetry={() => { setError(false); load(); }} />
        : !data ? <SkeletonRows n={3} h="h-14" />
        : !a || !cls || !cd ? <EmptyState title={t("assignments.notFound")} />
        : (
          <article className="md:pt-4">
            {saved && <Notice>{t("editor.saved")}</Notice>}
            <div className="px-4 pt-4 pb-1.5">
              <p className="text-[15px] text-muted"><span className="font-fig">{cls.courseCode}</span> · {cls.courseName} · {t("sec", { s: cls.section })}</p>
              <h2 className="mt-1 text-[22px] leading-tight font-bold">{a.title}</h2>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-3.5 gap-y-0.5 border-b border-line px-4 py-3.5">
              <span className={`row-span-2 font-fig text-[34px] leading-none font-bold ${cd.late ? "text-danger" : ""}`}>{t(`cd.${cd.unit}`, { n: cd.n })}</span>
              <span className="font-semibold">{t("det.due", { when: when(a.dueAt, now) })}</span>
              <span className={`text-[15px] ${cd.late ? "font-semibold text-danger" : "text-muted"}`}>
                {t(cd.late ? "det.late" : "det.left", { n: t(`cd.${cd.unit}`, { n: cd.n }) })}
              </span>
            </div>
            <h3 className={label}>{t("assignments.instructions")}</h3>
            <p className="max-w-[62ch] px-4 whitespace-pre-line">{a.instructions || <span className="text-muted">{t("assignments.noInstructions")}</span>}</p>
            {a.links.length > 0 && (
              <>
                <h3 className={label}>{t("assignments.links")}</h3>
                <ul className="mx-4 border-t border-line">
                  {a.links.filter((l) => /^https?:\/\//.test(l)).map((l) => (
                    <li key={l}>
                      <a href={l} target="_blank" rel="noopener noreferrer" className="flex min-h-[52px] items-center gap-2.5 border-b border-line font-medium break-all text-primary">
                        <Icon name="link" className="size-[18px]" />{l.replace(/^https?:\/\//, "")}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {a.createdByName && (
              <p className="px-4 pt-3 text-sm text-muted">{t("assign.addedBy", {
                by: a.createdByName,
                role: t(`role.${a.createdByRole === "student" || !a.createdByRole ? "classrep" : a.createdByRole}`),
                at: a.createdAt ? shortDate(a.createdAt, lang) : "",
              })}</p>
            )}
            {canEdit(cls, user.uid, role) && (
              <div className="p-4">
                {!confirm ? (
                  <button onClick={() => setConfirm(true)} className={btnDangerText}><Icon name="trash" className="size-[18px]" />{t("assign.delete")}</button>
                ) : (
                  <div role="alertdialog" aria-labelledby="del-q" className="rounded-[10px] border border-danger p-3">
                    <p id="del-q" className="font-semibold">{t("assign.deleteConfirm", { n: cls.studentCount ?? 0 })}</p>
                    {deleteError && <p role="alert" className="mt-1 text-sm font-semibold text-danger">{t("assign.deleteError")}</p>}
                    <div className="mt-2 flex gap-3">
                      <button onClick={remove} disabled={deleting} aria-busy={deleting}
                        className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-danger px-4 font-bold text-bg">{deleting && <Spinner />}{t("assign.deleteYes")}</button>
                      <button onClick={() => setConfirm(false)} className={btnText}>{t("assign.deleteNo")}</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>
        )}
    </>
  );
}
