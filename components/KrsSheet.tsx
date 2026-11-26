"use client";
// "Fill from KRS" (onboarding step 2 and Change classes): paste the KRS from SIAKAD, read course codes + Kelas
// on this device (lib/krs.ts) and tick the matching classes. The text never leaves the component: not sent,
// not stored, gone when the sheet closes. The student still reviews the ticks and saves.
import { useState } from "react";
import { parseKrs, type KrsResult } from "@/lib/krs";
import { useT } from "@/lib/i18n";
import type { CampusClass } from "@/lib/types";
import { btnPrimary, Sheet } from "./ui";

/** Mount only while open, so the pasted text is dropped on close. */
export default function KrsSheet({ classes, onClose, onRead }:
  { classes: CampusClass[]; onClose: () => void; onRead: (r: KrsResult) => void }) {
  const { t } = useT();
  const [text, setText] = useState("");
  const [none, setNone] = useState(false);
  const read = () => {
    const r = parseKrs(text, classes);
    if (!r.ids.length && !r.unknown.length) return setNone(true);
    onRead(r);
    onClose();
  };
  return (
    <Sheet open onClose={onClose} title={t("krs.title")}>
      <label htmlFor="krs" className="mb-1.5 block text-[15px] font-semibold">{t("krs.body")}</label>
      <textarea id="krs" value={text} onChange={(e) => { setText(e.target.value); setNone(false); }} rows={7}
        autoComplete="off" autoCorrect="off" spellCheck={false} aria-describedby="krs-private"
        className="w-full rounded-lg border-[1.5px] border-line-strong bg-bg px-3 py-2.5 text-base" />
      <p id="krs-private" className="mt-1 text-sm text-muted">{t("krs.private")}</p>
      {none && <p role="alert" className="mt-2 text-sm font-semibold text-danger">{t("krs.none")}</p>}
      <button onClick={read} disabled={!text.trim()} className={`${btnPrimary} mt-4`}>{t("krs.read")}</button>
    </Sheet>
  );
}
