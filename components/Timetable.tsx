"use client";
// Timetable pieces shared by Today and the Updates side pane (system.md v3 §4).
import { Icon } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { minutes, type Row, wib, withGaps } from "@/lib/today";

type T = ReturnType<typeof useT>["t"];

/** "1h 40m" / "1j 40m" */
export const dur = (t: T, min: number) =>
  [min >= 60 && t("dur.h", { n: Math.floor(min / 60) }), min % 60 > 0 && t("dur.m", { n: min % 60 })].filter(Boolean).join(" ");
export const cancelled = (r: Row) => r.update?.kind === "absent";
export const moved = (r: Row) => (r.update?.kind === "room_change" && r.update.newRoom ? r.update.newRoom : null);

/** Rows with free-time gap rows between them. */
export function Timetable({ rows }: { rows: Row[] }) {
  const { t } = useT();
  return (
    <ol className="border-t border-line">
      {withGaps(rows).map((r) => ("gap" in r
        ? <li key={r.key} className="border-b border-line bg-bg-2 py-1.5 pr-4 pl-20 text-sm text-muted">
            {t("row.gap", { s: r.gap[0], e: r.gap[1], len: dur(t, minutes(r.gap[0], r.gap[1])) })}
          </li>
        : <TimetableRow key={r.key} row={r} />))}
    </ol>
  );
}

const at = (d: Date) => wib(d).time;

export function NowBand({ row }: { row: Row }) {
  const { t } = useT();
  const room = moved(row);
  return (
    <section aria-label={t("now.label")} className="border-b border-line bg-primary-soft px-4 pt-3.5 pb-4">
      <p className="flex justify-between gap-2 text-sm text-muted">
        <span>{t("now.label")}</span>
        <b className="font-fig font-semibold text-primary">{t("now.until", { time: row.end })}</b>
      </p>
      <p className="mt-0.5 font-fig text-[44px] leading-[1.05] font-bold tracking-[-0.01em]">
        {room ? <span className="mk">{room}</span> : row.slot.room}
      </p>
      <p className="text-[17px] font-semibold">{row.cls.courseName}</p>
      <p className="text-sm text-muted"><span className="font-fig">{row.cls.courseCode}</span> · {row.cls.lecturer}</p>
      {room && row.update && (
        <p className="mt-2 text-sm">
          {/* {was} is left in the string by t() and replaced by the struck-out old room. */}
          {t("now.movedBy", { by: row.update.createdByName ?? "", at: at(row.update.createdAt) }).split("{was}")
            .flatMap((part, i) => (i ? [<s key="was" className="text-muted">{row.slot.room}</s>, part] : [part]))}
        </p>
      )}
    </section>
  );
}

function TimetableRow({ row }: { row: Row }) {
  const { t } = useT();
  const { cls, slot, update, state } = row;
  const off = cancelled(row), room = moved(row);
  const muted = state === "past" ? "text-muted font-medium" : "";
  return (
    <li className={`grid grid-cols-[52px_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-0.5 border-b border-line px-4 py-2.5 ${state === "now" && !off ? "bg-primary-soft" : ""}`}>
      <div className={`font-fig text-lg leading-tight font-semibold tabular-nums ${muted}`}>
        {row.start}
        <span className="block text-[15px] font-medium text-muted">{row.end}</span>
        <span className="mt-0.5 block text-[13px] font-medium text-muted">{dur(t, minutes(row.start, row.end))}</span>
      </div>
      <div className="min-w-0">
        <p className={`leading-snug font-semibold ${muted} ${off ? "line-through decoration-[1.5px]" : ""}`}>{cls.courseName}</p>
        {off ? (
          <>
            <p className="text-sm font-semibold text-danger">{t(cls.type === "lab" ? "row.absentAssistant" : "row.absentLecturer")}</p>
            <p className="mt-px text-sm text-muted">
              {update?.note && <>“{update.note}” · </>}{update?.createdByName && `${update.createdByName}, `}<span className="font-fig">{update && at(update.createdAt)}</span>
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">
            {room ? <><span className="mk">{room}</span> <s>{slot.room}</s></> : slot.room}
            {" · "}<span className="font-fig text-[15px]">{cls.courseCode}</span>
            {cls.type !== "lecture" && ` · ${t(`type.${cls.type}`)}`} · {t("sec", { s: cls.section })}
          </p>
        )}
      </div>
      {off ? <span className="inline-flex items-center gap-1 pt-px text-sm font-semibold whitespace-nowrap text-danger"><Icon name="x" className="size-3.5" />{t("row.cancelled")}</span>
        : state === "now" ? <span className="pt-px text-sm font-semibold text-primary">{t("now.label")}</span>
        : state === "next" ? <span className="pt-px text-sm font-semibold text-primary">{t("row.next")}</span>
        : <span />}
    </li>
  );
}
