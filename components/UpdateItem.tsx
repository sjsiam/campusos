"use client";
// Update item (system.md v3 §4): used by the Updates feed and Today's "changes this week" pane.
import { useDayWord } from "@/components/ReportSheet";
import { useSession } from "@/components/Session";
import { Icon } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { shortDate, wib } from "@/lib/today";
import type { CampusClass, ClassUpdate } from "@/lib/types";

export default function UpdateItem({ u, cls, now, isNew }: { u: ClassUpdate; cls: CampusClass; now: Date; isNew: boolean }) {
  const { t, lang } = useT();
  const { user } = useSession();
  const dayWord = useDayWord();
  const slot = cls.slots.find((s) => s.day === wib(new Date(`${u.date}T12:00:00+07:00`)).day);
  const posted = wib(u.createdAt), today = wib(now).date;
  const at = posted.date === today ? posted.time
    : posted.date === wib(new Date(now.getTime() - 864e5)).date ? t("when.yesterday", { time: posted.time })
    : shortDate(u.createdAt, lang);
  const off = u.kind === "absent";
  return (
    <li className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 gap-y-0.5 border-b border-line px-4 py-3 ${isNew ? "bg-bg-2" : ""}`}>
      <span className={`inline-flex items-center gap-1.5 font-bold ${off ? "text-danger" : ""}`}>
        {off && <Icon name="x" className="size-3.5" />}{t(off ? "update.cancelled" : "update.moved")}
        {isNew && <span className="text-[13px] font-bold text-primary">· {t("update.new")}</span>}
      </span>
      <span className="text-right font-fig text-sm whitespace-nowrap text-muted">{at}</span>
      <p className="col-span-full">
        <b className="font-semibold">{cls.courseName}</b> · <span className="font-fig">{cls.courseCode}</span><br />
        <span className="font-fig">{dayWord(u.date, now)}{slot && ` ${slot.start}`}</span>
        {!off && u.newRoom && <> · {slot && <><s className="text-muted">{slot.room}</s> → </>}<span className="mk">{u.newRoom}</span></>}
      </p>
      {u.note && <p className="col-span-full text-[15px]">“{u.note}”</p>}
      {/* Trust rule (QA): the check means the server accepted the post from a class editor or admin (lib/api.ts
          requireEditor). Display names are self-chosen, so nothing here is ever derived from the name. */}
      <p className="col-span-full inline-flex items-center gap-1 text-sm text-muted">
        {u.createdByName}{u.createdBy === user.uid && ` (${t("update.you")})`}
        {" · "}{t("updates.verified", { role: t(`role.${u.createdByRole === "student" || !u.createdByRole ? "classrep" : u.createdByRole}`) })}
        <Icon name="check" className="size-3.5 text-primary" />
      </p>
    </li>
  );
}
